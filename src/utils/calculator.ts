import {
  CalculationResult,
  LogisticsSettings,
  PlatformFeeConfig,
  PlatformId,
  PricingSettings,
  ProductInfo,
  TaxSettings,
} from '../types';
import { roundCharmPrice } from './formatters';

export function calculateBaseCostPerUnit(product: ProductInfo): number {
  return (
    (product.purchasePrice || 0) +
    (product.inboundShipping || 0) +
    (product.packagingCost || 0) +
    (product.labelPrintingCost || 0) +
    (product.labourCost || 0) +
    (product.storageCost || 0) +
    (product.miscellaneousCost || 0)
  );
}

export function calculateRtoRiskReserve(logistics: LogisticsSettings): number {
  if (!logistics.enableRiskReserve) {
    return 0;
  }

  const returnRate = Math.max(0, (logistics.expectedReturnRatePct || 0) / 100);
  const rtoRate = Math.max(0, (logistics.expectedRtoRatePct || 0) / 100);
  const lossPerReturn = Math.max(0, logistics.additionalLossPerReturn || 0);
  const lossPerRto = Math.max(0, logistics.additionalLossPerRto || 0);

  // Expected non-recoverable loss per placed order
  const rawExpectedLoss = returnRate * lossPerReturn + rtoRate * lossPerRto;

  // Fraction of orders that successfully get delivered and kept
  const successfulRate = Math.max(0.1, 1 - returnRate - rtoRate);

  // Reserve required per successfully kept sale to offset losses from returned/RTO orders
  const reservePerSuccessfulSale = rawExpectedLoss / successfulRate;

  return Math.round(reservePerSuccessfulSale * 100) / 100;
}

interface VariableAndFixedComponents {
  variableFeeRate: number; // Fraction of selling price deducted
  fixedFeesAndCosts: number; // Flat costs in INR
  taxMultiplier: number; // Taxable revenue fraction (1 / (1 + gstRate))
  outputGstFraction: number; // GST fraction of selling price
  recoverableItcRatio: number; // Whether GST on marketplace services is recoverable
}

function analyzeCostCoefficients(
  baseCost: number,
  logisticsCost: number,
  rtoReserve: number,
  platformFee: PlatformFeeConfig,
  tax: TaxSettings
): VariableAndFixedComponents {
  const isGstRegistered = tax.gstStatus === 'registered';
  const gstRate = Math.max(0, (tax.productGstRatePct || 0) / 100);
  const gstServicesRate = Math.max(0, (tax.gstOnServicesPct || 18) / 100);
  const isInclusive = tax.isSellingPriceGstInclusive;

  // Output GST calculations
  const taxMultiplier = isInclusive ? 1 / (1 + gstRate) : 1;
  const outputGstFraction = isGstRegistered ? (isInclusive ? 1 - taxMultiplier : gstRate) : 0;

  // Variable fee rates (as fraction of Selling Price)
  const commissionRate = (platformFee.referralCommissionPct || 0) / 100;
  const collectionRate = (platformFee.collectionFeePct || 0) / 100;
  const adRate = (platformFee.advertisingPctOfPrice || 0) / 100;
  const tcsRate = isGstRegistered ? (tax.tcsTdsPct || 1.0) / 100 * taxMultiplier : 0;

  const variablePlatformServiceFees = commissionRate + collectionRate;

  // GST on marketplace service fees: 18%
  // If registered seller with ITC, this 18% GST is offset against Output GST (so not an additional deadweight cost).
  // If not registered or no ITC, the 18% GST on marketplace services is an unrecoverable real cash expense!
  const itcAvailable = isGstRegistered && tax.inputTaxCreditAvailable;
  const nonRecoverableGstOnServicesMultiplier = itcAvailable ? 0 : gstServicesRate;

  const variableFeeRate =
    variablePlatformServiceFees * (1 + nonRecoverableGstOnServicesMultiplier) +
    adRate +
    tcsRate;

  // Fixed fees and costs
  const fixedMarketplaceServiceFees =
    (platformFee.fixedFee || 0) +
    (platformFee.closingFee || 0) +
    (platformFee.fulfilmentFee || 0) +
    (platformFee.shippingFee || 0) +
    (platformFee.collectionFlatFee || 0) +
    (platformFee.additionalFee || 0);

  const nonRecoverableGstOnFixedFees = fixedMarketplaceServiceFees * nonRecoverableGstOnServicesMultiplier;
  const fixedAdCost = platformFee.advertisingCostPerOrder || 0;
  const otherPlatform = platformFee.otherPlatformExpense || 0;

  const fixedFeesAndCosts =
    baseCost +
    logisticsCost +
    rtoReserve +
    fixedMarketplaceServiceFees +
    nonRecoverableGstOnFixedFees +
    fixedAdCost +
    otherPlatform;

  return {
    variableFeeRate,
    fixedFeesAndCosts,
    taxMultiplier,
    outputGstFraction,
    recoverableItcRatio: itcAvailable ? 1 : 0,
  };
}

