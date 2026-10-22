import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
  HelpCircle,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface HelpGlossaryTabProps {
  language: Language;
}

export const HelpGlossaryTab: React.FC<HelpGlossaryTabProps> = ({ language }) => {
  const t = translations[language];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const glossaryItems = [
    {
      term: 'RTO (Return to Origin)',
      termBn: 'RTO (কুরিয়ার রিটার্ন টু অরিজিন)',
      descEn:
        'When a courier attempts to deliver a parcel (especially COD orders) but the customer refuses, is unreachable, or gave a fake address. The package travels back to the seller. The seller earns ₹0 revenue but must pay two-way shipping charges.',
      descBn:
        'যখন কাস্টমার পার্সেল গ্রহণ করতে অস্বীকার করে, ফোন না ধরে বা ভুল ঠিকানা দেয়, তখন পার্সেলটি বিক্রেতার কাছে ফেরত আসে। বিক্রেতা কোনো টাকা পান না, অথচ যাওয়ার এবং আসার উভয় কুরিয়ার চার্জ বিক্রেতার পকেট থেকে কাটা যায়।',
    },
    {
      term: 'Customer Return vs RTO',
      termBn: 'কাস্টমার রিটার্ন বনাম RTO',
      descEn:
        'A customer return occurs after delivery—the customer opens the product and requests a return within 7 days. An RTO happens before delivery at the customer doorstep. Customer returns often incur repackaging, reverse shipping, and minor damage loss.',
      descBn:
        'কাস্টমার রিটার্ন হলো ডেলিভারির পর গ্রাহক পণ্য খুলে দেখে ৭ দিনের মধ্যে ফেরত পাঠানো। আর RTO হলো ডেলিভারি হওয়ার আগেই গ্রাহক পার্সেল ফিরিয়ে দেওয়া। কাস্টমার রিটার্নে প্যাকিং নষ্ট হওয়া ও পণ্যের অবচয় বেশি হয়।',
    },
    {
      term: 'Meesho 0% Commission Model',
      termBn: 'মিশো ০% কমিশন মডেলের বাস্তবতা',
      descEn:
        'Meesho does not charge a referral commission percentage on most categories, allowing lower retail prices. However, sellers still pay shipping fees, 18% GST on shipping invoices, and bear severe losses on high COD return/RTO rates (15-25% in fashion).',
      descBn:
        'মিশো বেশিরভাগ ক্যাটাগরিতে রেফারাল কমিশন নেয় না, যার ফলে পণ্যের দাম কম রাখা যায়। তবে বিক্রেতাকে ডেলিভারি চার্জ, সেই চার্জের উপর ১৮% জিএসটি এবং গ্রাহক ফেরত দিলে রিভার্স শিপিং চার্জ দিতে হয়।',
    },
    {
      term: 'Input Tax Credit (ITC)',
      termBn: 'ইনপুট ট্যাক্স ক্রেডিট (ITC)',
      descEn:
        'When a GST-registered seller pays 18% GST on Amazon/Flipkart service fees or buys raw goods with GST, that GST is not an expense—it can be offset against the output GST collected from the customer.',
      descBn:
        'আপনি যখন কোনো পণ্য কিনেন বা অ্যামাজন/ফ্লিপকার্ট তাদের কমিশন ও সার্ভিসে ১৮% জিএসটি কাটে, জিএসটি রেজিস্টার্ড বিক্রেতা হিসেবে সেই টাকা আপনি সরকারের কাছে আউটপুট জিএসটি জমা দেওয়ার সময় মাইনাস (অ্যাডজাস্ট) করতে পারেন।',
    },
    {
      term: 'Margin vs Markup',
      termBn: 'প্রফিট মার্জিন বনাম মার্কআপ',
      descEn:
        'Margin is profit divided by customer selling price (e.g. ₹20 profit on ₹100 sale = 20% margin). Markup is profit divided by your product cost (e.g. ₹20 profit on ₹80 cost = 25% markup). Never confuse the two!',
      descBn:
        'মার্জিন হিসাব করা হয় বিক্রয় মূল্যের উপর (যেমন ১০০ টাকার বিক্রিতে ২০ টাকা লাভ = ২০% মার্জিন)। আর মার্কআপ হিসাব করা হয় কেনা খরচের উপর (যেমন ৮০ টাকার পণ্যে ২০ টাকা লাভ = ২৫% মার্কআপ)। দুটো এক নয়!',
    },
    {
      term: 'Charm Pricing (₹499 / ₹999)',
      termBn: 'চার্ম প্রাইসিং (₹৪৯৯ / ₹৯৯৯)',
      descEn:
        'Ending prices in 9 (such as ₹499 instead of ₹500, or ₹999 instead of ₹1000) makes the product psychologically feel in a lower price bracket, boosting click-through rates and sales conversions on Indian marketplaces.',
      descBn:
        'পণ্যের দামের শেষে ৯ রাখা (যেমন ৫০০ টাকার বদলে ৪৯৯ টাকা বা ১০০০ এর বদলে ৯৯৯ টাকা) ক্রেতার মনে দাম কম হওয়ার অনুভূতি তৈরি করে, যা ভারতীয় অনলাইন মার্কেটপ্লেসে বিক্রি বাড়াতে সাহায্য করে।',
    },
  ];

  const faqs = [
    {
      qEn: 'Why do first-time sellers lose money despite showing high sales?',
      qBn: 'নতুন বিক্রেতাদের প্রচুর বিক্রি হওয়া সত্ত্বেও কেন আর্থিক লোকসান হয়?',
      aEn: 'The #1 reason is ignoring COD RTO and customer returns! On Indian marketplaces, especially in clothing and footwear, 15% to 25% of placed orders are returned or rejected at doorstep. If your margin is thin (e.g. only ₹40 profit on successful sales) but you lose ₹120 on every returned order, 2 returns can erase the profit of 6 successful sales!',
      aBn: 'সবচেয়ে বড় কারণ হলো COD RTO ও রিটার্নের ঝুঁকি হিসাব না করা! ভারতে পোশাকে গড়ে ১৫-২৫% অর্ডার ফেরত আসে। আপনি যদি সফল অর্ডারে মাত্র ৪০ টাকা লাভ করেন কিন্তু প্রতি রিটার্নে ১২০ টাকা ক্ষতি হয়, তবে মাত্র ২টি রিটার্ন আপনার ৬টি সফল বিক্রির পুরো লাভ মুছে দেবে!',
    },
    {
      qEn: 'How does this calculator solve for selling price?',
      qBn: 'এই ক্যালকুলেটর কীভাবে সঠিক বিক্রয় মূল্য বের করে?',
      aEn: 'Most marketplace fees (referral commission, payment collection fee, TCS) are percentages of the selling price itself. Adding a fixed markup to cost gives the wrong answer because the fee grows with the price! Our calculator solves the algebraic equation: Selling Price = (Base Costs + Fixed Platform Fees + Target Profit) ÷ (1 - Total Variable Percentage Deductions).',
      aBn: 'মার্কেটপ্লেসের বেশিরভাগ ফি (কমিশন, পেমেন্ট গেটওয়ে, TCS) বিক্রয় মূল্যের শতাংশ হিসেবে কাটা হয়। সাধারণ নিয়মে দাম বাড়ালে ফি-ও বেড়ে যায়। আমাদের ক্যালকুলেটর সঠিক বীজগাণিতিক সূত্র ব্যবহার করে এমন নিখুঁত দাম বের করে যাতে সমস্ত ফি কাটার পর আপনার কাঙ্ক্ষিত লাভ অক্ষুণ্ণ থাকে।',
    },
    {
      qEn: 'What is a healthy profit margin for Indian e-commerce?',
      qBn: 'ভারতীয় ই-কমার্সে কত শতাংশ প্রফিট মার্জিন নিরাপদ?',
      aEn: 'Aim for a minimum 15% to 25% net profit margin on delivered sales. This provides a safety cushion to absorb returns, festive ad spend, damaged parcels, and price wars.',
      aBn: 'প্রতিটি সফল বিক্রয়ে কমপক্ষে ১৫% থেকে ২৫% নেট প্রফিট মার্জিন রাখার চেষ্টা করুন। এটি রিটার্ন, বিজ্ঞাপনের খরচ এবং পণ্যের সম্ভাব্য ক্ষতির বিরুদ্ধে একটি মজবুত আর্থিক নিরাপত্তা দেয়।',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.glossaryTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Essential knowledge, verified calculation examples, and risk factors for first-time sellers.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Calculation Worked Example Box */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-bold text-emerald-900">
            Worked Example & Verified Mathematical Proof
          </h3>
        </div>
        <p className="text-xs text-emerald-800 mt-1">
          Here is a transparent step-by-step audit of how Seller Profit Pro computes exact profit for a ₹549 cotton kurti sold on Amazon India:
        </p>

        <div className="mt-4 bg-white rounded-xl border border-emerald-200 p-4 text-xs font-mono text-slate-800 space-y-2">
          <div className="flex justify-between border-b pb-1">
            <span>Customer Selling Price (MRP on Amazon):</span>
            <span className="font-bold">₹549.00</span>
          </div>
          <div className="flex justify-between">
            <span>1. Taxable Value (at 5% GST = 549 ÷ 1.05):</span>
            <span>₹522.86 (Output GST: ₹26.14)</span>
          </div>
          <div className="flex justify-between">
            <span>2. Amazon Referral Commission (12% of ₹549):</span>
            <span>- ₹65.88</span>
          </div>
          <div className="flex justify-between">
            <span>3. Amazon Closing Fee (₹501-1000 slab):</span>
            <span>- ₹20.00</span>
          </div>
          <div className="flex justify-between">
            <span>4. Easy Ship National Delivery (500g slab):</span>
            <span>- ₹74.00</span>
          </div>
          <div className="flex justify-between">
            <span>5. Payment Collection Fee (2% of ₹549):</span>
            <span>- ₹10.98</span>
          </div>
          <div className="flex justify-between">
            <span>6. GST on Amazon Services (18% on fees):</span>
            <span>- ₹30.75</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-bold text-blue-700">
            <span>Expected Amazon Bank Payout:</span>
            <span>₹347.39</span>
          </div>
          <div className="flex justify-between">
            <span>7. Base Landed Cost (Purchase ₹210 + Inbound ₹8 + Box ₹9 + Label ₹2 + Prep ₹5):</span>
            <span>- ₹234.00</span>
          </div>
          <div className="flex justify-between">
            <span>8. Return/RTO Risk Reserve (14% return, 9% RTO):</span>
            <span>- ₹26.04</span>
          </div>
          <div className="flex justify-between">
            <span>9. Net GST Liability (Output GST - Amazon Service ITC):</span>
            <span>- ₹0.00 (Fully offset by ITC)</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-black text-sm text-emerald-700">
            <span>FINAL NET POCKET PROFIT PER DELIVERED PIECE:</span>
            <span>₹87.35 (16.7% Net Margin)</span>
          </div>
        </div>
      </div>

      {/* Key Terms Glossary Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Core E-Commerce Terms Glossary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossaryItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="font-bold text-slate-900 text-sm">
                {language === 'bn' ? item.termBn : item.term}
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {language === 'bn' ? item.descBn : item.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Frequently Asked Questions (FAQs)
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors"
                >
                  <span>{language === 'bn' ? faq.qBn : faq.qEn}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                    {language === 'bn' ? faq.aBn : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
