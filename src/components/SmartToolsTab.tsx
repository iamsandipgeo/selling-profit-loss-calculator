import React, { useState } from 'react';
import {
  CalculationResult,
  Language,
  LogisticsSettings,
  PlatformFeeConfig,
  PlatformId,
  PricingSettings,
  ProductInfo,
  TaxSettings,
} from '../types';
import { translations } from '../utils/translations';
import { formatINR, formatPct, parseNumber } from '../utils/formatters';
import { calculatePlatformProfit } from '../utils/calculator';
import {
  Wrench,
  Percent,
  TrendingUp,
  Target,
  Sparkles,
  ShoppingBag,
  Megaphone,
  Layers,
  ArrowRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';

interface SmartToolsTabProps {
  product: ProductInfo;
  pricing: PricingSettings;
  logistics: LogisticsSettings;
  tax: TaxSettings;
  platformFees: Record<PlatformId, PlatformFeeConfig>;
  selectedPlatform: PlatformId;
  result: CalculationResult;
  language: Language;
}

export const SmartToolsTab: React.FC<SmartToolsTabProps> = ({
  product,
  pricing,
  logistics,
  tax,
  platformFees,
  selectedPlatform,
  result,
  language,
}) => {
  const t = translations[language];

  // Tool 1: Max Wholesale Buying Price Calculator State
  const [maxWholesaleTargetPrice, setMaxWholesaleTargetPrice] = useState<number>(
    result.customerSellingPrice || 599
  );
  const [maxWholesaleTargetProfit, setMaxWholesaleTargetProfit] = useState<number>(100);

  // Tool 2: Discount & Sale Simulator State
  const [saleDiscountPct, setSaleDiscountPct] = useState<number>(15);

  // Tool 3: Advertising ROAS & ACOS Calculator State
  const [adSpendTotal, setAdSpendTotal] = useState<number>(5000);
  const [adOrdersTotal, setAdOrdersTotal] = useState<number>(75);

  // Calculate Tool 1: Max Wholesale Purchase Price
  // Net Profit = Payout - Base Cost - Logistics - RTO
  // Base Cost = PurchasePrice + Inbound + Packaging + Labels + Prep
  // So: PurchasePrice = Payout - TargetProfit - (Inbound + Packaging + Labels + Prep) - Logistics - RTO
  const testFeeConfig = platformFees[selectedPlatform];
  const sampleCalcAtTargetPrice = calculatePlatformProfit(
    selectedPlatform,
    testFeeConfig.name,
    maxWholesaleTargetPrice,
    { ...product, purchasePrice: 0 },
    logistics,
    testFeeConfig,
    tax
  );
  // With purchasePrice = 0, profit is gross surplus
  const maxAllowablePurchasePrice = Math.max(
    0,
    sampleCalcAtTargetPrice.netProfit - maxWholesaleTargetProfit
  );

  // Calculate Tool 2: Discount Simulator
  const discountedSellingPrice = Math.round(result.customerSellingPrice * (1 - saleDiscountPct / 100));
  const discountedResult = calculatePlatformProfit(
    selectedPlatform,
    testFeeConfig.name,
    discountedSellingPrice,
    product,
    logistics,
    testFeeConfig,
    tax
  );

  // Calculate Tool 3: Advertising ROAS
  const adRevenue = adOrdersTotal * result.customerSellingPrice;
  const roas = adSpendTotal > 0 ? (adRevenue / adSpendTotal) : 0;
  const acos = adRevenue > 0 ? (adSpendTotal / adRevenue) * 100 : 0;
  const adCostPerOrder = adOrdersTotal > 0 ? adSpendTotal / adOrdersTotal : 0;
  const profitAfterAds = discountedResult.netProfit * adOrdersTotal;

  // Scenario Analysis: Low vs Normal vs High Return Rates
  const lowReturnLogistics: LogisticsSettings = {
    ...logistics,
    expectedReturnRatePct: 5,
    expectedRtoRatePct: 4,
  };
  const highReturnLogistics: LogisticsSettings = {
    ...logistics,
    expectedReturnRatePct: 22,
    expectedRtoRatePct: 15,
  };

  const lowScenarioResult = calculatePlatformProfit(
    selectedPlatform,
    testFeeConfig.name,
    result.customerSellingPrice,
    product,
    lowReturnLogistics,
    testFeeConfig,
    tax
  );

  const highScenarioResult = calculatePlatformProfit(
    selectedPlatform,
    testFeeConfig.name,
    result.customerSellingPrice,
    product,
    highReturnLogistics,
    testFeeConfig,
    tax
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.toolsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Advanced calculators for wholesale buying, festive discount sales, ROAS, and return risk scenario stress-testing.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tool 1: Max Wholesale Buying Price Calculator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Target className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {t.toolMaxWholesale}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              "What is the maximum price I can pay a Surat/Delhi wholesaler and still make my desired profit?"
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Target Retail Price (₹):
                </label>
                <input
                  type="number"
                  value={maxWholesaleTargetPrice}
                  onChange={(e) => setMaxWholesaleTargetPrice(parseNumber(e.target.value, 0))}
                  className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Desired Pocket Profit (₹):
                </label>
                <input
                  type="number"
                  value={maxWholesaleTargetProfit}
                  onChange={(e) => setMaxWholesaleTargetProfit(parseNumber(e.target.value, 0))}
                  className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-xs font-semibold text-blue-800">
                Maximum Supplier Wholesale Buying Price:
              </div>
              <div className="text-2xl font-black text-blue-900 mt-1">
                {formatINR(maxAllowablePurchasePrice)}
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                If the wholesaler charges more than {formatINR(maxAllowablePurchasePrice)}, your profit will fall below {formatINR(maxWholesaleTargetProfit)}.
              </p>
            </div>
          </div>
        </div>

        {/* Tool 2: Festival Discount & Sale Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <Percent className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                {t.toolDiscountSim}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Test festive deal discounts (Diwali, Great Indian Festival, Big Billion Days) before running them.
            </p>

            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Proposed Discount %:</span>
                <span className="text-amber-700 font-bold">{saleDiscountPct}% OFF</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={saleDiscountPct}
                onChange={(e) => setSaleDiscountPct(parseInt(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0% (Regular)</span>
                <span>15% (Flash)</span>
                <span>30% (Festive)</span>
                <span>50% (Clearance)</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Discounted Selling Price:</span>
                <span className="font-bold text-slate-900 line-through mr-1 text-slate-400">
                  {formatINR(result.customerSellingPrice)}
                </span>
                <span className="font-extrabold text-amber-800">
                  {formatINR(discountedSellingPrice)}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-2 pt-2 border-t border-amber-200/60">
                <span className="text-slate-600">Profit after discount:</span>
                <span
                  className={`font-black text-sm ${
                    discountedResult.isProfitable ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {formatINR(discountedResult.netProfit)} ({formatPct(discountedResult.netProfitMarginPct)})
                </span>
              </div>
              {!discountedResult.isProfitable && (
                <div className="text-[11px] text-red-600 font-semibold mt-1">
                  ⚠️ This discount causes a net loss! Do not run this deal without lowering procurement costs.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tool 3: Advertising ROAS & ACOS Calculator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-100 text-pink-700">
              <Megaphone className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              {t.toolAdRoas}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Determine whether your Amazon Sponsored Products or Meesho Ads campaign is profitable.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Total Ad Spend (₹):
              </label>
              <input
                type="number"
                value={adSpendTotal}
                onChange={(e) => setAdSpendTotal(parseNumber(e.target.value, 0))}
                className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Orders Generated:
              </label>
              <input
                type="number"
                value={adOrdersTotal}
                onChange={(e) => setAdOrdersTotal(parseNumber(e.target.value, 1))}
                className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold">ROAS</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {roas.toFixed(2)}x
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold">ACOS</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {formatPct(acos)}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold">Cost per Order</div>
              <div className="text-sm font-bold text-pink-700 mt-0.5">
                {formatINR(adCostPerOrder)}
              </div>
            </div>
          </div>
        </div>

        {/* Tool 4: Scenario Analysis (Return Stress Testing) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Scale className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              {t.toolScenario}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            See how your bottom-line profit changes under different return & RTO conditions in India.
          </p>

          <div className="mt-4 space-y-2.5 text-xs">
            {/* Scenario 1: Best Case */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div>
                <span className="font-bold text-emerald-900 block">Best Case (Low Returns: 5% Return, 4% RTO)</span>
                <span className="text-[11px] text-emerald-700">Prepaid orders & loyal repeat buyers</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-800">
                  {formatINR(lowScenarioResult.netProfit)}
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  {formatPct(lowScenarioResult.netProfitMarginPct)} margin
                </span>
              </div>
            </div>

            {/* Scenario 2: Current Expected */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <div>
                <span className="font-bold text-blue-900 block">
                  Current Setting ({logistics.expectedReturnRatePct}% Return, {logistics.expectedRtoRatePct}% RTO)
                </span>
                <span className="text-[11px] text-blue-700">Your currently configured expectations</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-blue-800">
                  {formatINR(result.netProfit)}
                </span>
                <span className="text-[10px] text-blue-600 block">
                  {formatPct(result.netProfitMarginPct)} margin
                </span>
              </div>
            </div>

            {/* Scenario 3: Worst Case */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/70 border border-red-200">
              <div>
                <span className="font-bold text-red-900 block">Worst Case (High COD RTO: 22% Return, 15% RTO)</span>
                <span className="text-[11px] text-red-700">High COD customer refusals in remote regions</span>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-extrabold ${
                    highScenarioResult.isProfitable ? 'text-emerald-700' : 'text-red-800'
                  }`}
                >
                  {formatINR(highScenarioResult.netProfit)}
                </span>
                <span className="text-[10px] text-red-600 block">
                  {formatPct(highScenarioResult.netProfitMarginPct)} margin
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
