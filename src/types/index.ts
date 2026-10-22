export type Language = 'en' | 'bn';

export type PlatformId = 'meesho' | 'amazon' | 'flipkart';

export type PricingStrategy = 'price' | 'profit' | 'margin' | 'markup';

export type GSTStatus = 'registered' | 'not_registered' | 'unsure';

export type WeightUnit = 'g' | 'kg';

export interface ProductInfo {
  name: string;
  sku: string;
  category: string;
  weight: number; // in grams or kg as per weightUnit
  weightUnit: WeightUnit;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  purchasePrice: number; // Base wholesale purchase price
  inboundShipping: number; // Inbound freight per unit
  packagingCost: number; // Box, polybag, tape, bubble wrap
  labelPrintingCost: number; // Label, barcode print
  labourCost: number; // Packing and handling manpower
  storageCost: number; // Warehousing cost per unit
  miscellaneousCost: number; // Any other misc cost
  inventoryUnits: number; // Number of units in batch
}

export interface PricingSettings {
  strategy: PricingStrategy;
  proposedSellingPrice: number;
  desiredProfitINR: number;
  targetMarginPct: number; // Profit / Taxable Revenue %
  targetMarkupPct: number; // Profit / Base Cost %
  isPriceGstInclusive: boolean;
  roundPriceOption: 'none' | '1' | '5' | '9' | '10'; // charm pricing rounding
}

export interface LogisticsSettings {
  forwardShippingFee: number;
  weightSurcharge: number;
  codCollectionFee: number;
  returnShippingFee: number;
  reverseLogisticsFee: number;
  rtoCostPerOrder: number;
  damagedLossPerReturn: number;
  returnHandlingCost: number;
  otherLogisticsCost: number;
  // Risk calculation toggle and parameters
  enableRiskReserve: boolean;
  expectedReturnRatePct: number; // Customer returns %
  expectedRtoRatePct: number; // Courier/RTO returns %
  additionalLossPerReturn: number;
  additionalLossPerRto: number;
}

export interface PlatformFeeConfig {
  id: PlatformId;
  name: string;
  referralCommissionPct: number;
  fixedFee: number;
  closingFee: number;
  collectionFeePct: number;
  collectionFlatFee: number;
  fulfilmentFee: number;
  shippingFee: number;
  additionalFee: number;
  advertisingCostPerOrder: number;
  advertisingPctOfPrice: number;
  gstOnFeesPct: number; // 18% standard GST on service fees
  otherPlatformExpense: number;
  notes?: string;
}

export interface TaxSettings {
  gstStatus: GSTStatus;
  productGstRatePct: number; // 0%, 5%, 12%, 18%, 28%, or custom
  isSellingPriceGstInclusive: boolean;
  inputTaxCreditAvailable: boolean; // Can seller claim ITC on product & packaging?
  gstOnServicesPct: number; // Standard 18% on marketplace commission/shipping
  incomeTaxProvisionPct: number; // Optional income tax reserve %
  tcsTdsPct: number; // 1% TCS / TDS under GST
}

export interface CalculationResult {
  platformId: PlatformId;
  platformName: string;
  customerSellingPrice: number;
  taxableRevenue: number;
  productOutputGst: number;
  totalBaseCostPerUnit: number;
  logisticsBaseCost: number;
  expectedLossReservePerOrder: number;
  marketplaceReferralFee: number;
  marketplaceFixedClosingFees: number;
  marketplaceFulfilmentShipping: number;
  marketplaceCollectionFee: number;
  marketplaceAdvertisingFee: number;
  totalMarketplaceFeesBeforeTax: number;
  gstOnMarketplaceFees: number;
  recoverableInputTaxCredit: number;
  tcsDeduction: number;
  totalPlatformDeductions: number;
  expectedMarketplacePayout: number;
  totalCostPerSuccessfulSale: number;
  netProfit: number;
  netProfitMarginPct: number;
  markupPct: number;
  breakEvenSellingPrice: number;
  recommendedSellingPrice: number;
  profitOn10Orders: number;
  profitOn50Orders: number;
  profitOn100Orders: number;
  profitOn500Orders: number;
  isProfitable: boolean;
  warningMessage?: string;
  breakdown: {
    label: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
}

export interface SavedProduct {
  id: string;
  createdAt: string;
  updatedAt: string;
  product: ProductInfo;
  pricing: PricingSettings;
  logistics: LogisticsSettings;
  tax: TaxSettings;
  selectedPlatform: PlatformId;
  platformFees: Record<PlatformId, PlatformFeeConfig>;
  notes?: string;
}
