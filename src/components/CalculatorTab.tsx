import React, { useState } from 'react';
import {
  CalculationResult,
  Language,
  LogisticsSettings,
  PlatformFeeConfig,
  PlatformId,
  PricingSettings,
  PricingStrategy,
  ProductInfo,
  TaxSettings,
} from '../types';
import { translations } from '../utils/translations';
import { formatINR, formatPct, parseNumber } from '../utils/formatters';
import {
  Package,
  DollarSign,
  Truck,
  RotateCcw,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Scale,
  Receipt,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface CalculatorTabProps {
  product: ProductInfo;
  onUpdateProduct: (product: ProductInfo) => void;
  pricing: PricingSettings;
  onUpdatePricing: (pricing: PricingSettings) => void;
  logistics: LogisticsSettings;
  onUpdateLogistics: (logistics: LogisticsSettings) => void;
  tax: TaxSettings;
  onUpdateTax: (tax: TaxSettings) => void;
  selectedPlatform: PlatformId;
  onSelectPlatform: (platform: PlatformId) => void;
  platformFees: Record<PlatformId, PlatformFeeConfig>;
  result: CalculationResult;
  language: Language;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  product,
  onUpdateProduct,
  pricing,
  onUpdatePricing,
  logistics,
  onUpdateLogistics,
  tax,
  onUpdateTax,
  selectedPlatform,
  onSelectPlatform,
  platformFees,
  result,
  language,
}) => {
  const t = translations[language];

  // Collapsible sections state for beginner simplicity
  const [showAdvancedProduct, setShowAdvancedProduct] = useState(false);
  const [showAdvancedLogistics, setShowAdvancedLogistics] = useState(false);
  const [showCalculationAudit, setShowCalculationAudit] = useState(true);

  // Helper for numeric inputs
  const handleProductNumChange = (field: keyof ProductInfo, val: string) => {
    onUpdateProduct({
      ...product,
      [field]: parseNumber(val, 0),
    });
  };

  const handleLogisticsNumChange = (field: keyof LogisticsSettings, val: string) => {
    onUpdateLogistics({
      ...logistics,
      [field]: parseNumber(val, 0),
    });
  };

  return (
    <div className="space-y-6">
      {/* Platform Selector Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">
            {t.selectedPlatformLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectPlatform('meesho')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedPlatform === 'meesho'
                ? 'bg-fuchsia-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Meesho
          </button>
          <button
            type="button"
            onClick={() => onSelectPlatform('amazon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedPlatform === 'amazon'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Amazon India
          </button>
          <button
            type="button"
            onClick={() => onSelectPlatform('flipkart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedPlatform === 'flipkart'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Flipkart
          </button>
        </div>
      </div>

      {/* 1. Product Details and Base Landed Costs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.productDetailsTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Wholesale price, packaging, and inbound inventory expenses.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Base Cost:</span>
            <span className="text-base font-extrabold text-blue-700">
              {formatINR(result.totalBaseCostPerUnit)}
            </span>
          </div>
        </div>

        {/* Primary Product Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Product Name */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.productName} *
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => onUpdateProduct({ ...product, name: e.target.value })}
              placeholder="e.g. Cotton Printed Anarkali Kurti"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* SKU (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.productSku}
            </label>
            <input
              type="text"
              value={product.sku}
              onChange={(e) => onUpdateProduct({ ...product, sku: e.target.value })}
              placeholder="e.g. KRT-001"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.purchasePrice} *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={product.purchasePrice}
                onChange={(e) => handleProductNumChange('purchasePrice', e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t.purchasePriceHelp}</p>
          </div>

          {/* Inbound Shipping / Freight */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.inboundShipping}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={product.inboundShipping}
                onChange={(e) => handleProductNumChange('inboundShipping', e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t.inboundShippingHelp}</p>
          </div>

          {/* Packaging Cost */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.packagingCost}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={product.packagingCost}
                onChange={(e) => handleProductNumChange('packagingCost', e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t.packagingCostHelp}</p>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.productWeight}
            </label>
            <div className="flex gap-1.5">
              <input
                type="number"
                step="1"
                min="0"
                value={product.weight}
                onChange={(e) => handleProductNumChange('weight', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              <select
                aria-label="Weight unit"
                value={product.weightUnit}
                onChange={(e) =>
                  onUpdateProduct({ ...product, weightUnit: e.target.value as 'g' | 'kg' })
                }
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 text-xs font-medium text-slate-700"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Product Costs (Label, Labour, Storage, Misc, Lot size) */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvancedProduct(!showAdvancedProduct)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            {showAdvancedProduct ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>
              {showAdvancedProduct ? 'Hide Additional Prep Costs' : 'Show Additional Prep Costs (Label, Labour, Storage, Lot Size)'}
            </span>
          </button>

          {showAdvancedProduct && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              {/* Label & Printing */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.labelPrintingCost}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.labelPrintingCost}
                    onChange={(e) => handleProductNumChange('labelPrintingCost', e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Labour / Prep */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.labourCost}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.labourCost}
                    onChange={(e) => handleProductNumChange('labourCost', e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Storage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.storageCost}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.storageCost}
                    onChange={(e) => handleProductNumChange('storageCost', e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Other Misc */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.miscellaneousCost}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.miscellaneousCost}
                    onChange={(e) => handleProductNumChange('miscellaneousCost', e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Pricing Strategy and Target */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.pricingStrategyTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Choose your pricing method: fixed selling price, target profit in ₹, target margin %, or cost markup.
            </p>
          </div>
        </div>

        {/* Strategy Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
          <button
            type="button"
            onClick={() => onUpdatePricing({ ...pricing, strategy: 'price' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              pricing.strategy === 'price'
                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">A. Selling Price</div>
            <div className="text-[11px] text-slate-500 mt-0.5">I have a target customer price</div>
          </button>

          <button
            type="button"
            onClick={() => onUpdatePricing({ ...pricing, strategy: 'profit' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              pricing.strategy === 'profit'
                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">B. Target Profit (₹)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">I want ₹X net profit per sale</div>
          </button>

          <button
            type="button"
            onClick={() => onUpdatePricing({ ...pricing, strategy: 'margin' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              pricing.strategy === 'margin'
                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">C. Target Margin (%)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">% of net taxable sales</div>
          </button>

          <button
            type="button"
            onClick={() => onUpdatePricing({ ...pricing, strategy: 'markup' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              pricing.strategy === 'markup'
                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">D. Cost Markup (%)</div>
            <div className="text-[11px] text-slate-500 mt-0.5">% on base landed cost</div>
          </button>
        </div>

        {/* Dynamic Input based on Strategy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
          {pricing.strategy === 'price' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.proposedPriceLabel}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={pricing.proposedSellingPrice}
                  onChange={(e) =>
                    onUpdatePricing({
                      ...pricing,
                      proposedSellingPrice: parseNumber(e.target.value, 0),
                    })
                  }
                  className="w-full pl-8 pr-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>
          )}

          {pricing.strategy === 'profit' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.targetProfitLabel}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={pricing.desiredProfitINR}
                  onChange={(e) =>
                    onUpdatePricing({
                      ...pricing,
                      desiredProfitINR: parseNumber(e.target.value, 0),
                    })
                  }
                  className="w-full pl-8 pr-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>
          )}

          {pricing.strategy === 'margin' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.targetMarginLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="90"
                  value={pricing.targetMarginPct}
                  onChange={(e) =>
                    onUpdatePricing({
                      ...pricing,
                      targetMarginPct: parseNumber(e.target.value, 0),
                    })
                  }
                  className="w-full pr-8 pl-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 font-bold text-sm">
                  %
                </span>
              </div>
            </div>
          )}

          {pricing.strategy === 'markup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.targetMarkupLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={pricing.targetMarkupPct}
                  onChange={(e) =>
                    onUpdatePricing({
                      ...pricing,
                      targetMarkupPct: parseNumber(e.target.value, 0),
                    })
                  }
                  className="w-full pr-8 pl-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 font-bold text-sm">
                  %
                </span>
              </div>
            </div>
          )}

          {/* Charm Price Rounding Option */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.roundPriceLabel}
            </label>
            <select
              value={pricing.roundPriceOption}
              onChange={(e) =>
                onUpdatePricing({
                  ...pricing,
                  roundPriceOption: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800"
            >
              <option value="none">{t.roundNone}</option>
              <option value="1">{t.round1}</option>
              <option value="5">{t.round5}</option>
              <option value="9">{t.round9}</option>
              <option value="10">{t.round10}</option>
            </select>
          </div>

          {/* Quick Result Preview */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Calculated Customer Price:
            </span>
            <span className="text-xl font-extrabold text-blue-700">
              {formatINR(result.customerSellingPrice)}
            </span>
          </div>
        </div>

        {/* Educational Note: Margin vs Markup */}
        <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>{t.marginVsMarkupInfo}</p>
        </div>
      </div>

      {/* 3. Delivery, Shipping and Return (RTO) Risk Calculator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.rtoTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.rtoToggleDesc}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              {logistics.enableRiskReserve ? 'Active' : 'Disabled'}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateLogistics({
                  ...logistics,
                  enableRiskReserve: !logistics.enableRiskReserve,
                })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                logistics.enableRiskReserve ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  logistics.enableRiskReserve ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {logistics.enableRiskReserve ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-red-50/40 p-4 rounded-xl border border-red-200/60">
              {/* Customer Return Rate % */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.expectedReturnRate}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={logistics.expectedReturnRatePct}
                    onChange={(e) =>
                      handleLogisticsNumChange('expectedReturnRatePct', e.target.value)
                    }
                    className="w-full pr-8 pl-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-xs">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{t.expectedReturnRateHelp}</p>
              </div>

              {/* Loss Per Return ₹ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.lossPerReturn}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={logistics.additionalLossPerReturn}
                    onChange={(e) =>
                      handleLogisticsNumChange('additionalLossPerReturn', e.target.value)
                    }
                    className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{t.lossPerReturnHelp}</p>
              </div>

              {/* Courier RTO Rate % */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.expectedRtoRate}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={logistics.expectedRtoRatePct}
                    onChange={(e) =>
                      handleLogisticsNumChange('expectedRtoRatePct', e.target.value)
                    }
                    className="w-full pr-8 pl-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-xs">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{t.expectedRtoRateHelp}</p>
              </div>

              {/* Loss Per RTO ₹ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.lossPerRto}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={logistics.additionalLossPerRto}
                    onChange={(e) =>
                      handleLogisticsNumChange('additionalLossPerRto', e.target.value)
                    }
                    className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{t.lossPerRtoHelp}</p>
              </div>
            </div>

            {/* Calculated Risk Reserve Banner */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-red-900 font-medium">
                <span className="font-bold">{t.calculatedRiskReserve}</span>
                <span className="block text-red-700 text-[11px] mt-0.5">
                  Allocates non-recoverable reverse shipping and damaged goods loss across successfully delivered orders.
                </span>
              </div>
              <div className="text-lg font-extrabold text-red-700 whitespace-nowrap">
                {formatINR(result.expectedLossReservePerOrder)} / sale
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
            Risk calculation is disabled. Loss reserve is set to ₹0. Keep in mind that real returns & RTO courier charges will reduce your actual accounting profits.
          </div>
        )}

        {/* Collapsible Direct Shipping Fees (If seller pays outside platform) */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvancedLogistics(!showAdvancedLogistics)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            {showAdvancedLogistics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>
              {showAdvancedLogistics ? 'Hide Direct Courier / Weight Fees' : 'Show Direct Courier Fees (Weight Surcharge, COD Fee, Self-Ship)'}
            </span>
          </button>

          {showAdvancedLogistics && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.forwardShipping}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={logistics.forwardShippingFee}
                    onChange={(e) => handleLogisticsNumChange('forwardShippingFee', e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.weightSurcharge}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={logistics.weightSurcharge}
                    onChange={(e) => handleLogisticsNumChange('weightSurcharge', e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.codFee}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={logistics.codCollectionFee}
                    onChange={(e) => handleLogisticsNumChange('codCollectionFee', e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Transparent Step-by-Step Mathematical Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div
          onClick={() => setShowCalculationAudit(!showCalculationAudit)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Detailed Calculation Breakdown ({result.platformName})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-600">
            {showCalculationAudit ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showCalculationAudit && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                {/* Customer Selling Price */}
                <tr className="bg-slate-50/50">
                  <td className="py-2.5 font-bold text-slate-800">1. Customer Selling Price</td>
                  <td className="py-2.5 text-slate-500 text-right">Customer pays on website/app</td>
                  <td className="py-2.5 text-right font-extrabold text-slate-900">
                    {formatINR(result.customerSellingPrice)}
                  </td>
                </tr>

                {/* Taxable Value & GST */}
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• Taxable Revenue Value</td>
                  <td className="py-2 text-slate-400 text-right">
                    Price ÷ (1 + {tax.productGstRatePct}%)
                  </td>
                  <td className="py-2 text-right text-slate-700 font-semibold">
                    {formatINR(result.taxableRevenue)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• Customer Output GST</td>
                  <td className="py-2 text-slate-400 text-right">
                    Collected on behalf of government
                  </td>
                  <td className="py-2 text-right text-slate-700 font-semibold">
                    {formatINR(result.productOutputGst)}
                  </td>
                </tr>

                {/* Platform Deductions */}
                <tr className="bg-amber-50/40">
                  <td className="py-2.5 font-bold text-amber-900">2. Marketplace Platform Deductions</td>
                  <td className="py-2.5 text-amber-700 text-right">Retained by {result.platformName}</td>
                  <td className="py-2.5 text-right font-bold text-amber-800">
                    - {formatINR(result.totalPlatformDeductions)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• Referral Commission Fee</td>
                  <td className="py-2 text-slate-400 text-right">
                    {platformFees[selectedPlatform]?.referralCommissionPct}% of price
                  </td>
                  <td className="py-2 text-right text-slate-600 font-medium">
                    {formatINR(result.marketplaceReferralFee)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• Fixed & Closing Fees</td>
                  <td className="py-2 text-slate-400 text-right">Flat platform per-order charges</td>
                  <td className="py-2 text-right text-slate-600 font-medium">
                    {formatINR(result.marketplaceFixedClosingFees)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• Shipping & Pick-Pack</td>
                  <td className="py-2 text-slate-400 text-right">Logistics fulfillment by portal</td>
                  <td className="py-2 text-right text-slate-600 font-medium">
                    {formatINR(result.marketplaceFulfilmentShipping)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• Payment / Collection Fee</td>
                  <td className="py-2 text-slate-400 text-right">Payment gateway / COD handling</td>
                  <td className="py-2 text-right text-slate-600 font-medium">
                    {formatINR(result.marketplaceCollectionFee)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• GST on Marketplace Services (18%)</td>
                  <td className="py-2 text-slate-400 text-right">Charged by platform on their fee</td>
                  <td className="py-2 text-right text-slate-600 font-medium">
                    {formatINR(result.gstOnMarketplaceFees)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• Marketplace Ad Spend / ACOS</td>
                  <td className="py-2 text-slate-400 text-right">Sponsored ads per order</td>
                  <td className="py-2 text-right text-slate-600 font-medium">
                    {formatINR(result.marketplaceAdvertisingFee)}
                  </td>
                </tr>

                {/* Bank Payout */}
                <tr className="bg-blue-50/50">
                  <td className="py-2.5 font-bold text-blue-900">3. Net Bank Payout</td>
                  <td className="py-2.5 text-blue-700 text-right">Deposited into seller's bank account</td>
                  <td className="py-2.5 text-right font-extrabold text-blue-800">
                    {formatINR(result.expectedMarketplacePayout)}
                  </td>
                </tr>

                {/* Seller Operating Costs */}
                <tr className="bg-slate-50/50">
                  <td className="py-2.5 font-bold text-slate-800">4. Seller Product & Operating Expenses</td>
                  <td className="py-2.5 text-slate-500 text-right">Paid by you directly</td>
                  <td className="py-2.5 text-right font-bold text-slate-800">
                    - {formatINR(result.totalBaseCostPerUnit + result.logisticsBaseCost + result.expectedLossReservePerOrder)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• Base Landed Goods & Packaging</td>
                  <td className="py-2 text-slate-400 text-right">Purchase + Box + Label + Prep</td>
                  <td className="py-2 text-right text-slate-600 font-medium">
                    {formatINR(result.totalBaseCostPerUnit)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-600 pl-4">• Expected Return/RTO Loss Fund</td>
                  <td className="py-2 text-slate-400 text-right">Reserve for courier returns</td>
                  <td className="py-2 text-right text-slate-600 font-medium">
                    {formatINR(result.expectedLossReservePerOrder)}
                  </td>
                </tr>

                {/* Net Profit Final Line */}
                <tr className={`text-sm ${result.isProfitable ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <td className="py-3 font-extrabold text-slate-900">
                    5. Final Net Pocket Profit
                  </td>
                  <td className="py-3 text-right font-bold text-slate-700">
                    Margin: {formatPct(result.netProfitMarginPct)} | Markup: {formatPct(result.markupPct)}
                  </td>
                  <td
                    className={`py-3 text-right text-base font-black ${
                      result.isProfitable ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {formatINR(result.netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
