import { PlatformFeeConfig, ProductInfo, LogisticsSettings, TaxSettings, PricingSettings } from '../types';

export const defaultPlatformFees: Record<'meesho' | 'amazon' | 'flipkart', PlatformFeeConfig> = {
  meesho: {
    id: 'meesho',
    name: 'Meesho',
    referralCommissionPct: 0, // Meesho's 0% commission model
    fixedFee: 0,
    closingFee: 0,
    collectionFeePct: 0,
    collectionFlatFee: 0,
    fulfilmentFee: 0,
    shippingFee: 65, // Standard Meesho delivery slab
    additionalFee: 0,
    advertisingCostPerOrder: 15,
    advertisingPctOfPrice: 0,
    gstOnFeesPct: 18,
    otherPlatformExpense: 0,
    notes: 'Meesho is known for 0% commission. Shipping is charged per delivery slab + 18% GST.',
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon India (Easy Ship)',
    referralCommissionPct: 12.0, // Typical category average
    fixedFee: 10,
    closingFee: 20, // Tiered based on price slab
    collectionFeePct: 2.0, // Payment processing fee
    collectionFlatFee: 0,
    fulfilmentFee: 15, // Handling & pick-pack
    shippingFee: 74, // Standard 500g national Easy Ship
    additionalFee: 0,
    advertisingCostPerOrder: 35,
    advertisingPctOfPrice: 0,
    gstOnFeesPct: 18,
    otherPlatformExpense: 0,
    notes: 'Amazon Easy Ship charges referral commission, closing fee, shipping, pick-pack, and 18% GST.',
  },
  flipkart: {
    id: 'flipkart',
    name: 'Flipkart (Marketplace)',
    referralCommissionPct: 11.0,
    fixedFee: 16,
    closingFee: 0,
    collectionFeePct: 2.0,
    collectionFlatFee: 0,
    fulfilmentFee: 12,
    shippingFee: 69, // Standard 500g national
    additionalFee: 0,
    advertisingCostPerOrder: 30,
    advertisingPctOfPrice: 0,
    gstOnFeesPct: 18,
    otherPlatformExpense: 0,
    notes: 'Flipkart charges referral fees, fixed fee slab, shipping, payment collection, and 18% GST.',
  },
};

export interface DemoPreset {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  product: ProductInfo;
  pricing: PricingSettings;
  logistics: LogisticsSettings;
  tax: TaxSettings;
  platformFees: Record<'meesho' | 'amazon' | 'flipkart', PlatformFeeConfig>;
}

