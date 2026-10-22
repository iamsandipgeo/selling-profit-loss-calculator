import React, { useState } from 'react';
import {
  CalculationResult,
  Language,
  PlatformId,
} from '../types';
import { translations } from '../utils/translations';
import { formatINR, formatPct } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Receipt,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DashboardTabProps {
  result: CalculationResult;
  comparisonResults: Record<PlatformId, CalculationResult>;
  selectedPlatform: PlatformId;
  language: Language;
  onNavigateToCalculator: () => void;
  onNavigateToComparison: () => void;
  onSelectPlatform: (platform: PlatformId) => void;
  productName: string;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  result,
  comparisonResults,
  selectedPlatform,
  language,
  onNavigateToCalculator,
  onNavigateToComparison,
  onSelectPlatform,
  productName,
}) => {
  const t = translations[language];
  const [customOrders, setCustomOrders] = useState<number>(200);

  // Determine best platform among the three
  const platforms: PlatformId[] = ['meesho', 'amazon', 'flipkart'];
  let bestPlatformId: PlatformId = selectedPlatform;
  let maxProfit = -Infinity;
  platforms.forEach((p) => {
    if (comparisonResults[p] && comparisonResults[p].netProfit > maxProfit) {
      maxProfit = comparisonResults[p].netProfit;
      bestPlatformId = p;
    }
  });

  const isProfitable = result.isProfitable;
  const isHealthyMargin = result.netProfitMarginPct >= 15;
  const customOrderProfit = result.netProfit * customOrders;
  const customOrderRevenue = result.customerSellingPrice * customOrders;
  const customOrderPayout = result.expectedMarketplacePayout * customOrders;

  return (
    <div className="space-y-6">
      {/* Product Banner & Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {result.platformName}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Product Analysis
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">
            {productName || 'Sample Product'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isProfitable ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                {isHealthyMargin ? t.statusHealthyMargin : t.statusSlimMargin}
              </span>
            ) : (
              <span className="text-red-700 font-medium flex items-center gap-1.5 mt-1">
                <AlertTriangle className="w-4 h-4 text-red-600 inline" />
                {t.statusLossWarning}
              </span>
            )}
          </p>
        </div>

        {/* Best Platform Recommendation Ribbon */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t.bestPlatformBadge}
            </div>
            <div className="text-sm font-bold text-slate-900 capitalize flex items-center gap-1.5">
              <span>{bestPlatformId.toUpperCase()}</span>
              <span className="text-xs text-emerald-600 font-semibold">
                ({formatINR(comparisonResults[bestPlatformId]?.netProfit || 0)} / order)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToComparison}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 ml-2 underline underline-offset-2"
          >
            Compare
          </button>
        </div>
      </div>

      {/* 4 Prominent KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Estimated Net Profit */}
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-all relative overflow-hidden ${
            isProfitable
              ? 'bg-gradient-to-br from-emerald-50/70 via-white to-white border-emerald-300'
              : 'bg-gradient-to-br from-red-50/70 via-white to-white border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.cardNetProfit}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isProfitable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isProfitable ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isProfitable ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {formatINR(result.netProfit)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {t.cardNetProfitSub}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                isProfitable
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isProfitable ? t.statusProfitable : t.statusLoss}
            </span>
          </div>
        </div>

        {/* Card 2: Recommended Selling Price */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.cardSellingPrice}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(result.customerSellingPrice)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {t.cardSellingPriceSub}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Taxable Value:</span>
            <span className="font-semibold text-slate-700">
              {formatINR(result.taxableRevenue)}
            </span>
          </div>
        </div>

        {/* Card 3: Net Profit Margin % */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.cardNetMargin}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                result.netProfitMarginPct >= 15
                  ? 'bg-emerald-100 text-emerald-700'
                  : result.netProfitMarginPct >= 5
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                result.netProfitMarginPct >= 15
                  ? 'text-emerald-700'
                  : result.netProfitMarginPct >= 5
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {formatPct(result.netProfitMarginPct)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {t.cardNetMarginSub}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Cost Markup:</span>
            <span className="font-semibold text-slate-700">
              {formatPct(result.markupPct)}
            </span>
          </div>
        </div>

        {/* Card 4: Total Cost per Successful Sale */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.cardTotalCost}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(result.totalCostPerSuccessfulSale)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {t.cardTotalCostSub}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Platform Cuts:</span>
            <span className="font-semibold text-amber-600">
              {formatINR(result.totalPlatformDeductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Break-even selling price */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            {t.breakEvenPrice}
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {formatINR(result.breakEvenSellingPrice)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {t.breakEvenSub}
          </p>
        </div>

        {/* Expected platform payout */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            {t.expectedPayout}
          </div>
          <div className="text-lg font-bold text-blue-700 mt-1">
            {formatINR(result.expectedMarketplacePayout)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {t.expectedPayoutSub}
          </p>
        </div>

        {/* Total Platform Deductions */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            {t.totalDeductions}
          </div>
          <div className="text-lg font-bold text-amber-700 mt-1">
            {formatINR(result.totalPlatformDeductions)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {t.totalDeductionsSub}
          </p>
        </div>

        {/* Return & RTO Loss Reserve */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            {t.rtoLossReserve}
          </div>
          <div className="text-lg font-bold text-red-600 mt-1">
            {formatINR(result.expectedLossReservePerOrder)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            Loss fund reserved per sale
          </p>
        </div>
      </div>

      {/* Interactive Visual Cost & Profit Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.costBreakdownTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Where does the customer's ₹{result.customerSellingPrice.toFixed(0)} go?
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToCalculator}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Edit Base Costs & Fees</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Segmented Stacked Progress Bar */}
        <div className="mt-5">
          <div className="h-6 w-full rounded-full overflow-hidden flex bg-slate-100 border border-slate-200/60 shadow-inner">
            {result.breakdown
              .filter((item) => item.percentage > 0)
              .map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${Math.min(100, Math.max(2, item.percentage))}%`,
                    backgroundColor: item.color,
                  }}
                  className="h-full relative group transition-all duration-300"
                  title={`${item.label}: ${formatINR(item.amount)} (${item.percentage.toFixed(1)}%)`}
                />
              ))}
          </div>

          {/* Breakdown Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
            {result.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <div className="text-xs text-slate-500 font-medium leading-tight">
                    {item.label}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {formatINR(item.amount)}
                    <span className="text-[11px] font-normal text-slate-400 ml-1">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Order Volume Projection Calculator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.volumeProjectionsTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Estimated earnings scaling from sample batches to 500+ monthly orders.
            </p>
          </div>

          {/* Custom Order Slider */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">
              Custom Goal:
            </span>
            <input
              type="number"
              min={1}
              max={10000}
              value={customOrders}
              onChange={(e) => setCustomOrders(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-2 py-0.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md text-center focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-500">orders</span>
          </div>
        </div>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {/* 10 Orders */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="text-xs font-bold text-slate-500">10 Orders</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Sales: {formatINR(result.customerSellingPrice * 10, false)}
            </div>
            <div
              className={`text-base font-extrabold mt-1.5 ${
                result.profitOn10Orders >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {formatINR(result.profitOn10Orders, false)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Net Profit</div>
          </div>

          {/* 50 Orders */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="text-xs font-bold text-slate-500">50 Orders</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Sales: {formatINR(result.customerSellingPrice * 50, false)}
            </div>
            <div
              className={`text-base font-extrabold mt-1.5 ${
                result.profitOn50Orders >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {formatINR(result.profitOn50Orders, false)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Net Profit</div>
          </div>

          {/* 100 Orders */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="text-xs font-bold text-slate-500">100 Orders</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Sales: {formatINR(result.customerSellingPrice * 100, false)}
            </div>
            <div
              className={`text-base font-extrabold mt-1.5 ${
                result.profitOn100Orders >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {formatINR(result.profitOn100Orders, false)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Net Profit</div>
          </div>

          {/* 500 Orders */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="text-xs font-bold text-slate-500">500 Orders</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Sales: {formatINR(result.customerSellingPrice * 500, false)}
            </div>
            <div
              className={`text-base font-extrabold mt-1.5 ${
                result.profitOn500Orders >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {formatINR(result.profitOn500Orders, false)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Net Profit</div>
          </div>

          {/* Custom Orders Target */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-center col-span-2 md:col-span-1">
            <div className="text-xs font-bold text-blue-800">
              {customOrders} Orders (Goal)
            </div>
            <div className="text-xs text-blue-600 mt-0.5">
              Sales: {formatINR(customOrderRevenue, false)}
            </div>
            <div
              className={`text-base font-extrabold mt-1.5 ${
                customOrderProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {formatINR(customOrderProfit, false)}
            </div>
            <div className="text-[10px] text-blue-700 font-semibold">
              Payout: {formatINR(customOrderPayout, false)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick 3-Platform Comparison Summary Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quick Marketplace Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Estimated net profit per sale at ₹{result.customerSellingPrice.toFixed(0)} selling price.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToComparison}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Comparison</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {platforms.map((pId) => {
            const pResult = comparisonResults[pId];
            if (!pResult) return null;
            const isWinner = pId === bestPlatformId;
            const isCurrent = pId === selectedPlatform;

            return (
              <div
                key={pId}
                onClick={() => onSelectPlatform(pId)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="capitalize">{pId}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-sm">
                        Selected
                      </span>
                    )}
                  </div>
                  {isWinner && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Best Profit
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Net Profit:</span>
                  <span
                    className={`text-lg font-extrabold ${
                      pResult.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {formatINR(pResult.netProfit)}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-xs border-t border-slate-100 pt-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Deductions:</span>
                    <span className="font-medium text-amber-700">
                      {formatINR(pResult.totalPlatformDeductions)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Expected Payout:</span>
                    <span className="font-medium text-slate-800">
                      {formatINR(pResult.expectedMarketplacePayout)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Profit Margin:</span>
                    <span className="font-semibold text-slate-800">
                      {formatPct(pResult.netProfitMarginPct)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