/**
 * Solves for the customer selling price given a pricing strategy
 */
export function solveSellingPrice(
  pricing: PricingSettings,
  baseCost: number,
  logisticsCost: number,
  rtoReserve: number,
  platformFee: PlatformFeeConfig,
  tax: TaxSettings
): { price: number; warning?: string } {
  if (pricing.strategy === 'price') {
    const raw = Math.max(0, pricing.proposedSellingPrice || 0);
    return { price: roundCharmPrice(raw, pricing.roundPriceOption) };
  }

  const { variableFeeRate, fixedFeesAndCosts, taxMultiplier } = analyzeCostCoefficients(
    baseCost,
    logisticsCost,
    rtoReserve,
    platformFee,
    tax
  );

  // Net revenue fraction after output GST (for registered sellers)
  const isGstRegistered = tax.gstStatus === 'registered';
  // Net revenue retained before costs:
  // If registered & inclusive: retention = taxMultiplier - variableFeeRate
  // If non-registered: retention = 1 - variableFeeRate
  const retentionFraction = (isGstRegistered ? taxMultiplier : 1) - variableFeeRate;

  if (retentionFraction <= 0.05) {
    return {
      price: Math.max(baseCost * 3, 499),
      warning:
        'Platform fees and taxes account for over 95% of revenue! A sustainable price cannot be determined with these rates.',
    };
  }

  let requiredProfit = 0;

  if (pricing.strategy === 'profit') {
    requiredProfit = Math.max(0, pricing.desiredProfitINR || 0);
    const calculatedPrice = (fixedFeesAndCosts + requiredProfit) / retentionFraction;
    return {
      price: roundCharmPrice(calculatedPrice, pricing.roundPriceOption),
    };
  }

  if (pricing.strategy === 'markup') {
    const markupPct = Math.max(0, pricing.targetMarkupPct || 0) / 100;
    requiredProfit = baseCost * markupPct;
    const calculatedPrice = (fixedFeesAndCosts + requiredProfit) / retentionFraction;
    return {
      price: roundCharmPrice(calculatedPrice, pricing.roundPriceOption),
    };
  }

  if (pricing.strategy === 'margin') {
    // Target margin = Profit / Taxable Revenue
    // Profit = margin * (SellingPrice * taxMultiplier)
    // S * retentionFraction - fixedFeesAndCosts = margin * S * taxMultiplier
    // S * (retentionFraction - margin * taxMultiplier) = fixedFeesAndCosts
    const targetMargin = Math.max(0, pricing.targetMarginPct || 0) / 100;
    const marginDenominator = retentionFraction - targetMargin * (isGstRegistered ? taxMultiplier : 1);

    if (marginDenominator <= 0.02) {
      return {
        price: Math.max(baseCost * 3, 599),
        warning: `Target margin of ${(targetMargin * 100).toFixed(0)}% is too high given platform deductions. Try a lower margin.`,
      };
    }

    const calculatedPrice = fixedFeesAndCosts / marginDenominator;
    return {
      price: roundCharmPrice(calculatedPrice, pricing.roundPriceOption),
    };
  }

  return { price: pricing.proposedSellingPrice || 499 };
}

