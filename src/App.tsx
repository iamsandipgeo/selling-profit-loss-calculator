import React, { useState, useEffect, useMemo } from 'react';
import {
  Language,
  LogisticsSettings,
  PlatformFeeConfig,
  PlatformId,
  PricingSettings,
  ProductInfo,
  SavedProduct,
  TaxSettings,
} from './types';
import { defaultPlatformFees, demoPresets } from './data/presets';
import { calculatePlatformProfit, solveSellingPrice } from './utils/calculator';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { DashboardTab } from './components/DashboardTab';
import { CalculatorTab } from './components/CalculatorTab';
import { PlatformComparisonTab } from './components/PlatformComparisonTab';
import { FeeTaxSettingsTab } from './components/FeeTaxSettingsTab';
import { SmartToolsTab } from './components/SmartToolsTab';
import { SavedProductsTab } from './components/SavedProductsTab';
import { HelpGlossaryTab } from './components/HelpGlossaryTab';
import { PrintReportModal } from './components/PrintReportModal';

const LOCAL_STORAGE_KEY_SAVED = 'seller_profit_pro_saved_products_v1';
const LOCAL_STORAGE_KEY_LANG = 'seller_profit_pro_language_v1';

export default function App() {
  const defaultPreset = demoPresets[0];

  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LANG);
    return saved === 'bn' || saved === 'en' ? saved : 'en';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Active platform
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('meesho');

  // Active Preset ID tracker
  const [activePresetId, setActivePresetId] = useState<string>(defaultPreset.id);

  // Core product details
  const [product, setProduct] = useState<ProductInfo>(defaultPreset.product);

  // Pricing settings
  const [pricing, setPricing] = useState<PricingSettings>(defaultPreset.pricing);

  // Logistics and Return Risk
  const [logistics, setLogistics] = useState<LogisticsSettings>(defaultPreset.logistics);

  // Tax and GST settings
  const [tax, setTax] = useState<TaxSettings>(defaultPreset.tax);

  // Platform Fee configurations
  const [platformFees, setPlatformFees] = useState<Record<PlatformId, PlatformFeeConfig>>(
    JSON.parse(JSON.stringify(defaultPlatformFees))
  );

  // Saved products stored in localStorage
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load saved products from localStorage', e);
    }
    // Seed with 1 demo saved profile
    return [
      {
        id: 'seed-kurti',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        product: demoPresets[0].product,
        pricing: demoPresets[0].pricing,
        logistics: demoPresets[0].logistics,
        tax: demoPresets[0].tax,
        selectedPlatform: 'meesho',
        platformFees: JSON.parse(JSON.stringify(defaultPlatformFees)),
      },
    ];
  });

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Persist language
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LANG, language);
  }, [language]);

  // Persist saved products
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SAVED, JSON.stringify(savedProducts));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [savedProducts]);

  // Derived effective customer selling price based on pricing strategy
  const effectiveSellingPrice = useMemo(() => {
    if (pricing.strategy === 'price') {
      return pricing.proposedSellingPrice || 0;
    }
    const solved = solveSellingPrice(
      pricing,
      pricing.proposedSellingPrice,
      0,
      0,
      platformFees[selectedPlatform],
      tax
    );
    return solved.price;
  }, [pricing, selectedPlatform, platformFees, tax]);

  // Derived calculation result for selected platform
  const currentResult = useMemo(() => {
    const activeFee = platformFees[selectedPlatform];
    return calculatePlatformProfit(
      selectedPlatform,
      activeFee.name,
      effectiveSellingPrice,
      product,
      logistics,
      activeFee,
      tax
    );
  }, [selectedPlatform, effectiveSellingPrice, product, logistics, platformFees, tax]);

  // Derived comparison results for all 3 platforms
  const comparisonResults = useMemo(() => {
    const res: Record<PlatformId, any> = {} as any;
    const platforms: PlatformId[] = ['meesho', 'amazon', 'flipkart'];

    platforms.forEach((pId) => {
      let pPrice = effectiveSellingPrice;
      if (pricing.strategy !== 'price') {
        const solved = solveSellingPrice(
          pricing,
          pricing.proposedSellingPrice,
          0,
          0,
          platformFees[pId],
          tax
        );
        pPrice = solved.price;
      }
      res[pId] = calculatePlatformProfit(
        pId,
        platformFees[pId].name,
        pPrice,
        product,
        logistics,
        platformFees[pId],
        tax
      );
    });

    return res;
  }, [effectiveSellingPrice, pricing, product, logistics, platformFees, tax]);

  // Handler: Load Preset
  const handleLoadPreset = (presetId: string) => {
    const found = demoPresets.find((p) => p.id === presetId);
    if (!found) return;

    setActivePresetId(found.id);
    setProduct(JSON.parse(JSON.stringify(found.product)));
    setPricing(JSON.parse(JSON.stringify(found.pricing)));
    setLogistics(JSON.parse(JSON.stringify(found.logistics)));
    setTax(JSON.parse(JSON.stringify(found.tax)));
    setPlatformFees(JSON.parse(JSON.stringify(found.platformFees)));
  };

  // Handler: Reset All
  const handleReset = () => {
    if (confirm('Reset all values to default sample data?')) {
      handleLoadPreset(defaultPreset.id);
      setSelectedPlatform('meesho');
    }
  };

  // Handler: Save Current Product
  const handleSaveCurrentProduct = (customName?: string) => {
    const newEntry: SavedProduct = {
      id: 'prod_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      product: {
        ...product,
        name: customName || product.name || 'Saved Product',
      },
      pricing: JSON.parse(JSON.stringify(pricing)),
      logistics: JSON.parse(JSON.stringify(logistics)),
      tax: JSON.parse(JSON.stringify(tax)),
      selectedPlatform,
      platformFees: JSON.parse(JSON.stringify(platformFees)),
    };

    setSavedProducts([newEntry, ...savedProducts]);
    alert(`Product profile "${newEntry.product.name}" successfully saved!`);
  };

  // Handler: Load Saved Product
  const handleLoadSavedProduct = (saved: SavedProduct) => {
    setProduct(JSON.parse(JSON.stringify(saved.product)));
    setPricing(JSON.parse(JSON.stringify(saved.pricing)));
    setLogistics(JSON.parse(JSON.stringify(saved.logistics)));
    setTax(JSON.parse(JSON.stringify(saved.tax)));
    setSelectedPlatform(saved.selectedPlatform);
    if (saved.platformFees) {
      setPlatformFees(JSON.parse(JSON.stringify(saved.platformFees)));
    }
    setActiveTab('calculator');
  };

  // Handler: Duplicate Product
  const handleDuplicateProduct = (id: string) => {
    const target = savedProducts.find((p) => p.id === id);
    if (!target) return;
    const duplicated: SavedProduct = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'prod_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      product: {
        ...target.product,
        name: `${target.product.name} (Copy)`,
      },
    };
    setSavedProducts([duplicated, ...savedProducts]);
  };

  // Handler: Delete Product
  const handleDeleteProduct = (id: string) => {
    setSavedProducts(savedProducts.filter((p) => p.id !== id));
  };

  // Handler: Import Backup
  const handleImportBackup = (imported: SavedProduct[]) => {
    setSavedProducts(imported);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        onLoadPreset={handleLoadPreset}
        onReset={handleReset}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        activePresetId={activePresetId}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        savedCount={savedProducts.length}
      />

      {/* Active Tab Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            result={currentResult}
            comparisonResults={comparisonResults}
            selectedPlatform={selectedPlatform}
            language={language}
            onNavigateToCalculator={() => setActiveTab('calculator')}
            onNavigateToComparison={() => setActiveTab('comparison')}
            onSelectPlatform={setSelectedPlatform}
            productName={product.name}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorTab
            product={product}
            onUpdateProduct={setProduct}
            pricing={pricing}
            onUpdatePricing={setPricing}
            logistics={logistics}
            onUpdateLogistics={setLogistics}
            tax={tax}
            onUpdateTax={setTax}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            platformFees={platformFees}
            result={currentResult}
            language={language}
          />
        )}

        {activeTab === 'comparison' && (
          <PlatformComparisonTab
            product={product}
            pricing={pricing}
            logistics={logistics}
            tax={tax}
            platformFees={platformFees}
            onUpdatePlatformFee={(id, fee) =>
              setPlatformFees({ ...platformFees, [id]: fee })
            }
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            language={language}
          />
        )}

        {activeTab === 'fees' && (
          <FeeTaxSettingsTab
            platformFees={platformFees}
            onUpdatePlatformFees={setPlatformFees}
            tax={tax}
            onUpdateTax={setTax}
            language={language}
          />
        )}

        {activeTab === 'tools' && (
          <SmartToolsTab
            product={product}
            pricing={pricing}
            logistics={logistics}
            tax={tax}
            platformFees={platformFees}
            selectedPlatform={selectedPlatform}
            result={currentResult}
            language={language}
          />
        )}

        {activeTab === 'saved' && (
          <SavedProductsTab
            savedProducts={savedProducts}
            onLoadProduct={handleLoadSavedProduct}
            onDuplicateProduct={handleDuplicateProduct}
            onDeleteProduct={handleDeleteProduct}
            onSaveCurrentProduct={handleSaveCurrentProduct}
            onImportBackup={handleImportBackup}
            language={language}
          />
        )}

        {activeTab === 'help' && <HelpGlossaryTab language={language} />}
      </main>

      {/* Printable Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={currentResult}
        product={product}
        tax={tax}
        language={language}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p className="font-medium">
            Seller Profit Pro – India • Smart E-Commerce Profit, Fee & Return Risk Calculator for Meesho, Amazon India & Flipkart.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            100% Client-Side & Offline Ready • Formulas verified against Indian marketplace rate cards and GST Act 2017.
          </p>
        </div>
      </footer>
    </div>
  );
}
