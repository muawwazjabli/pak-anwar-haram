'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, MessageCircle, Globe, Shield, Calendar, Package, Home } from 'lucide-react';

export default function Header() {
  const { language, setLanguage, t, dir } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-200/60 shadow-sm">
      {/* Top emergency & WhatsApp contact bar */}
      <div className="bg-emerald-900 text-brand-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-brand-300" />
              <span className="font-mono" dir="ltr">+92-40-4222634</span>
            </span>
            <span className="hidden sm:inline text-brand-300">|</span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp:</span>
              <a 
                href="https://wa.me/923222188218" 
                target="_blank" 
                rel="noreferrer"
                className="hover:underline font-mono text-emerald-300" 
                dir="ltr"
              >
                +92-322-2188218
              </a>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-brand-300 hidden md:inline">
              {language === 'ur' ? 'عمرہ 1448ھ بکنگز کھلی ہیں' : 'Umrah 1448H Bookings Open'}
            </span>
            <button
              onClick={() => setLanguage(language === 'ur' ? 'en' : 'ur')}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-800/80 hover:bg-emerald-700 text-brand-100 transition text-xs font-medium"
            >
              <Globe className="w-3 h-3 text-brand-300" />
              <span>{language === 'ur' ? 'English' : 'اردو'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-2xl shadow-md group-hover:scale-105 transition">
              <span>ح</span>
            </div>
            <div>
              <div className="font-bold text-xl sm:text-2xl text-emerald-950 tracking-tight flex items-center gap-2">
                <span>{language === 'ur' ? 'پاک انوارِ حرم' : 'Pak Anwar Haram'}</span>
                <span className="text-xs bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full border border-brand-300 font-normal">
                  Travel & Tours
                </span>
              </div>
              <p className="text-xs text-gray-500 font-urdu">
                {language === 'ur' ? 'سفرِ حرمین کے بااعتماد ساتھی' : 'Trusted Umrah & Group Travel'}
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-emerald-900 hover:bg-brand-50 transition flex items-center gap-1.5"
            >
              <Home className="w-4 h-4 text-brand-600" />
              <span>{t.navHome}</span>
            </Link>

            <Link
              href="/calculator"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-emerald-900 hover:bg-brand-50 transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>{t.navCalculator}</span>
            </Link>

            <Link
              href="/packages"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-emerald-900 hover:bg-brand-50 transition flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-brand-600" />
              <span>{t.navPackages}</span>
            </Link>

            <Link
              href="/contact"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-emerald-900 hover:bg-brand-50 transition"
            >
              <span>{t.navContact}</span>
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://wa.me/923222188218"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <Link
              href="/ops-portal/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-900 text-xs font-semibold shadow-sm transition"
            >
              <Shield className="w-3.5 h-3.5 text-brand-700" />
              <span>{t.navAdmin}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
