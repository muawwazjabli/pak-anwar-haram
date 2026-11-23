'use client';

import React, { useState } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const { language, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <Header />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
            {language === 'ur' ? 'پاک انوارِ حرم سے رابطہ کریں' : 'Contact Pak Anwar Haram'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            {language === 'ur'
              ? 'کسی بھی سوال، خصوصی گروپ کوٹیشن یا حج و عمرہ رہنمائی کے لیے ہماری ٹیم ہمہ وقت حاضر ہے۔'
              : 'Reach out to our reservation desk for custom group inquiries, private hotel rates or Umrah consultation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details Cards */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-brand-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-emerald-950">
                {language === 'ur' ? 'براہ راست رابطہ' : 'Direct Channels'}
              </h2>

              <div className="space-y-3 text-sm">
                <a
                  href="https://wa.me/923222188218"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold">WhatsApp Direct</div>
                    <div className="text-xs font-mono" dir="ltr">+92-322-2188218</div>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200">
                  <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                  <div>
                    <div className="font-bold">Landline Desk</div>
                    <div className="text-xs font-mono" dir="ltr">+92-40-4222634</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200">
                  <Mail className="w-5 h-5 text-brand-600 shrink-0" />
                  <div>
                    <div className="font-bold">Email</div>
                    <div className="text-xs font-mono" dir="ltr">info@pakanwarharam.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200">
                  <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Office Address</div>
                    <div className="text-xs text-gray-600">Pak Anwar Haram Travel & Tours, Multan / Sahiwal, Pakistan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-200 shadow-sm">
            {!submitted ? (
              <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <h2 className="text-lg font-bold text-emerald-950">
                  {language === 'ur' ? 'ہمیں پیغام بھیجیں' : 'Send an Inquiry'}
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zafar Iqbal"
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t.phoneWhatsApp}</label>
                  <input
                    type="text"
                    required
                    placeholder="0322-2188218"
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-sm font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Your inquiry or requirements..."
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'ur' ? 'پیغام بھیجیں' : 'Submit Message'}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-12 space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-950">
                  {language === 'ur' ? 'شکریہ! آپ کا پیغام موصول ہو چکا ہے۔' : 'Thank You! Message Received.'}
                </h3>
                <p className="text-xs text-gray-600">
                  Our team will contact you shortly on WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
