import React from 'react';
import { CalculationResult, Language, ProductInfo, TaxSettings } from '../types';
import { formatINR, formatPct } from '../utils/formatters';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  product: ProductInfo;
  tax: TaxSettings;
  language: Language;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  result,
  product,
  tax,
  language,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['SELLER PROFIT PRO - PRODUCT FINANCIAL REPORT'],
      ['Generated On', new Date().toLocaleString()],
      ['Product Name', product.name],
      ['SKU', product.sku || 'N/A'],
      ['Platform', result.platformName],
      [''],
      ['FINANCIAL METRIC', 'AMOUNT (INR)'],
      ['Customer Selling Price', result.customerSellingPrice],
      ['Taxable Revenue', result.taxableRevenue],
      ['Output GST', result.productOutputGst],
      ['Total Base Cost Per Unit', result.totalBaseCostPerUnit],
      ['Purchase Price', product.purchasePrice],
      ['Packaging & Printing', product.packagingCost + product.labelPrintingCost],
      ['Inbound Freight', product.inboundShipping],
      ['Total Platform Deductions', result.totalPlatformDeductions],
      ['Referral Commission', result.marketplaceReferralFee],
      ['Fixed & Closing Fees', result.marketplaceFixedClosingFees],
      ['Shipping & Fulfilment', result.marketplaceFulfilmentShipping],
      ['Payment Gateway Fee', result.marketplaceCollectionFee],
      ['GST on Platform Fees (18%)', result.gstOnMarketplaceFees],
      ['Advertising Spend', result.marketplaceAdvertisingFee],
      ['Return & RTO Loss Reserve', result.expectedLossReservePerOrder],
      ['Expected Bank Payout', result.expectedMarketplacePayout],
      ['Total Cost Per Sale', result.totalCostPerSuccessfulSale],
      ['Net Profit Per Delivered Sale', result.netProfit],
      ['Net Profit Margin (%)', result.netProfitMarginPct + '%'],
      ['Markup on Cost (%)', result.markupPct + '%'],
      ['Break-Even Selling Price', result.breakEvenSellingPrice],
      [''],
      ['VOLUME PROJECTIONS', 'ESTIMATED NET PROFIT'],
      ['10 Orders', result.profitOn10Orders],
      ['50 Orders', result.profitOn50Orders],
      ['100 Orders', result.profitOn100Orders],
      ['500 Orders', result.profitOn500Orders],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvRows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${(product.name || 'product').replace(/\s+/g, '_')}_profit_sheet.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Printable Cost Sheet & Profit Audit</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Page</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Document */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 font-sans print:p-0">
          {/* Printable Report Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                SELLER PROFIT PRO – INDIA
              </h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Marketplace Feasibility & Unit Economics Report
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div className="font-bold text-slate-800 uppercase mt-0.5">
                Target: {result.platformName}
              </div>
            </div>
          </div>

          {/* Product Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Product Name:</span>
              <span className="font-bold text-slate-900 text-sm">{product.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">SKU / ID:</span>
              <span className="font-semibold text-slate-800">{product.sku || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Weight:</span>
              <span className="font-semibold text-slate-800">
                {product.weight} {product.weightUnit}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">GST Rate:</span>
              <span className="font-semibold text-slate-800">{tax.productGstRatePct}%</span>
            </div>
          </div>

          {/* Key Results Summary Box */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 border rounded-xl bg-slate-50 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Customer Selling Price
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatINR(result.customerSellingPrice)}
              </div>
            </div>
            <div className="p-3.5 border rounded-xl bg-blue-50/50 border-blue-200 text-center">
              <span className="text-[11px] font-bold text-blue-800 uppercase">
                Expected Bank Payout
              </span>
              <div className="text-xl font-extrabold text-blue-900 mt-1">
                {formatINR(result.expectedMarketplacePayout)}
              </div>
            </div>
            <div
              className={`p-3.5 border rounded-xl text-center ${
                result.isProfitable ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
              }`}
            >
              <span className="text-[11px] font-bold uppercase text-slate-600">
                Net Profit per Sale
              </span>
              <div
                className={`text-xl font-black mt-1 ${
                  result.isProfitable ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {formatINR(result.netProfit)}
              </div>
              <span className="text-[11px] font-semibold text-slate-600">
                {formatPct(result.netProfitMarginPct)} Margin
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">Cost Component / Revenue</th>
                  <th className="py-2 px-3 text-right">Per Unit Amount (₹)</th>
                  <th className="py-2 px-3 text-right">% of Selling Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="font-semibold bg-slate-50">
                  <td className="py-2 px-3">Customer Selling Price</td>
                  <td className="py-2 px-3 text-right">{formatINR(result.customerSellingPrice)}</td>
                  <td className="py-2 px-3 text-right">100.0%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 pl-6 text-slate-600">Base Landed Product & Prep Cost</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    - {formatINR(result.totalBaseCostPerUnit)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    {formatPct((result.totalBaseCostPerUnit / result.customerSellingPrice) * 100)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 pl-6 text-slate-600">Marketplace Commission & Fixed Deductions</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    - {formatINR(result.totalMarketplaceFeesBeforeTax)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    {formatPct((result.totalMarketplaceFeesBeforeTax / result.customerSellingPrice) * 100)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 pl-6 text-slate-600">GST on Marketplace Services (18%)</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    - {formatINR(result.gstOnMarketplaceFees)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    {formatPct((result.gstOnMarketplaceFees / result.customerSellingPrice) * 100)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 pl-6 text-slate-600">Sponsored Advertising per Order</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    - {formatINR(result.marketplaceAdvertisingFee)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    {formatPct((result.marketplaceAdvertisingFee / result.customerSellingPrice) * 100)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 pl-6 text-slate-600">Return & RTO Risk Reserve</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    - {formatINR(result.expectedLossReservePerOrder)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    {formatPct((result.expectedLossReservePerOrder / result.customerSellingPrice) * 100)}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-extrabold text-slate-900">
                  <td className="py-2.5 px-3">NET POCKET PROFIT</td>
                  <td
                    className={`py-2.5 px-3 text-right ${
                      result.isProfitable ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {formatINR(result.netProfit)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-900">
                    {formatPct(result.netProfitMarginPct)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Volume Milestone Projection */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
              Monthly Order Scale Forecast
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 border rounded-lg bg-slate-50">
                <span className="text-slate-500 block">10 Orders</span>
                <span className="font-bold text-slate-900">{formatINR(result.profitOn10Orders)}</span>
              </div>
              <div className="p-2 border rounded-lg bg-slate-50">
                <span className="text-slate-500 block">50 Orders</span>
                <span className="font-bold text-slate-900">{formatINR(result.profitOn50Orders)}</span>
              </div>
              <div className="p-2 border rounded-lg bg-slate-50">
                <span className="text-slate-500 block">100 Orders</span>
                <span className="font-bold text-slate-900">{formatINR(result.profitOn100Orders)}</span>
              </div>
              <div className="p-2 border rounded-lg bg-slate-50">
                <span className="text-slate-500 block">500 Orders</span>
                <span className="font-bold text-slate-900">{formatINR(result.profitOn500Orders)}</span>
              </div>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
            Report generated via Seller Profit Pro – India. All estimations assume stable platform rate cards, standard delivery realization, and accurate cost allocations. This report is for financial planning and not certified legal or tax advice.
          </div>
        </div>
      </div>
    </div>
  );
};
