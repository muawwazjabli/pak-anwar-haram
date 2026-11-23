'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { formatPkr } from '@/lib/i18n/translations';
import { Hotel, AirlineGroup, Quote, OccupancyType } from '@/types';
import {
  Calendar,
  Plane,
  Building,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Users,
  Compass,
  MessageCircle,
  HelpCircle,
  AlertTriangle,
  Send,
  Sparkles,
  Info
} from 'lucide-react';

export default function CalculatorPage() {
  const { language, t, dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [step, setStep] = useState<number>(1);

  // Available data from APIs
  const [flights, setFlights] = useState<AirlineGroup[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Step 1: Flights & Party State
  const [departureCity, setDepartureCity] = useState<string>('Multan (MUX)');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [selectedFlightId, setSelectedFlightId] = useState<string>('flight-sv-801-800-mux');
  const [customFlightRequested, setCustomFlightRequested] = useState<boolean>(false);
  const [customTravelDate, setCustomTravelDate] = useState<string>('2026-12-27');
  const [customReturnDate, setCustomReturnDate] = useState<string>('2027-01-10');

  // Step 2 & 3: Itinerary Order (Makkah first vs Madinah first)
  const [order, setOrder] = useState<'makkah_first' | 'madinah_first'>('makkah_first');

  // Makkah Hotel
  const [makkahHotelName, setMakkahHotelName] = useState<string>('ARAFAT ZAHBI (Shuttle)');
  const [makkahCheckIn, setMakkahCheckIn] = useState<string>('2027-02-26');
  const [makkahCheckOut, setMakkahCheckOut] = useState<string>('2027-02-28');
  const [makkahOccupancy, setMakkahOccupancy] = useState<OccupancyType>('Double');
  const [makkahRoomsCount, setMakkahRoomsCount] = useState<number>(1);
  const [makkahBedsCount, setMakkahBedsCount] = useState<number>(2);

  // Madinah Hotel
  const [madinahHotelName, setMadinahHotelName] = useState<string>('HALA TAIBAH');
  const [madinahCheckIn, setMadinahCheckIn] = useState<string>('2027-02-28');
  const [madinahCheckOut, setMadinahCheckOut] = useState<string>('2027-03-05');
  const [madinahOccupancy, setMadinahOccupancy] = useState<OccupancyType>('Double');
  const [madinahRoomsCount, setMadinahRoomsCount] = useState<number>(1);
  const [madinahBedsCount, setMadinahBedsCount] = useState<number>(2);

  // Step 4: Visa & Transport
  const [visaType, setVisaType] = useState<'visa_with_bus' | 'visa_only' | 'partial_visa' | 'none'>('visa_with_bus');
  const [transportType, setTransportType] = useState<'bus_included' | 'private_sedan_4pax' | 'private_sedan_3pax' | 'private_sedan_2pax' | 'none'>('bus_included');
  const [makkahZiyarat, setMakkahZiyarat] = useState<boolean>(true);
  const [madinahZiyarat, setMadinahZiyarat] = useState<boolean>(true);

  // Step 5: Generated Quote & Booking submission state
  const [calculating, setCalculating] = useState<boolean>(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);
  const [bookingRef, setBookingRef] = useState<string>('');
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);

  // Load flights and hotels on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/flights?public=true').then(r => r.json()),
      fetch('/api/hotels?public=true').then(r => r.json())
    ]).then(([flightData, hotelData]) => {
      if (flightData.success && flightData.flights) setFlights(flightData.flights);
      if (hotelData.success && hotelData.hotels) setHotels(hotelData.hotels);
    }).catch(() => {})
    .finally(() => setLoadingInitial(false));
  }, []);

  // Compute pricing whenever navigating to Step 5
  const computePrice = async () => {
    setCalculating(true);
    try {
      const selectedFlight = flights.find(f => f.id === selectedFlightId);

      const payload = {
        customerName: customerName || 'Prospective Pilgrim',
        customerPhone: customerPhone || '',
        partyAdults: adults,
        partyChildren: children,
        partyInfants: infants,
        flight: customFlightRequested ? {
          flightSummary: `Custom Request: ${departureCity} (${customTravelDate} to ${customReturnDate})`,
          fareStatus: 'request_fare',
          sellingFarePkr: null
        } : (selectedFlight ? {
          airlineGroupId: selectedFlight.id,
          airlineName: selectedFlight.airlineName,
          flightSummary: `${selectedFlight.airlineCode} ${selectedFlight.flightNumbersSummary} (${selectedFlight.sector})`,
          fareStatus: selectedFlight.fareStatus,
          sellingFarePkr: selectedFlight.sellingFare
        } : undefined),
        makkahStay: {
          city: 'Makkah' as const,
          hotelName: makkahHotelName,
          checkInDate: makkahCheckIn,
          checkOutDate: makkahCheckOut,
          occupancyType: makkahOccupancy,
          roomsCount: makkahRoomsCount,
          bedsCount: makkahBedsCount,
          partyPax: adults + children
        },
        madinahStay: {
          city: 'Madinah' as const,
          hotelName: madinahHotelName,
          checkInDate: madinahCheckIn,
          checkOutDate: madinahCheckOut,
          occupancyType: madinahOccupancy,
          roomsCount: madinahRoomsCount,
          bedsCount: madinahBedsCount,
          partyPax: adults + children
        },
        visaTransport: {
          visaType,
          transportType,
          makkahZiyarat,
          madinahZiyarat,
          adultsCount: adults,
          childrenCount: children,
          infantsCount: infants
        }
      };

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.quote) {
        setQuote(data.quote);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 4) {
      await computePrice();
    }
    setStep(prev => Math.min(5, prev + 1));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const submitBookingRequest = async () => {
    if (!customerName || !customerPhone) {
      alert(language === 'ur' ? 'برائے مہربانی اپنا نام اور فون نمبر درج کریں۔' : 'Please provide your full name and phone/WhatsApp number.');
      return;
    }

    setSubmittingBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          quoteId: quote?.id,
          partySummary: `${adults} Adults, ${children} Children, ${infants} Infants | ${makkahHotelName} + ${madinahHotelName}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSubmitted(true);
        setBookingRef(data.requestReference);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const brand = 'Pak Anwar Haram / پاک انوار حرم';
    const ref = quote?.quoteReference || 'PAH-QUOTE';
    const total = quote?.sellingTotalPkr ? `PKR ${quote.sellingTotalPkr.toLocaleString()}` : 'Quote Request';
    const text = encodeURIComponent(
      `السلام علیکم! میں پاک انوار حرم کے حسبِ منشا پیکج کیلکولیٹر سے کوٹیشن بھیج رہا ہوں۔\n` +
      `📌 کوٹیشن ریفرنس: ${ref}\n` +
      `👥 مسافر: ${adults} بالغ، ${children} بچے، ${infants} شیر خوار\n` +
      `🕋 مکہ مکرمہ: ${makkahHotelName} (${makkahCheckIn} تا ${makkahCheckOut}) - ${makkahOccupancy}\n` +
      `🕌 مدینہ منورہ: ${madinahHotelName} (${madinahCheckIn} تا ${madinahCheckOut}) - ${madinahOccupancy}\n` +
      `✈️ فلائٹ: ${customFlightRequested ? 'کسٹم تاریخیں درکار' : selectedFlightId}\n` +
      `📋 ویزا و ٹرانسپورٹ: ${visaType} / ${transportType}\n` +
      `💰 کل قیمت کا تخمینہ: ${total}\n` +
      `برائے مہربانی سیٹوں اور ہوٹل دستیابی کی فوری تصدیق فرمائیں۔`
    );
    return `https://wa.me/923222188218?text=${text}`;
  };

  return (
    <>
      <Header />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Title & Breadcrumb */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-brand-700" />
            <span>{language === 'ur' ? 'عمرہ پیکیج بلڈر' : 'Custom Umrah Calculator'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950">
            {language === 'ur' ? 'اپنا حسبِ منشا عمرہ پیکیج بنائیں' : 'Build Your Custom Umrah Itinerary'}
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            {language === 'ur'
              ? 'مکہ و مدینہ کے ہوٹل، الگ الگ بیڈ یا کمرے، گروپ فلائٹس، ویزا اور ٹرانسپورٹ کا لمحہ بہ لمحہ درست حساب۔'
              : 'Accurate night-by-night rates, Double/Triple/Quad/Quint rooms, group flights, and verified visa bundle calculations.'}
          </p>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="mb-10 bg-white p-4 rounded-2xl border border-brand-200/80 shadow-sm">
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-medium">
            {[
              { num: 1, label: language === 'ur' ? '۱. فلائٹ' : '1. Flights' },
              { num: 2, label: language === 'ur' ? '۲. مکہ ہوٹل' : '2. Makkah' },
              { num: 3, label: language === 'ur' ? '۳. مدینہ ہوٹل' : '3. Madinah' },
              { num: 4, label: language === 'ur' ? '۴. ویزا / سفر' : '4. Visa' },
              { num: 5, label: language === 'ur' ? '۵. خلاصہ' : '5. Summary' }
            ].map(s => (
              <div
                key={s.num}
                className={`py-2 px-1 rounded-xl transition ${
                  step === s.num
                    ? 'bg-emerald-800 text-white font-bold shadow-sm'
                    : step > s.num
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'text-gray-400 bg-gray-50'
                }`}
              >
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: FLIGHTS & PARTY */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                <Plane className="w-5 h-5 text-brand-600" />
                <span>{t.step1Flights}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ur'
                  ? 'روانگی کا شہر اور مسافروں کی تعداد منتخب کریں۔'
                  : 'Select departure city and number of adult, child, and infant passengers.'}
              </p>
            </div>

            {/* Passenger counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.adults}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold text-emerald-950 w-8 text-center">{adults}</span>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.children}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold text-emerald-950 w-8 text-center">{children}</span>
                  <button
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.infants}</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold text-emerald-950 w-8 text-center">{infants}</span>
                  <button
                    onClick={() => setInfants(infants + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Departure airport */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t.departureAirport}</label>
              <select
                value={departureCity}
                onChange={e => setDepartureCity(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="Multan (MUX)">Multan (MUX) - ملتان انٹرنیشنل</option>
                <option value="Lahore (LHE)">Lahore (LHE) - علامہ اقبال لاہور</option>
                <option value="Islamabad (ISB)">Islamabad (ISB) - اسلام آباد انٹرنیشنل</option>
                <option value="Peshawar (PEW)">Peshawar (PEW) - پشاور انٹرنیشنل</option>
                <option value="Sialkot (SKT)">Sialkot (SKT) - سیالکوٹ انٹرنیشنل</option>
                <option value="Faisalabad (LYP)">Faisalabad (LYP) - فیصل آباد انٹرنیشنل</option>
                <option value="Karachi (KHI)">Karachi (KHI) - جناح انٹرنیشنل کراچی</option>
              </select>
            </div>

            {/* Flight Offers */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-900">
                  {language === 'ur' ? 'دستیاب ائیرلائن گروپ فلائٹس (مصدقہ جوڑے)' : 'Available Group Flight Pairs'}
                </label>
                <button
                  type="button"
                  onClick={() => setCustomFlightRequested(!customFlightRequested)}
                  className="text-xs text-brand-700 font-bold hover:underline"
                >
                  {customFlightRequested 
                    ? (language === 'ur' ? 'موجودہ لسٹ دیکھیں' : 'Show listed flights')
                    : (language === 'ur' ? 'دوسری تاریخ درکار ہے؟' : 'Request different dates?')}
                </button>
              </div>

              {!customFlightRequested ? (
                <div className="space-y-3">
                  {flights.map(fl => {
                    const isSelected = selectedFlightId === fl.id;
                    return (
                      <div
                        key={fl.id}
                        onClick={() => setSelectedFlightId(fl.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                            : 'border-gray-200 hover:border-brand-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{fl.airlineName} ({fl.flightNumbersSummary})</span>
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px] font-mono font-semibold text-gray-700" dir="ltr">
                              {fl.sector}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                            <span>Outbound: <strong dir="ltr">{fl.outboundDate} {fl.outboundDeptTime}</strong></span>
                            <span>Inbound: <strong dir="ltr">{fl.inboundDate} {fl.inboundDeptTime}</strong></span>
                            <span>Duration: <strong>{fl.durationDays} Days</strong></span>
                          </div>
                        </div>

                        <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                          <div>
                            {fl.fareStatus === 'request_fare' || !fl.sellingFare ? (
                              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                                {language === 'ur' ? 'قیمت کی تصدیق درکار (Request fare)' : 'Request fare'}
                              </span>
                            ) : (
                              <span className="text-base font-extrabold text-emerald-900 font-mono" dir="ltr">
                                {formatPkr(fl.sellingFare)}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {fl.availableSeats} {language === 'ur' ? 'سیٹیں باقی' : 'seats reported'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-brand-300 bg-brand-50/50 space-y-4">
                  <div className="text-xs text-brand-900 flex items-center gap-1.5 font-medium">
                    <Info className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>
                      {language === 'ur'
                        ? 'آپ اپنی مرضی کی تاریخیں لکھ سکتے ہیں۔ ہمارا عملہ ائیرلائن سے سیٹوں کی تصدیق کر کے کوٹ دے گا۔'
                        : 'Enter your preferred travel window. Our staff will check live airline GDS inventory and quote.'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{language === 'ur' ? 'روانگی کی تاریخ' : 'Outbound Date'}</label>
                      <input
                        type="date"
                        value={customTravelDate}
                        onChange={e => setCustomTravelDate(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{language === 'ur' ? 'واپسی کی تاریخ' : 'Inbound Date'}</label>
                      <input
                        type="date"
                        value={customReturnDate}
                        onChange={e => setCustomReturnDate(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: MAKKAH HOTEL */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                <Building className="w-5 h-5 text-brand-600" />
                <span>{t.step2Makkah}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ur'
                  ? 'مکہ مکرمہ کا ہوٹل، تاریخیں اور بیڈ یا کمرے کی ترتیب منتخب کریں۔'
                  : 'Select Makkah hotel, check-in inclusive / checkout exclusive dates, and room type.'}
              </p>
            </div>

            {/* Hotel picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{language === 'ur' ? 'مکہ کا ہوٹل' : 'Select Hotel'}</label>
              <select
                value={makkahHotelName}
                onChange={e => setMakkahHotelName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="ARAFAT ZAHBI (Shuttle)">ARAFAT ZAHBI (Shuttle) - شٹل سروس، قدائی</option>
                <option value="FAKHIR AL AZIZIA">FAKHIR AL AZIZIA - عزیزیہ مکہ</option>
                <option value="SNOOD MOWTAN">SNOOD MOWTAN - ابراہیم خلیل روڈ</option>
                <option value="QILA AJYAD">QILA AJYAD - اجیاد سٹریٹ</option>
                <option value="TAJ FIDDI HOTEL">TAJ FIDDI HOTEL - 700-800 میٹر</option>
                <option value="THAT HOTEL">THAT HOTEL - مسفلہ کبری</option>
                <option value="RUKAN AL ZAWIA">RUKAN AL ZAWIA - ابراہیم خلیل روڈ</option>
                <option value="DIWAN AL BAIT">DIWAN AL BAIT - 500-600 میٹر</option>
                <option value="SHAMS AL ZAHBI">SHAMS AL ZAHBI - 350-400 میٹر</option>
              </select>
            </div>

            {/* Dates: Check-in inclusive, checkout exclusive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.checkIn}</label>
                <input
                  type="date"
                  value={makkahCheckIn}
                  onChange={e => setMakkahCheckIn(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.checkOut}</label>
                <input
                  type="date"
                  value={makkahCheckOut}
                  onChange={e => setMakkahCheckOut(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm"
                />
              </div>
            </div>

            {/* Occupancy configuration */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t.occupancy}</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: 'Sharing', label: t.sharing },
                  { key: 'Double', label: t.double },
                  { key: 'Triple', label: t.triple },
                  { key: 'Quad', label: t.quad },
                  { key: 'Quint', label: t.quint }
                ].map(occ => (
                  <button
                    key={occ.key}
                    type="button"
                    onClick={() => setMakkahOccupancy(occ.key as OccupancyType)}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      makkahOccupancy === occ.key
                        ? 'border-emerald-600 bg-emerald-800 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300'
                    }`}
                  >
                    <span>{occ.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {makkahOccupancy !== 'Sharing' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {language === 'ur' ? 'کمروں کی تعداد (Rooms Count)' : 'Number of Private Rooms'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={makkahRoomsCount}
                  onChange={e => setMakkahRoomsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 p-2 rounded-lg border border-gray-300 bg-white text-sm font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {language === 'ur' ? 'مطلوبہ بیڈز (Beds Count)' : 'Number of Sharing Beds'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={makkahBedsCount}
                  onChange={e => setMakkahBedsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 p-2 rounded-lg border border-gray-300 bg-white text-sm font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: MADINAH HOTEL */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                <Building className="w-5 h-5 text-brand-600" />
                <span>{t.step3Madinah}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ur'
                  ? 'مدینہ منورہ کا ہوٹل، تاریخیں اور رہائش کی ترتیب۔'
                  : 'Select Madinah hotel, dates, and occupancy configuration.'}
              </p>
            </div>

            {/* Hotel picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{language === 'ur' ? 'مدینہ کا ہوٹل' : 'Select Hotel'}</label>
              <select
                value={madinahHotelName}
                onChange={e => setMadinahHotelName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="HALA TAIBAH">HALA TAIBAH - شٹل سروس، عبد العزیز روڈ</option>
                <option value="MANAZIL MARJAN">MANAZIL MARJAN - قربان نازل روڈ</option>
                <option value="WAHAT AL SHARK">WAHAT AL SHARK - 750 میٹر، مسجد بلال سائیڈ</option>
                <option value="DIYAR AL SAFA (old Safa Center)">DIYAR AL SAFA - 750 میٹر</option>
                <option value="MASA AL TAIBA">MASA AL TAIBA - 650-700 میٹر</option>
                <option value="ESSA KARIM HOTEL">ESSA KARIM HOTEL - 600 میٹر</option>
                <option value="ANWAR AL AWALI">ANWAR AL AWALI - 700 میٹر</option>
                <option value="BURJ MUKHTARA">BURJ MUKHTARA - 300-400 میٹر، باب السلام</option>
                <option value="ERGWAN AL MADINAH">ERGWAN AL MADINAH - 200-250 میٹر</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.checkIn}</label>
                <input
                  type="date"
                  value={madinahCheckIn}
                  onChange={e => setMadinahCheckIn(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t.checkOut}</label>
                <input
                  type="date"
                  value={madinahCheckOut}
                  onChange={e => setMadinahCheckOut(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm"
                />
              </div>
            </div>

            {/* Occupancy */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t.occupancy}</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: 'Sharing', label: t.sharing },
                  { key: 'Double', label: t.double },
                  { key: 'Triple', label: t.triple },
                  { key: 'Quad', label: t.quad },
                  { key: 'Quint', label: t.quint }
                ].map(occ => (
                  <button
                    key={occ.key}
                    type="button"
                    onClick={() => setMadinahOccupancy(occ.key as OccupancyType)}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                      madinahOccupancy === occ.key
                        ? 'border-emerald-600 bg-emerald-800 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300'
                    }`}
                  >
                    <span>{occ.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {madinahOccupancy !== 'Sharing' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {language === 'ur' ? 'کمروں کی تعداد (Rooms Count)' : 'Number of Private Rooms'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={madinahRoomsCount}
                  onChange={e => setMadinahRoomsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 p-2 rounded-lg border border-gray-300 bg-white text-sm font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {language === 'ur' ? 'مطلوبہ بیڈز (Beds Count)' : 'Number of Sharing Beds'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={madinahBedsCount}
                  onChange={e => setMadinahBedsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 p-2 rounded-lg border border-gray-300 bg-white text-sm font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 4: VISA & TRANSPORT */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span>{t.step4VisaTransport}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ur'
                  ? 'ویزا اور ٹرانسپورٹ کے اختیارات منتخب کریں۔ بس شامل ہونے پر ٹرانسپورٹ کے دہرے چارجز سے حفاظت۔'
                  : 'Configure visa package and transport. Prevents duplicate transport charges if bundled.'}
              </p>
            </div>

            {/* Visa category */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">{t.visaOptions}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => {
                    setVisaType('visa_with_bus');
                    setTransportType('bus_included');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    visaType === 'visa_with_bus'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">{t.visaWithBus}</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">550 SAR (بس شامل ہے)</div>
                  <div className="text-[11px] text-gray-500 mt-1">Group 01 to 47 pax</div>
                </div>

                <div
                  onClick={() => setVisaType('visa_only')}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    visaType === 'visa_only'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">{t.visaOnly}</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">600 SAR</div>
                  <div className="text-[11px] text-gray-500 mt-1">Without bus transport</div>
                </div>

                <div
                  onClick={() => setVisaType('partial_visa')}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    visaType === 'partial_visa'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">{t.partialVisa}</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">575 SAR</div>
                  <div className="text-[11px] text-gray-500 mt-1">Subject to embassy terms</div>
                </div>
              </div>
            </div>

            {/* Transport category */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'ٹرانسپورٹ (گاڑی کا انتخاب)' : 'Ground Transport Selection'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setTransportType('bus_included')}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    transportType === 'bus_included'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">
                    {language === 'ur' ? 'راؤنڈ ٹرپ بس ٹرانسپورٹ' : 'Round-Trip Bus Transport'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {visaType === 'visa_with_bus'
                      ? (language === 'ur' ? 'ویزا بنڈل میں مفت شامل ہے (0 SAR)' : 'Included in Visa Bundle (0 SAR extra)')
                      : '50 SAR per person'}
                  </div>
                </div>

                <div
                  onClick={() => setTransportType('private_sedan_4pax')}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    transportType === 'private_sedan_4pax'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">
                    {language === 'ur' ? 'نجی سیڈان کار (۴ افراد گاڑی)' : 'Private Sedan (4-Pax Vehicle)'}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">
                    620 SAR {language === 'ur' ? 'فی گاڑی (Jeddah to Makkah)' : 'per vehicle'}
                  </div>
                </div>
              </div>
            </div>

            {/* Ziyarat */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                {language === 'ur' ? 'مقدس مقامات کی زیارات' : 'Holy Sites Ziyarat Tours'}
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm">
                  <input
                    type="checkbox"
                    checked={makkahZiyarat}
                    onChange={e => setMakkahZiyarat(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>{t.ziyaratMakkah} (10 SAR)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm">
                  <input
                    type="checkbox"
                    checked={madinahZiyarat}
                    onChange={e => setMadinahZiyarat(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>{t.ziyaratMadinah} (10 SAR)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SUMMARY & BOOKING ENQUIRY */}
        {step === 5 && (
          <div className="space-y-6">
            {calculating ? (
              <div className="bg-white rounded-2xl border border-brand-200 p-12 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-bold text-emerald-950">
                  {language === 'ur' ? 'قیمت کا درست حساب لگایا جا رہا ہے...' : 'Computing accurate nightly package price...'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Checking hotel date bands, occupancy rates and current SAR-to-PKR conversion.
                </p>
              </div>
            ) : quote ? (
              <div className="space-y-6">
                {/* Quote header */}
                <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-emerald-800 pb-4">
                    <div>
                      <span className="text-xs uppercase text-brand-300 font-bold tracking-wider">
                        {language === 'ur' ? 'کوٹیشن ریفرنس نمبر' : 'Quote Reference'}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold font-mono text-brand-200" dir="ltr">
                        {quote.quoteReference}
                      </h3>
                    </div>
                    <div className="text-xs text-gray-300">
                      <span>Rate Lock: <strong>48 Hours</strong></span>
                    </div>
                  </div>

                  {/* Big Total Price */}
                  <div className="pt-2 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                    <div>
                      <span className="text-xs text-gray-300">{t.totalPrice}</span>
                      {quote.hasUnpricedComponents ? (
                        <div>
                          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                            {t.requestQuote}
                          </div>
                          <p className="text-xs text-amber-200/90 mt-1">
                            {quote.unpricedDetails.join(' • ')}
                          </p>
                        </div>
                      ) : (
                        <div className="text-3xl sm:text-5xl font-black text-brand-300 font-mono" dir="ltr">
                          {formatPkr(quote.sellingTotalPkr)}
                        </div>
                      )}
                    </div>

                    {!quote.hasUnpricedComponents && quote.sellingPerPersonPkr && (
                      <div className="sm:text-right">
                        <span className="text-xs text-gray-300">{t.pricePerPerson}</span>
                        <div className="text-xl font-bold text-white font-mono" dir="ltr">
                          {formatPkr(quote.sellingPerPersonPkr)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Itinerary Details breakdown */}
                <div className="bg-white rounded-2xl border border-brand-200 p-6 space-y-4 shadow-sm">
                  <h4 className="font-bold text-emerald-950 text-base border-b border-gray-100 pb-2">
                    {language === 'ur' ? 'تفصیلی شیڈول اور خدمات' : 'Itinerary Breakdown'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Makkah */}
                    <div className="p-4 rounded-xl bg-brand-50/40 border border-brand-100 space-y-1">
                      <div className="font-bold text-emerald-900 text-sm">🕋 مکہ مکرمہ: {makkahHotelName}</div>
                      <div className="text-gray-600">
                        Check-in: <strong dir="ltr">{makkahCheckIn}</strong> • Check-out: <strong dir="ltr">{makkahCheckOut}</strong>
                      </div>
                      <div className="text-gray-600">
                        Occupancy: <strong>{makkahOccupancy}</strong> ({makkahOccupancy === 'Sharing' ? `${makkahBedsCount} Beds` : `${makkahRoomsCount} Room(s)`})
                      </div>
                    </div>

                    {/* Madinah */}
                    <div className="p-4 rounded-xl bg-brand-50/40 border border-brand-100 space-y-1">
                      <div className="font-bold text-emerald-900 text-sm">🕌 مدینہ منورہ: {madinahHotelName}</div>
                      <div className="text-gray-600">
                        Check-in: <strong dir="ltr">{madinahCheckIn}</strong> • Check-out: <strong dir="ltr">{madinahCheckOut}</strong>
                      </div>
                      <div className="text-gray-600">
                        Occupancy: <strong>{madinahOccupancy}</strong> ({madinahOccupancy === 'Sharing' ? `${madinahBedsCount} Beds` : `${madinahRoomsCount} Room(s)`})
                      </div>
                    </div>
                  </div>

                  {/* Visa & Transport summary */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                    <div className="font-bold text-gray-900">
                      {language === 'ur' ? 'شامل خدمات:' : 'Included Ground Services:'}
                    </div>
                    <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                      <li>{visaType === 'visa_with_bus' ? 'Umrah Visa with Round-Trip Bus' : visaType}</li>
                      <li>{transportType === 'bus_included' ? 'Bus Transport' : 'Private Sedan Transport'}</li>
                      {makkahZiyarat && <li>Makkah Historical Sites Ziyarat</li>}
                      {madinahZiyarat && <li>Madinah Historical Sites Ziyarat</li>}
                      <li>Saudi VAT and Municipality fees included</li>
                    </ul>
                  </div>
                </div>

                {/* Direct Action Buttons: WhatsApp & Booking Form */}
                <div className="bg-white rounded-2xl border border-brand-200 p-6 sm:p-8 space-y-6 shadow-sm">
                  {!bookingSubmitted ? (
                    <div className="space-y-4">
                      <div className="border-b border-gray-100 pb-3">
                        <h4 className="font-bold text-emerald-950 text-base">
                          {t.submitBooking}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {language === 'ur'
                            ? 'اپنی کوٹیشن ہمارے عملے کو جمع کروائیں۔ ہم سیٹوں کی تصدیق اور واؤچر جاری کریں گے۔'
                            : 'Send your quote to staff for reservation hold and voucher preparation.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t.fullName} *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Muhammad Zafar"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">{t.phoneWhatsApp} *</label>
                          <input
                            type="text"
                            required
                            placeholder="0322-2188218"
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-sm font-mono"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="button"
                          onClick={submitBookingRequest}
                          disabled={submittingBooking}
                          className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>{submittingBooking ? 'درخواست جمع ہو رہی ہے...' : t.submitBooking}</span>
                        </button>

                        <a
                          href={generateWhatsAppMessage()}
                          target="_blank"
                          rel="noreferrer"
                          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{t.sendWhatsApp}</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-emerald-950 text-lg">
                        {language === 'ur' ? 'درخواست کامیابی کے ساتھ جمع ہو گئی ہے!' : 'Booking Enquiry Successfully Submitted!'}
                      </h4>
                      <p className="text-sm text-emerald-900 font-mono font-bold" dir="ltr">
                        Reference: {bookingRef}
                      </p>
                      <p className="text-xs text-emerald-800 max-w-md mx-auto">
                        {language === 'ur'
                          ? 'ہمارا عملہ جلد آپ سے واٹس ایپ پر رابطہ کرے گا اور آپ کے ویزا و ہوٹل واؤچر کی تصدیق فراہم کرے گا۔'
                          : 'Our reservation team has received your enquiry and will confirm room availability and voucher processing.'}
                      </p>
                      <a
                        href={generateWhatsAppMessage()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{language === 'ur' ? 'واٹس ایپ پر فوری یاد دہانی بھیجیں' : 'Send Fast Alert on WhatsApp'}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* STEP CONTROLS FOOTER */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-brand-200">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <span>{language === 'ur' ? 'واپس (Back)' : 'Previous'}</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <span>{language === 'ur' ? 'اگلا مرحلہ' : 'Next Step'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-900 text-xs font-semibold transition"
            >
              <span>{language === 'ur' ? 'نیا پیکیج بنائیں' : 'Start New Package'}</span>
            </button>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
