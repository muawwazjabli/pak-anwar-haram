'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-emerald-950 text-white border-t border-brand-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-xl">
                <span>ح</span>
              </div>
              <span className="font-bold text-xl text-brand-200">
                {language === 'ur' ? 'پاک انوارِ حرم' : 'Pak Anwar Haram'}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {language === 'ur'
                ? 'معزز زائرین کے لیے تصدیق شدہ ہول سیل ریٹس، ہوٹل، ویزا اور ائیرلائن گروپس کی شفاف بکنگ۔'
                : 'Providing verified, wholesale-backed Umrah packages, private hotel rates, visa processing and airline inventory.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Government Registered Umrah Services</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-brand-300 font-semibold mb-4 text-sm tracking-wide uppercase">
              {language === 'ur' ? 'اہم لنکس' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="hover:text-white transition">{t.navHome}</Link></li>
              <li><Link href="/calculator" className="hover:text-white transition">{t.navCalculator}</Link></li>
              <li><Link href="/packages" className="hover:text-white transition">{t.navPackages}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">{t.navContact}</Link></li>
              <li><Link href="/admin" className="hover:text-brand-300 transition text-brand-400">{t.navAdmin}</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-brand-300 font-semibold mb-4 text-sm tracking-wide uppercase">
              {language === 'ur' ? 'رابطہ کی تفصیلات' : 'Contact Information'}
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span dir="ltr">+92-40-4222634</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span dir="ltr">+92-322-2188218 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>info@pakanwarharam.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Pak Anwar Haram Travel & Tours, Multan / Sahiwal, Pakistan</span>
              </li>
            </ul>
          </div>

          {/* Security & Assurance */}
          <div>
            <h4 className="text-brand-300 font-semibold mb-4 text-sm tracking-wide uppercase">
              {language === 'ur' ? 'شفافیت اور ضمانت' : 'Pricing Guarantee'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              {language === 'ur'
                ? 'ہمارے پاس کسی قسم کی پوشیدہ فیس نہیں ہے۔ ہر پیکج مصدقہ ہوٹل واؤچرز اور تصدیق شدہ ائیرلائن سیٹوں پر مشتمل ہوتا ہے۔'
                : 'No hidden charges. Real-time nightly hotel rate calculations, inclusive check-in / exclusive checkout logic, and authentic group seats.'}
            </p>
            <div className="bg-emerald-900/60 p-3 rounded-lg border border-brand-800/40 text-xs text-brand-200">
              <span>{language === 'ur' ? 'ریفرنس پر مبنی کوٹیشن کی ۴۸ گھنٹے میعاد' : '48-Hour Rate Lock On Custom Quotes'}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-emerald-900 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Pak Anwar Haram (پاک انوار حرم). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