export const demoPresets: DemoPreset[] = [
  {
    id: 'cotton-kurti',
    name: "Women's Cotton Printed Kurti",
    nameBn: 'মহিলাদের কটন প্রিন্টেড কুর্তি',
    category: 'Clothing & Apparel',
    product: {
      name: "Women's Cotton Printed Kurti",
      sku: 'KURTI-COT-001',
      category: 'Clothing & Apparel',
      weight: 280,
      weightUnit: 'g',
      purchasePrice: 210,
      inboundShipping: 8,
      packagingCost: 9,
      labelPrintingCost: 2,
      labourCost: 5,
      storageCost: 0,
      miscellaneousCost: 0,
      inventoryUnits: 50,
    },
    pricing: {
      strategy: 'price',
      proposedSellingPrice: 549,
      desiredProfitINR: 120,
      targetMarginPct: 22,
      targetMarkupPct: 50,
      isPriceGstInclusive: true,
      roundPriceOption: '9',
    },
    logistics: {
      forwardShippingFee: 0, // Handled by platform
      weightSurcharge: 0,
      codCollectionFee: 0,
      returnShippingFee: 0,
      reverseLogisticsFee: 0,
      rtoCostPerOrder: 0,
      damagedLossPerReturn: 0,
      returnHandlingCost: 0,
      otherLogisticsCost: 0,
      enableRiskReserve: true,
      expectedReturnRatePct: 14, // Apparel has higher return rate
      expectedRtoRatePct: 9,
      additionalLossPerReturn: 95, // Reverse courier + plastic bag + iron
      additionalLossPerRto: 75,
    },
    tax: {
      gstStatus: 'registered',
      productGstRatePct: 5, // Apparel <= ₹1000 is 5% GST in India
      isSellingPriceGstInclusive: true,
      inputTaxCreditAvailable: true,
      gstOnServicesPct: 18,
      incomeTaxProvisionPct: 0,
      tcsTdsPct: 1.0,
    },
    platformFees: JSON.parse(JSON.stringify(defaultPlatformFees)),
  },
  {
    id: 'bluetooth-neckband',
    name: 'Wireless Bluetooth Neckband Earphones',
    nameBn: 'ওয়্যারলেস ব্লুটুথ নেকব্যান্ড হেডফোন',
    category: 'Electronics & Audio',
    product: {
      name: 'Wireless Bluetooth Neckband Earphones',
      sku: 'AUDIO-BT-902',
      category: 'Electronics & Audio',
      weight: 220,
      weightUnit: 'g',
      purchasePrice: 380,
      inboundShipping: 10,
      packagingCost: 18,
      labelPrintingCost: 3,
      labourCost: 6,
      storageCost: 2,
      miscellaneousCost: 0,
      inventoryUnits: 30,
    },
    pricing: {
      strategy: 'price',
      proposedSellingPrice: 899,
      desiredProfitINR: 180,
      targetMarginPct: 24,
      targetMarkupPct: 45,
      isPriceGstInclusive: true,
      roundPriceOption: '9',
    },
    logistics: {
      forwardShippingFee: 0,
      weightSurcharge: 0,
      codCollectionFee: 0,
      returnShippingFee: 0,
      reverseLogisticsFee: 0,
      rtoCostPerOrder: 0,
      damagedLossPerReturn: 0,
      returnHandlingCost: 0,
      otherLogisticsCost: 0,
      enableRiskReserve: true,
      expectedReturnRatePct: 7,
      expectedRtoRatePct: 8,
      additionalLossPerReturn: 140,
      additionalLossPerRto: 85,
    },
    tax: {
      gstStatus: 'registered',
      productGstRatePct: 18, // Electronics 18% GST
      isSellingPriceGstInclusive: true,
      inputTaxCreditAvailable: true,
      gstOnServicesPct: 18,
      incomeTaxProvisionPct: 0,
      tcsTdsPct: 1.0,
    },
    platformFees: JSON.parse(JSON.stringify(defaultPlatformFees)),
  },
  {
    id: 'kitchen-containers',
    name: '4-Piece Airtight Kitchen Storage Containers',
    nameBn: '৪-পিস এয়ারটাইট রান্নাঘরের স্টোরেজ বক্স',
    category: 'Home & Kitchen',
    product: {
      name: '4-Piece Airtight Kitchen Storage Containers',
      sku: 'HOME-CONT-4P',
      category: 'Home & Kitchen',
      weight: 850,
      weightUnit: 'g',
      purchasePrice: 195,
      inboundShipping: 18,
      packagingCost: 24,
      labelPrintingCost: 2,
      labourCost: 8,
      storageCost: 4,
      miscellaneousCost: 0,
      inventoryUnits: 40,
    },
    pricing: {
      strategy: 'price',
      proposedSellingPrice: 599,
      desiredProfitINR: 110,
      targetMarginPct: 20,
      targetMarkupPct: 44,
      isPriceGstInclusive: true,
      roundPriceOption: '9',
    },
    logistics: {
      forwardShippingFee: 0,
      weightSurcharge: 15, // Higher volumetric weight
      codCollectionFee: 0,
      returnShippingFee: 0,
      reverseLogisticsFee: 0,
      rtoCostPerOrder: 0,
      damagedLossPerReturn: 0,
      returnHandlingCost: 0,
      otherLogisticsCost: 0,
      enableRiskReserve: true,
      expectedReturnRatePct: 4,
      expectedRtoRatePct: 6,
      additionalLossPerReturn: 120,
      additionalLossPerRto: 80,
    },
    tax: {
      gstStatus: 'registered',
      productGstRatePct: 18,
      isSellingPriceGstInclusive: true,
      inputTaxCreditAvailable: true,
      gstOnServicesPct: 18,
      incomeTaxProvisionPct: 0,
      tcsTdsPct: 1.0,
    },
    platformFees: JSON.parse(JSON.stringify(defaultPlatformFees)),
  },
];