/**
 * Calculates break-even selling price (where Net Profit = 0)
 */
export function calculateBreakEvenPrice(
  baseCost: number,
  logisticsCost: number,
  rtoReserve: number,
  platformFee: PlatformFeeConfig,
  tax: TaxSettings
): number {
  const { variableFeeRate, fixedFeesAndCosts, taxMultiplier } = analyzeCostCoefficients(
    baseCost,
    logisticsCost,
    rtoReserve,
    platformFee,
    tax
  );

  const isGstRegistered = tax.gstStatus === 'registered';
  const retentionFraction = (isGstRegistered ? taxMultiplier : 1) - variableFeeRate;

  if (retentionFraction <= 0.05) {
    return Math.round(fixedFeesAndCosts / 0.1);
  }

  const breakEven = fixedFeesAndCosts / retentionFraction;
  return Math.round(breakEven * 100) / 100;
}

/**
 * Primary calculation engine for a given platform
 */
export function calculatePlatformProfit(
  platformId: PlatformId,
  platformName: string,
  sellingPrice: number,
  product: ProductInfo,
  logistics: LogisticsSettings,
  platformFee: PlatformFeeConfig,
  tax: TaxSettings
): CalculationResult {
  const isGstRegistered = tax.gstStatus === 'registered';
  const gstRate = Math.max(0, (tax.productGstRatePct || 0) / 100);
  const gstServicesRate = Math.max(0, (tax.gstOnServicesPct || 18) / 100);
  const isInclusive = tax.isSellingPriceGstInclusive;
  const itcAvailable = isGstRegistered && tax.inputTaxCreditAvailable;

  // 1. Taxable Revenue and Customer Output GST
  let customerSellingPrice = Math.max(0, sellingPrice);
  let taxableRevenue = 0;
  let productOutputGst = 0;

  if (isGstRegistered) {
    if (isInclusive) {
      taxableRevenue = customerSellingPrice / (1 + gstRate);
      productOutputGst = customerSellingPrice - taxableRevenue;
    } else {
      taxableRevenue = customerSellingPrice;
      productOutputGst = customerSellingPrice * gstRate;
      customerSellingPrice = taxableRevenue + productOutputGst;
    }
  } else {
    // Non-registered sellers: no output GST charged
    taxableRevenue = customerSellingPrice;
    productOutputGst = 0;
  }

  // 2. Base Product Landed Costs
  const totalBaseCostPerUnit = calculateBaseCostPerUnit(product);

  // 3. Logistics & Shipping
  const logisticsBaseCost =
    (logistics.forwardShippingFee || 0) +
    (logistics.weightSurcharge || 0) +
    (logistics.codCollectionFee || 0) +
    (logistics.otherLogisticsCost || 0);

  // 4. Return & RTO Loss Reserve
  const expectedLossReservePerOrder = calculateRtoRiskReserve(logistics);

  // 5. Platform Fees Breakdown
  const marketplaceReferralFee =
    ((platformFee.referralCommissionPct || 0) / 100) * customerSellingPrice;

  const marketplaceFixedClosingFees =
    (platformFee.fixedFee || 0) + (platformFee.closingFee || 0);

  const marketplaceFulfilmentShipping =
    (platformFee.fulfilmentFee || 0) + (platformFee.shippingFee || 0);

  const marketplaceCollectionFee =
    ((platformFee.collectionFeePct || 0) / 100) * customerSellingPrice +
    (platformFee.collectionFlatFee || 0);

  const marketplaceAdvertisingFee =
    (platformFee.advertisingCostPerOrder || 0) +
    ((platformFee.advertisingPctOfPrice || 0) / 100) * customerSellingPrice;

  const totalMarketplaceFeesBeforeTax =
    marketplaceReferralFee +
    marketplaceFixedClosingFees +
    marketplaceFulfilmentShipping +
    marketplaceCollectionFee +
    (platformFee.additionalFee || 0) +
    (platformFee.otherPlatformExpense || 0);

  // 6. GST on Marketplace Service Fees (18%)
  const gstOnMarketplaceFees = totalMarketplaceFeesBeforeTax * gstServicesRate;

  // 7. Recoverable Input Tax Credit (ITC)
  // If registered & ITC available, GST paid on marketplace fees can be credited against Output GST liability
  const recoverableInputTaxCredit = itcAvailable ? gstOnMarketplaceFees : 0;

  // 8. TCS (Tax Collected at Source - 1% under GST Act for registered sellers)
  const tcsDeduction = isGstRegistered ? taxableRevenue * ((tax.tcsTdsPct || 1.0) / 100) : 0;

  // 9. Total Platform Deductions from Seller Payment
  const totalPlatformDeductions =
    totalMarketplaceFeesBeforeTax +
    gstOnMarketplaceFees +
    marketplaceAdvertisingFee +
    tcsDeduction;

  // 10. Expected Platform Payout deposited in seller bank
  const expectedMarketplacePayout = Math.max(0, customerSellingPrice - totalPlatformDeductions);

  // 11. Net Tax Liability
  // The seller collected `productOutputGst` from the customer, but has ITC from marketplace service fees.
  // Net cash GST remitted to government = productOutputGst - recoverableInputTaxCredit.
  // Note: TCS deducted by marketplace can also be claimed on GST portal as electronic cash ledger credit.
  const netGstToGovt = Math.max(0, productOutputGst - recoverableInputTaxCredit - tcsDeduction);

  // 12. Income Tax Provision (optional)
  const incomeTaxRate = Math.max(0, (tax.incomeTaxProvisionPct || 0) / 100);

  // 13. Total Real Cost per successful sale
  // Cost = Base goods + Logistics + RTO reserve + Platform fees (before GST) + Non-creditable GST on services + Ads + Net GST to govt
  const nonCreditableGstOnServices = itcAvailable ? 0 : gstOnMarketplaceFees;
  const totalCostPerSuccessfulSale =
    totalBaseCostPerUnit +
    logisticsBaseCost +
    expectedLossReservePerOrder +
    totalMarketplaceFeesBeforeTax +
    nonCreditableGstOnServices +
    marketplaceAdvertisingFee +
    netGstToGovt;

  // 14. Net Profit
  // Net profit = Customer Selling Price - Total Cost Per Sale (or Payout - Base Cost - Logistics - RTO - Net GST)
  const grossProfitBeforeIncomeTax = customerSellingPrice - totalCostPerSuccessfulSale;
  const incomeTaxAmount = Math.max(0, grossProfitBeforeIncomeTax * incomeTaxRate);
  const netProfit = grossProfitBeforeIncomeTax - incomeTaxAmount;

  // 15. Margins
  // Margin = Net Profit / Taxable Revenue (excluding output GST)
  const netProfitMarginPct = taxableRevenue > 0 ? (netProfit / taxableRevenue) * 100 : 0;
  // Markup = Net Profit / Total Base Cost
  const markupPct = totalBaseCostPerUnit > 0 ? (netProfit / totalBaseCostPerUnit) * 100 : 0;

  // 16. Break-Even Price
  const breakEvenSellingPrice = calculateBreakEvenPrice(
    totalBaseCostPerUnit,
    logisticsBaseCost,
    expectedLossReservePerOrder,
    platformFee,
    tax
  );

  // 17. Multi-order projections
  const profitOn10Orders = netProfit * 10;
  const profitOn50Orders = netProfit * 50;
  const profitOn100Orders = netProfit * 100;
  const profitOn500Orders = netProfit * 500;

  const isProfitable = netProfit > 0;

  // Visual Breakdown of where the customer's rupee goes
  const breakdown = [
    {
      label: 'Base Product Cost',
      amount: totalBaseCostPerUnit,
      percentage: customerSellingPrice > 0 ? (totalBaseCostPerUnit / customerSellingPrice) * 100 : 0,
      color: '#3b82f6', // blue
    },
    {
      label: 'Prep & Packaging',
      amount: (product.packagingCost || 0) + (product.labelPrintingCost || 0) + (product.labourCost || 0),
      percentage:
        customerSellingPrice > 0
          ? (((product.packagingCost || 0) + (product.labelPrintingCost || 0) + (product.labourCost || 0)) /
              customerSellingPrice) *
            100
          : 0,
      color: '#6366f1', // indigo
    },
    {
      label: 'Platform Commission & Fees',
      amount: totalMarketplaceFeesBeforeTax,
      percentage:
        customerSellingPrice > 0 ? (totalMarketplaceFeesBeforeTax / customerSellingPrice) * 100 : 0,
      color: '#f59e0b', // amber
    },
    {
      label: 'Platform Advertising',
      amount: marketplaceAdvertisingFee,
      percentage:
        customerSellingPrice > 0 ? (marketplaceAdvertisingFee / customerSellingPrice) * 100 : 0,
      color: '#ec4899', // pink
    },
    {
      label: 'RTO & Return Reserve',
      amount: expectedLossReservePerOrder,
      percentage:
        customerSellingPrice > 0 ? (expectedLossReservePerOrder / customerSellingPrice) * 100 : 0,
      color: '#ef4444', // red
    },
    {
      label: 'Net GST & Tax Liability',
      amount: netGstToGovt + nonCreditableGstOnServices + incomeTaxAmount,
      percentage:
        customerSellingPrice > 0
          ? ((netGstToGovt + nonCreditableGstOnServices + incomeTaxAmount) / customerSellingPrice) * 100
          : 0,
      color: '#8b5cf6', // purple
    },
    {
      label: isProfitable ? 'Net Pocket Profit' : 'Net Loss',
      amount: Math.abs(netProfit),
      percentage: customerSellingPrice > 0 ? (Math.abs(netProfit) / customerSellingPrice) * 100 : 0,
      color: isProfitable ? '#10b981' : '#dc2626', // emerald or dark red
    },
  ];

  return {
    platformId,
    platformName,
    customerSellingPrice: Math.round(customerSellingPrice * 100) / 100,
    taxableRevenue: Math.round(taxableRevenue * 100) / 100,
    productOutputGst: Math.round(productOutputGst * 100) / 100,
    totalBaseCostPerUnit: Math.round(totalBaseCostPerUnit * 100) / 100,
    logisticsBaseCost: Math.round(logisticsBaseCost * 100) / 100,
    expectedLossReservePerOrder: Math.round(expectedLossReservePerOrder * 100) / 100,
    marketplaceReferralFee: Math.round(marketplaceReferralFee * 100) / 100,
    marketplaceFixedClosingFees: Math.round(marketplaceFixedClosingFees * 100) / 100,
    marketplaceFulfilmentShipping: Math.round(marketplaceFulfilmentShipping * 100) / 100,
    marketplaceCollectionFee: Math.round(marketplaceCollectionFee * 100) / 100,
    marketplaceAdvertisingFee: Math.round(marketplaceAdvertisingFee * 100) / 100,
    totalMarketplaceFeesBeforeTax: Math.round(totalMarketplaceFeesBeforeTax * 100) / 100,
    gstOnMarketplaceFees: Math.round(gstOnMarketplaceFees * 100) / 100,
    recoverableInputTaxCredit: Math.round(recoverableInputTaxCredit * 100) / 100,
    tcsDeduction: Math.round(tcsDeduction * 100) / 100,
    totalPlatformDeductions: Math.round(totalPlatformDeductions * 100) / 100,
    expectedMarketplacePayout: Math.round(expectedMarketplacePayout * 100) / 100,
    totalCostPerSuccessfulSale: Math.round(totalCostPerSuccessfulSale * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    netProfitMarginPct: Math.round(netProfitMarginPct * 10) / 10,
    markupPct: Math.round(markupPct * 10) / 10,
    breakEvenSellingPrice: Math.round(breakEvenSellingPrice),
    recommendedSellingPrice: Math.round(customerSellingPrice),
    profitOn10Orders: Math.round(profitOn10Orders),
    profitOn50Orders: Math.round(profitOn50Orders),
    profitOn100Orders: Math.round(profitOn100Orders),
    profitOn500Orders: Math.round(profitOn500Orders),
    isProfitable,
    breakdown,
  };
}
