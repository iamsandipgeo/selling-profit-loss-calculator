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
import { formatINR, formatPct } from '../utils/formatters';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle,
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { calculatePlatformProfit, solveSellingPrice } from '../utils/calculator';

interface PlatformComparisonTabProps {
  product: ProductInfo;
  pricing: PricingSettings;
  logistics: LogisticsSettings;
  tax: TaxSettings;
  platformFees: Record<PlatformId, PlatformFeeConfig>;
  onUpdatePlatformFee: (platformId: PlatformId, fee: PlatformFeeConfig) => void;
  selectedPlatform: PlatformId;
  onSelectPlatform: (platform: PlatformId) => void;
  language: Language;
}

export const PlatformComparisonTab: React.FC<PlatformComparisonTabProps> = ({
  product,
  pricing,
  logistics,
  tax,
  platformFees,
  onUpdatePlatformFee,
  selectedPlatform,
  onSelectPlatform,
  language,
}) => {
  const t = translations[language];

  // Comparison modes:
  // 'same_price': All 3 platforms evaluated at the common customer selling price
  // 'target_profit': Each platform calculates the required selling price to hit the target profit
  const [compareMode, setCompareMode] = useState<'same_price' | 'target_profit'>('same_price');
  const [commonPrice, setCommonPrice] = useState<number>(pricing.proposedSellingPrice || 549);

  const platforms: { id: PlatformId; name: string; brandColor: string; bgBadge: string }[] = [
    { id: 'meesho', name: 'Meesho', brandColor: '#c026d3', bgBadge: 'bg-fuchsia-100 text-fuchsia-800' },
    { id: 'amazon', name: 'Amazon India', brandColor: '#f59e0b', bgBadge: 'bg-amber-100 text-amber-800' },
    { id: 'flipkart', name: 'Flipkart', brandColor: '#2563eb', bgBadge: 'bg-blue-100 text-blue-800' },
  ];

  // Calculate results for all 3 platforms based on active compareMode
  const calculatedResults: Record<PlatformId, CalculationResult> = {} as any;

  platforms.forEach(({ id, name }) => {
    let priceToUse = commonPrice;
    if (compareMode === 'target_profit') {
      const solved = solveSellingPrice(
        pricing,
        pricing.proposedSellingPrice,
        0,
        0,
        platformFees[id],
        tax
      );
      priceToUse = solved.price;
    }

    calculatedResults[id] = calculatePlatformProfit(
      id,
      name,
      priceToUse,
      product,
      logistics,
      platformFees[id],
      tax
    );
  });

  // Find winner
  let bestPlatformId: PlatformId = 'meesho';
  let highestProfit = -Infinity;
  platforms.forEach(({ id }) => {
    if (calculatedResults[id].netProfit > highestProfit) {
      highestProfit = calculatedResults[id].netProfit;
      bestPlatformId = id;
    }
  });

  return (
    <div className="space-y-6">
      {/* Comparison Header & Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.comparisonTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluate commission rates, fixed closing fees, shipping deductions, and net cash profit across portals.
          </p>
        </div>

        {/* Toggle Modes */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCompareMode('same_price')}
            className={`px-3 py-2 rounded-lg transition-all text-center ${
              compareMode === 'same_price'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.compareSamePriceMode}
          </button>
          <button
            type="button"
            onClick={() => setCompareMode('target_profit')}
            className={`px-3 py-2 rounded-lg transition-all text-center ${
              compareMode === 'target_profit'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.compareRecommendedPriceMode}
          </button>
        </div>
      </div>

      {/* Common Price Slider (If in same_price mode) */}
      {compareMode === 'same_price' && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <div>
              <span className="text-xs font-bold text-blue-900 block">
                Universal Test Selling Price: {formatINR(commonPrice)}
              </span>
              <span className="text-[11px] text-blue-700">
                Move the slider to see how profit changes on each portal at different retail price points.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={149}
              max={2999}
              step={10}
              value={commonPrice}
              onChange={(e) => setCommonPrice(parseFloat(e.target.value))}
              className="w-44 accent-blue-600 cursor-pointer"
            />
            <input
              type="number"
              value={commonPrice}
              onChange={(e) => setCommonPrice(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-20 px-2 py-1 text-xs font-bold bg-white border border-blue-300 rounded-md text-center text-slate-900"
            />
          </div>
        </div>
      )}

      {/* Winner Recommendation Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            {t.bestPlatformBadge}
          </div>
          <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
            {bestPlatformId.toUpperCase()} yields the highest net pocket profit of{' '}
            <span className="text-emerald-700 underline decoration-emerald-400">
              {formatINR(calculatedResults[bestPlatformId]?.netProfit)} per sale
            </span>{' '}
            ({formatPct(calculatedResults[bestPlatformId]?.netProfitMarginPct)} margin).
          </p>
          <p className="text-xs text-slate-600 mt-1">
            *Based purely on your current fee inputs and cost settings. Marketplace rate cards fluctuate by product tier and weight.
          </p>
        </div>
      </div>

      {/* 3 Columns Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {platforms.map(({ id, name, bgBadge }) => {
          const res = calculatedResults[id];
          const feeConfig = platformFees[id];
          const isWinner = id === bestPlatformId;
          const isCurrentActive = id === selectedPlatform;

          return (
            <div
              key={id}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition-all flex flex-col justify-between relative overflow-hidden ${
                isWinner ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-slate-200'
              }`}
            >
              {isWinner && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-xs">
                  ★ HIGHEST PROFIT
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${bgBadge}`}>
                    {name}
                  </span>
                  {isCurrentActive && (
                    <span className="text-[10px] font-semibold text-slate-500">
                      (Active in Dashboard)
                    </span>
                  )}
                </div>

                {/* Primary Profit KPI */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold block">
                    Estimated Net Profit:
                  </span>
                  <div
                    className={`text-2xl font-extrabold tracking-tight mt-0.5 ${
                      res.isProfitable ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {formatINR(res.netProfit)}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">
                    Margin: {formatPct(res.netProfitMarginPct)} | Markup: {formatPct(res.markupPct)}
                  </div>
                </div>

                {/* Selling Price & Payout */}
                <div className="mt-4 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Customer Selling Price:</span>
                    <span className="font-bold text-slate-900">{formatINR(res.customerSellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Expected Bank Payout:</span>
                    <span className="font-bold text-blue-700">{formatINR(res.expectedMarketplacePayout)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Deductions:</span>
                    <span className="font-bold text-amber-700">{formatINR(res.totalPlatformDeductions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Break-Even Price:</span>
                    <span className="font-bold text-slate-800">{formatINR(res.breakEvenSellingPrice)}</span>
                  </div>
                </div>

                {/* Deductions Breakdown */}
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-700 mb-1">Fee Deductions:</div>
                  <div className="flex justify-between text-slate-500">
                    <span>Referral Commission ({feeConfig.referralCommissionPct}%):</span>
                    <span className="text-slate-700 font-medium">{formatINR(res.marketplaceReferralFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Fixed & Closing Fee:</span>
                    <span className="text-slate-700 font-medium">{formatINR(res.marketplaceFixedClosingFees)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping & Fulfilment:</span>
                    <span className="text-slate-700 font-medium">{formatINR(res.marketplaceFulfilmentShipping)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST on Services (18%):</span>
                    <span className="text-slate-700 font-medium">{formatINR(res.gstOnMarketplaceFees)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Ad Spend per order:</span>
                    <span className="text-slate-700 font-medium">{formatINR(res.marketplaceAdvertisingFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Return/RTO Reserve:</span>
                    <span className="text-red-600 font-medium">{formatINR(res.expectedLossReservePerOrder)}</span>
                  </div>
                </div>
              </div>

              {/* Set Active Button */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSelectPlatform(id)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isCurrentActive
                      ? 'bg-slate-200 text-slate-700 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {isCurrentActive ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Current Dashboard Platform</span>
                    </>
                  ) : (
                    <>
                      <span>Select for Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Detailed Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs overflow-x-auto">
        <h3 className="text-base font-bold text-slate-900 mb-3">
          Comprehensive Side-by-Side Financial Matrix
        </h3>
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="py-2.5 px-3 text-left font-bold">{t.comparisonTableHeadPlatform}</th>
              <th className="py-2.5 px-3 text-right font-bold">{t.comparisonTableHeadSellingPrice}</th>
              <th className="py-2.5 px-3 text-right font-bold">Referral %</th>
              <th className="py-2.5 px-3 text-right font-bold">{t.comparisonTableHeadFees}</th>
              <th className="py-2.5 px-3 text-right font-bold">{t.comparisonTableHeadPayout}</th>
              <th className="py-2.5 px-3 text-right font-bold">{t.comparisonTableHeadBreakEven}</th>
              <th className="py-2.5 px-3 text-right font-bold">{t.comparisonTableHeadNetProfit}</th>
              <th className="py-2.5 px-3 text-right font-bold">{t.comparisonTableHeadMargin}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {platforms.map(({ id, name }) => {
              const res = calculatedResults[id];
              const isWinner = id === bestPlatformId;
              return (
                <tr key={id} className={`hover:bg-slate-50/60 ${isWinner ? 'bg-emerald-50/30' : ''}`}>
                  <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{name}</span>
                    {isWinner && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded-sm">
                        Winner
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-800">
                    {formatINR(res.customerSellingPrice)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {platformFees[id].referralCommissionPct}%
                  </td>
                  <td className="py-3 px-3 text-right text-amber-700 font-semibold">
                    {formatINR(res.totalPlatformDeductions)}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-700 font-bold">
                    {formatINR(res.expectedMarketplacePayout)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {formatINR(res.breakEvenSellingPrice)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-extrabold ${
                      res.isProfitable ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {formatINR(res.netProfit)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-800">
                    {formatPct(res.netProfitMarginPct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Disclaimers & Advice Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Marketplace Realities in India:</span>
          <p className="mt-0.5 leading-relaxed">
            While Meesho offers 0% referral commission, it is dominated by budget price-sensitive shoppers with higher return and RTO rates. Amazon and Flipkart charge 8% to 18% commission plus closing fees, but deliver faster Prime/Plus logistics with higher customer trust and higher average order values. Always model both fee savings and expected return rates before deciding your primary catalog channel.
          </p>
        </div>
      </div>
    </div>
  );
};
