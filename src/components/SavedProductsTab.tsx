import React, { useState } from 'react';
import { Language, SavedProduct } from '../types';
import { translations } from '../utils/translations';
import { formatINR } from '../utils/formatters';
import {
  BookmarkCheck,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Upload,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

interface SavedProductsTabProps {
  savedProducts: SavedProduct[];
  onLoadProduct: (product: SavedProduct) => void;
  onDuplicateProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onSaveCurrentProduct: (name?: string) => void;
  onImportBackup: (products: SavedProduct[]) => void;
  language: Language;
}

export const SavedProductsTab: React.FC<SavedProductsTabProps> = ({
  savedProducts,
  onLoadProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onSaveCurrentProduct,
  onImportBackup,
  language,
}) => {
  const t = translations[language];
  const [saveNameInput, setSaveNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCurrentProduct(saveNameInput.trim() || undefined);
    setSaveNameInput('');
    setIsSaving(false);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedProducts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `seller_profit_pro_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
          alert('Successfully imported products backup!');
        } else {
          alert('Invalid JSON file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {t.savedProductsTitle} ({savedProducts.length})
              </h2>
              <p className="text-xs text-slate-500">
                Stored safely in your browser’s local storage. Works 100% offline.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isSaving ? (
            <button
              type="button"
              onClick={() => setIsSaving(true)}
              className="px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.saveProductBtn}</span>
            </button>
          ) : (
            <form onSubmit={handleSaveSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Profile Name (e.g. Surat Kurti 549)"
                value={saveNameInput}
                onChange={(e) => setSaveNameInput(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsSaving(false)}
                className="px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            </form>
          )}

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
          )}

          <label className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Product List */}
      {savedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 mt-3">
            {t.noSavedProducts}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Once you calculate a profitable price for your product on Meesho, Amazon, or Flipkart, save it here to quickly reference anytime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedProducts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {item.selectedPlatform.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">
                  {item.product.name || 'Unnamed Product'}
                </h3>
                <div className="text-xs text-slate-500">
                  SKU: {item.product.sku || 'N/A'} • Weight: {item.product.weight}{item.product.weightUnit}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-500 block">Selling Price:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatINR(item.pricing.proposedSellingPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Purchase Cost:</span>
                    <span className="font-bold text-slate-700 text-sm">
                      {formatINR(item.product.purchasePrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onLoadProduct(item)}
                  className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.loadProduct}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDuplicateProduct(item.id)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title={t.duplicateProduct}
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this saved product?')) {
                      onDeleteProduct(item.id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title={t.deleteProduct}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
