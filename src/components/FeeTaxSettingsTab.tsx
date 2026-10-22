import React, { useState } from 'react';
import {
  GSTStatus,
  Language,
  PlatformFeeConfig,
  PlatformId,
  TaxSettings,
} from '../types';
import { translations } from '../utils/translations';
import { parseNumber } from '../utils/formatters';
import { defaultPlatformFees } from '../data/presets';
import {
  Settings2,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Percent,
  Receipt,
  Layers,
  HelpCircle,
  Building,
} from 'lucide-react';

interface FeeTaxSettingsTabProps {
  platformFees: Record<PlatformId, PlatformFeeConfig>;
  onUpdatePlatformFees: (fees: Record<PlatformId, PlatformFeeConfig>) => void;
  tax: TaxSettings;
  onUpdateTax: (tax: TaxSettings) => void;
  language: Language;
}

export const FeeTaxSettingsTab: React.FC<FeeTaxSettingsTabProps> = ({
  platformFees,
  onUpdatePlatformFees,
  tax,
  onUpdateTax,
  language,
}) => {
  const t = translations[language];
  const [activePlatformTab, setActivePlatformTab] = useState<PlatformId>('meesho');

  const handleFeeFieldChange = (
    platformId: PlatformId,
    field: keyof PlatformFeeConfig,
    value: string
  ) => {
    const num = parseNumber(value, 0);
    onUpdatePlatformFees({
      ...platformFees,
      [platformId]: {
        ...platformFees[platformId],
        [field]: num,
      },
    });
  };

  const handleResetFees = () => {
    onUpdatePlatformFees(JSON.parse(JSON.stringify(defaultPlatformFees)));
  };

  const activeFeeConfig = platformFees[activePlatformTab];

  return (
    <div className="space-y-6">
      {/* 1. Tax & GST Settings Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.taxTitle}</h3>
              <p className="text-xs text-slate-500">
                Configure your GST registration, product tax slab, and Input Tax Credit (ITC) eligibility.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {/* GST Registration Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.gstStatusLabel}
            </label>
            <div className="space-y-2">
              {[
                { id: 'registered', label: t.gstRegistered, desc: 'Have regular 15-digit GSTIN' },
                { id: 'not_registered', label: t.gstNotRegistered, desc: 'Enrolled under composition or exempt' },
                { id: 'unsure', label: t.gstUnsure, desc: 'New seller / testing the waters' },
              ].map((status) => (
                <label
                  key={status.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    tax.gstStatus === status.id
                      ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="gstStatus"
                    checked={tax.gstStatus === status.id}
                    onChange={() =>
                      onUpdateTax({
                        ...tax,
                        gstStatus: status.id as GSTStatus,
                        // non-registered cannot claim ITC
                        inputTaxCreditAvailable: status.id === 'registered',
                      })
                    }
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{status.label}</div>
                    <div className="text-[11px] text-slate-500">{status.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Product GST Slab Rate */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.productGstRate}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 5, 12, 18, 28].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onUpdateTax({ ...tax, productGstRatePct: rate })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    tax.productGstRatePct === rate
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Custom Product GST Rate (%):
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={tax.productGstRatePct}
                onChange={(e) =>
                  onUpdateTax({ ...tax, productGstRatePct: parseNumber(e.target.value, 0) })
                }
                className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Tax Toggles & Advance Settings */}
          <div className="space-y-3">
            {/* Price includes GST toggle */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={tax.isSellingPriceGstInclusive}
                onChange={(e) =>
                  onUpdateTax({ ...tax, isSellingPriceGstInclusive: e.target.checked })
                }
                className="mt-0.5 accent-blue-600 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {t.priceIncludesGst}
                </span>
                <span className="text-[11px] text-slate-500">
                  Standard on Meesho, Amazon & Flipkart India (MRP displayed is inclusive of GST).
                </span>
              </div>
            </label>

            {/* Input Tax Credit (ITC) Eligible */}
            <label
              className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                tax.gstStatus === 'registered'
                  ? 'border-slate-200 bg-slate-50 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                disabled={tax.gstStatus !== 'registered'}
                checked={tax.gstStatus === 'registered' && tax.inputTaxCreditAvailable}
                onChange={(e) =>
                  onUpdateTax({ ...tax, inputTaxCreditAvailable: e.target.checked })
                }
                className="mt-0.5 accent-blue-600 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {t.itcLabel}
                </span>
                <span className="text-[11px] text-slate-500">
                  Allows 18% GST charged on Amazon/Flipkart invoices to be offset against output GST.
                </span>
              </div>
            </label>

            {/* Optional Income Tax Provision */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.incomeTaxProvision}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="40"
                  value={tax.incomeTaxProvisionPct}
                  onChange={(e) =>
                    onUpdateTax({ ...tax, incomeTaxProvisionPct: parseNumber(e.target.value, 0) })
                  }
                  className="w-full pr-8 pl-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informative Tax Notice */}
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
          <FileCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Tax Treatment Summary:</strong> Output GST collected from customers is not seller profit. If you are GST registered, you pay output GST to the government after adjusting Input Tax Credit (ITC) on inventory and marketplace service charges. If you are not registered or exempt, GST charged by platforms on delivery/commission becomes a direct non-recoverable expense.
          </p>
        </div>
      </div>

      {/* 2. Marketplace Independent Fee Configurations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.marketplaceConfigTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Customize commission %, fixed fees, closing fees, and logistics charges for each portal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetFees}
            className="text-xs font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1.5 self-start sm:self-auto px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Rate Cards to Defaults</span>
          </button>
        </div>

        {/* Platform Selection Sub-Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mt-4 pb-2">
          <button
            type="button"
            onClick={() => setActivePlatformTab('meesho')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePlatformTab === 'meesho'
                ? 'bg-fuchsia-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Meesho Settings
          </button>
          <button
            type="button"
            onClick={() => setActivePlatformTab('amazon')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePlatformTab === 'amazon'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Amazon India (Easy Ship)
          </button>
          <button
            type="button"
            onClick={() => setActivePlatformTab('flipkart')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePlatformTab === 'flipkart'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Flipkart Settings
          </button>
        </div>

        {/* Active Platform Fee Edit Form */}
        <div className="mt-5 space-y-4">
          <div className="text-xs font-semibold text-slate-500 italic">
            {activeFeeConfig.notes}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Referral Commission % */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.commissionFeePct}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={activeFeeConfig.referralCommissionPct}
                  onChange={(e) =>
                    handleFeeFieldChange(activePlatformTab, 'referralCommissionPct', e.target.value)
                  }
                  className="w-full pr-8 pl-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
            </div>

            {/* Fixed Fee per order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.fixedFee}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={activeFeeConfig.fixedFee}
                  onChange={(e) =>
                    handleFeeFieldChange(activePlatformTab, 'fixedFee', e.target.value)
                  }
                  className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {/* Closing Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.closingFee}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={activeFeeConfig.closingFee}
                  onChange={(e) =>
                    handleFeeFieldChange(activePlatformTab, 'closingFee', e.target.value)
                  }
                  className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {/* Shipping / Fulfilment Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.shippingFulfilmentFee}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={activeFeeConfig.shippingFee}
                  onChange={(e) =>
                    handleFeeFieldChange(activePlatformTab, 'shippingFee', e.target.value)
                  }
                  className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {/* Payment Collection Fee % */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.collectionFeePct}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={activeFeeConfig.collectionFeePct}
                  onChange={(e) =>
                    handleFeeFieldChange(activePlatformTab, 'collectionFeePct', e.target.value)
                  }
                  className="w-full pr-8 pl-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
            </div>

            {/* Pick & Pack Fulfilment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pick & Pack / Fulfilment (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={activeFeeConfig.fulfilmentFee}
                  onChange={(e) =>
                    handleFeeFieldChange(activePlatformTab, 'fulfilmentFee', e.target.value)
                  }
                  className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {/* Advertising Spend per Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.advertisingSpend}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={activeFeeConfig.advertisingCostPerOrder}
                  onChange={(e) =>
                    handleFeeFieldChange(
                      activePlatformTab,
                      'advertisingCostPerOrder',
                      e.target.value
                    )
                  }
                  className="w-full pl-7 pr-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {/* GST on Marketplace Services */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.gstOnFees}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="28"
                  value={activeFeeConfig.gstOnFeesPct}
                  onChange={(e) =>
                    handleFeeFieldChange(activePlatformTab, 'gstOnFeesPct', e.target.value)
                  }
                  className="w-full pr-8 pl-3 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Legal / Rate Card Disclaimer */}
        <div className="mt-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>{t.disclaimerMarketplaceFees}</p>
        </div>
      </div>
    </div>
  );
};
