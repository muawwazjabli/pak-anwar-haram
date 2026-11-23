import { MeezabHotelSheetData } from './meezab-hotels-parser';

export const MEEZAB_RAMADAN_MAKKAH: MeezabHotelSheetData = {
  city: 'Makkah',
  seasonContext: 'Umrah 1448 H Ramadan Mubarak',
  publicationDate: '2026-11-09',
  voucherStartDate: '2026-11-10',
  visaRateBus: 550,
  makkahZiyarat: 10,
  madinahZiyarat: 10,
  dateBands: [
    {
      label: '06 FEB TILL 27 FEB',
      suggestedStartDate: '2027-02-06',
      suggestedEndDate: '2027-02-27',
      yearRollover: false
    },
    {
      label: '27 FEB TILL 11 MAR',
      suggestedStartDate: '2027-02-27',
      suggestedEndDate: '2027-03-11',
      yearRollover: false
    }
  ],
  hotels: [
    {
      hotelName: 'ARAFAT ZAHBI (Shuttle)',
      locationArea: 'UMM AL-MOUMIN STREET KUDAI',
      distanceRaw: 'SHUTTLE SERVICE',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '29', roomRateRaw: '160' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '49', roomRateRaw: '290' }
      ]
    },
    {
      hotelName: 'FAKHIR AL AZIZIA',
      locationArea: 'AZIZIA MAKKAH',
      distanceRaw: 'SHUTTLE SERVICE',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '33', roomRateRaw: '160' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '60', roomRateRaw: '280' }
      ]
    },
    {
      hotelName: 'SNOOD MOWTAN',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: 'SHUTTLE SERVICE',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '38', roomRateRaw: '180' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '65', roomRateRaw: '300' }
      ]
    },
    {
      hotelName: 'QILA AJYAD',
      locationArea: 'AJYAD STREET',
      distanceRaw: 'SHUTTLE SERVICE',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '40', roomRateRaw: '185' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '70', roomRateRaw: '320' }
      ]
    },
    {
      hotelName: 'TAJ FIDDI HOTEL',
      locationArea: 'AJYAD STREET',
      distanceRaw: '700-800 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '51', roomRateRaw: '220' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '90', roomRateRaw: '400' }
      ]
    },
    {
      hotelName: 'THAT HOTEL',
      locationArea: 'MISFALAH KUBRI',
      distanceRaw: '800-900 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '55', roomRateRaw: '250' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '95', roomRateRaw: '420' }
      ]
    },
    {
      hotelName: 'RUKAN AL ZAWIA',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '700-800 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '65', roomRateRaw: '290' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '120', roomRateRaw: '525' }
      ]
    },
    {
      hotelName: 'MELLA 1',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '650-700 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: 'N/A', roomRateRaw: '335' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: 'N/A', roomRateRaw: '600' }
      ]
    },
    {
      hotelName: 'MELLA 2',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '650-700 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '70', roomRateRaw: '335' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '130', roomRateRaw: '600' }
      ]
    },
    {
      hotelName: 'DIWAN AL BAIT',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '500-600 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '75', roomRateRaw: '350' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '135', roomRateRaw: '625' }
      ]
    },
    {
      hotelName: 'SAIF AL MAJD',
      locationArea: 'AL HAJLAH ROAD',
      distanceRaw: '650 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '75', roomRateRaw: '370' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '135', roomRateRaw: '650' }
      ]
    },
    {
      hotelName: 'AREEJ AL ZAHBI',
      locationArea: 'AL HIJRAH ROAD',
      distanceRaw: '450-500 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '82', roomRateRaw: '370' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '150', roomRateRaw: '680' }
      ]
    },
    {
      hotelName: 'ARFAT GOLDEN RUSHD (old DAR AL KHALIL AL RUSHD)',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '500 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '90', roomRateRaw: '400' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '160', roomRateRaw: '720' }
      ]
    },
    {
      hotelName: 'SHAMS AL ZAHBI',
      locationArea: 'AL HIJRAH ROAD',
      distanceRaw: '350-400 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: '99', roomRateRaw: '480' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: '170', roomRateRaw: '775' }
      ]
    },
    {
      hotelName: 'DAIF AJYAD',
      locationArea: 'AJYAD STREET',
      distanceRaw: '250-300 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: 'Quint 550', roomRateRaw: '500' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: 'Quint 850', roomRateRaw: '750' }
      ]
    },
    {
      hotelName: 'AREEJ AL WAFA',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '250-300 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: 'Quint 590', roomRateRaw: '550' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: 'Quint 1000', roomRateRaw: '900' }
      ]
    },
    {
      hotelName: 'NAWARA SHAMS 3',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '250-300 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 27 FEB', sharingRaw: 'Quint 680', roomRateRaw: '600' },
        { bandLabel: '27 FEB TILL 11 MAR', sharingRaw: 'Quint 1100', roomRateRaw: '1000' }
      ]
    }
  ]
};

export const MEEZAB_RAMADAN_MADINAH: MeezabHotelSheetData = {
  city: 'Madinah',
  seasonContext: 'Umrah 1448 H Ramadan Mubarak',
  publicationDate: '2026-11-09',
  voucherStartDate: '2026-11-10',
  visaRateBus: 550,
  makkahZiyarat: 10,
  madinahZiyarat: 10,
  dateBands: [
    {
      label: '06 FEB TILL 11 MAR',
      suggestedStartDate: '2027-02-06',
      suggestedEndDate: '2027-03-11',
      yearRollover: false
    }
  ],
  hotels: [
    {
      hotelName: 'HALA TAIBAH',
      locationArea: 'ABDUL AZIZ ROAD',
      distanceRaw: 'SHUTTLE SERVICE',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '35', roomRateRaw: '175' }
      ]
    },
    {
      hotelName: 'MANAZIL MARJAN',
      locationArea: 'QURBAN NAZIL ROAD',
      distanceRaw: 'SHUTTLE SERVICE',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '38', roomRateRaw: '190' }
      ]
    },
    {
      hotelName: 'WAHAT AL SHARK',
      locationArea: 'MASJID BILAL SIDE',
      distanceRaw: '750 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '45', roomRateRaw: '225' }
      ]
    },
    {
      hotelName: 'DIYAR AL SAFA (old Safa Center)',
      locationArea: 'MASJID BILAL SIDE',
      distanceRaw: '750 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '45', roomRateRaw: '225' }
      ]
    },
    {
      hotelName: 'MASA AL TAIBA',
      locationArea: 'MASJID BILAL SIDE',
      distanceRaw: '650-700 MTR',
      notes: 'NEW ADDITION',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '50', roomRateRaw: '250' }
      ]
    },
    {
      hotelName: 'ESSA KARIM HOTEL',
      locationArea: 'ALBAIK OPPOSITE SIDE',
      distanceRaw: '600 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '55', roomRateRaw: '250' }
      ]
    },
    {
      hotelName: 'ANWAR AL AWALI',
      locationArea: 'ALBAIK OPPOSITE SIDE',
      distanceRaw: '700 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '59', roomRateRaw: '270' }
      ]
    },
    {
      hotelName: 'MANAZIL MAJD',
      locationArea: 'MASJID BILAL SIDE',
      distanceRaw: '500-550 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '61', roomRateRaw: '280' }
      ]
    },
    {
      hotelName: 'NUZUL WAHA MADAIN',
      locationArea: 'MASJID BILAL SIDE',
      distanceRaw: '500-600 MTR',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '61', roomRateRaw: '280' }
      ]
    },
    {
      hotelName: 'ABRAJ ALAM AL NAJOOM',
      locationArea: 'AL ZAHIDA AREA QUBA ROAD',
      distanceRaw: '500-600 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '70', roomRateRaw: '320' }
      ]
    },
    {
      hotelName: 'BURJ MUKHTARA',
      locationArea: 'BAB AL SALAM ROAD',
      distanceRaw: '300-400 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '95', roomRateRaw: '425' }
      ]
    },
    {
      hotelName: 'ERGWAN AL MADINAH',
      locationArea: 'BAB AL SALAM ROAD',
      distanceRaw: '200-250 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: '110', roomRateRaw: '500' }
      ]
    },
    {
      hotelName: 'TAIF NEBRAS',
      locationArea: 'BEHIND MASJID - E-GHAMAMA SIDE',
      distanceRaw: '200-250 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: 'Quint 580', roomRateRaw: '550' }
      ]
    },
    {
      hotelName: 'RAMA AL MADINAH',
      locationArea: 'RAWDAH SIDE',
      distanceRaw: '100 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: '06 FEB TILL 11 MAR', sharingRaw: 'Quint 640', roomRateRaw: '600' }
      ]
    }
  ]
};

export const MEEZAB_REGULAR_MAKKAH: MeezabHotelSheetData = {
  city: 'Makkah',
  seasonContext: 'Umrah 1448 H Regular Season',
  publicationDate: '2026-11-17',
  voucherStartDate: '2026-11-18',
  visaRateBus: 550,
  visaRateOnly: 600,
  visaRatePartial: 575,
  makkahZiyarat: 10,
  madinahZiyarat: 10,
  dateBands: [
    {
      label: 'CHECKOUT TILL 30 NOV',
      suggestedStartDate: '2026-11-01',
      suggestedEndDate: '2026-11-30',
      yearRollover: false
    },
    {
      label: '30 NOV TILL 20 DEC',
      suggestedStartDate: '2026-11-30',
      suggestedEndDate: '2026-12-20',
      yearRollover: false
    },
    {
      label: '20 DEC TILL 06 FEB',
      suggestedStartDate: '2026-12-20',
      suggestedEndDate: '2027-02-06',
      yearRollover: true // Rollover 2026 to 2027!
    }
  ],
  hotels: [
    {
      hotelName: 'ARAFAT ZAHBI / FAKHIR AL AZIZIA',
      locationArea: 'UMM AL-MOUMIN STREET KUDAI / AZIZIA',
      distanceRaw: 'SHUTTLE SERVICE',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '16', roomRateRaw: '96' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '15', roomRateRaw: '90' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '19', roomRateRaw: '114' }
      ]
    },
    {
      hotelName: 'SNOOD MOWTAN',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: 'SHUTTLE SERVICE',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '19', roomRateRaw: '95' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '17', roomRateRaw: '85' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '27', roomRateRaw: '125' }
      ]
    },
    {
      hotelName: 'QILA AJYAD',
      locationArea: 'AJYAD STREET',
      distanceRaw: 'SHUTTLE SERVICE',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '21', roomRateRaw: '100' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '19', roomRateRaw: '90' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '29', roomRateRaw: '135' }
      ]
    },
    {
      hotelName: 'TAJ FIDDI HOTEL',
      locationArea: 'AJYAD STREET',
      distanceRaw: '700-800 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '25', roomRateRaw: '115' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '22', roomRateRaw: '100' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '31', roomRateRaw: '140' }
      ]
    },
    {
      hotelName: 'THAT HOTEL',
      locationArea: 'MISFALAH KUBRI',
      distanceRaw: '800-900 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '28', roomRateRaw: '125' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '25', roomRateRaw: '115' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '33', roomRateRaw: '150' }
      ]
    },
    {
      hotelName: 'AL KISWAH TOWERS',
      locationArea: 'AL TAYSIR STREET',
      distanceRaw: 'SHUTTLE SERVICE',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'N/A', roomRateRaw: '125' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'N/A', roomRateRaw: '125' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'N/A', roomRateRaw: '170' }
      ]
    },
    {
      hotelName: 'RUKAN AL ZAWIA',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '700-800 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '41', roomRateRaw: '185' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '39', roomRateRaw: '175' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '49', roomRateRaw: '225' }
      ]
    },
    {
      hotelName: 'MELLA 1',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '650-700 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'N/A', roomRateRaw: '195' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'N/A', roomRateRaw: '185' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'N/A', roomRateRaw: '265' }
      ]
    },
    {
      hotelName: 'MELLA 2',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '650-700 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '43', roomRateRaw: '195' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '41', roomRateRaw: '185' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '58', roomRateRaw: '265' }
      ]
    },
    {
      hotelName: 'DIWAN AL BAIT',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '500-600 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '46', roomRateRaw: '210' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '46', roomRateRaw: '210' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '58', roomRateRaw: '265' }
      ]
    },
    {
      hotelName: 'SAIF AL MAJD',
      locationArea: 'AL HAJLAH ROAD',
      distanceRaw: '650 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '46', roomRateRaw: '210' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '46', roomRateRaw: '210' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '58', roomRateRaw: '265' }
      ]
    },
    {
      hotelName: 'AREEJ AL ZAHBI',
      locationArea: 'AL HIJRAH ROAD',
      distanceRaw: '450-500 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '50', roomRateRaw: '225' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '50', roomRateRaw: '225' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '65', roomRateRaw: '295' }
      ]
    },
    {
      hotelName: 'ARFAT GOLDEN RUSHD (Ali DAR AL KHALIL AL RUSHD)',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '500 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '53', roomRateRaw: '235' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '53', roomRateRaw: '235' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '80', roomRateRaw: '360' }
      ]
    },
    {
      hotelName: 'BADAR AL MASA',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '600 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'N/A', roomRateRaw: '350' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'N/A', roomRateRaw: '350' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'N/A', roomRateRaw: '410' }
      ]
    },
    {
      hotelName: 'SHAMS AL ZAHBI',
      locationArea: 'AL HIJRAH ROAD',
      distanceRaw: '350-400 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '55', roomRateRaw: '250' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '55', roomRateRaw: '250' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '92', roomRateRaw: '415' }
      ]
    },
    {
      hotelName: 'DAIF AJYAD',
      locationArea: 'AJYAD STREET',
      distanceRaw: '250-300 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'Quint 360', roomRateRaw: '320' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'Quint 360', roomRateRaw: '320' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'Quint 420', roomRateRaw: '370' }
      ]
    },
    {
      hotelName: 'AREEJ AL WAFA',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '250-300 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'Quint 370', roomRateRaw: '340' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'Quint 370', roomRateRaw: '340' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'Quint 490', roomRateRaw: '465' }
      ]
    },
    {
      hotelName: 'NAWARA SHAMS 3',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '250-300 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'Quint 390', roomRateRaw: '360' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'Quint 390', roomRateRaw: '360' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'Quint 490', roomRateRaw: '465' }
      ]
    },
    {
      hotelName: 'LOLO AL FALAH',
      locationArea: 'IBRAHIM KHALIL ROAD',
      distanceRaw: '100 MTR',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'N/A', roomRateRaw: '550' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'N/A', roomRateRaw: '550' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'N/A', roomRateRaw: '650' }
      ]
    },
    {
      hotelName: 'TIME RUBA',
      locationArea: 'AL HAJJ ROAD',
      distanceRaw: 'SHUTTLE SERVICE',
      starRating: 4,
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'N/A', roomRateRaw: '135' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'N/A', roomRateRaw: '135' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'N/A', roomRateRaw: '195' }
      ]
    },
    {
      hotelName: 'PARK INN',
      locationArea: 'AZIZIA MAKKAH',
      distanceRaw: 'SHUTTLE SERVICE',
      starRating: 5,
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'N/A', roomRateRaw: '135' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'N/A', roomRateRaw: '135' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'N/A', roomRateRaw: '195' }
      ]
    }
  ]
};

export const MEEZAB_REGULAR_MADINAH: MeezabHotelSheetData = {
  city: 'Madinah',
  seasonContext: 'Umrah 1448 H Regular Season',
  publicationDate: '2026-11-17',
  voucherStartDate: '2026-11-18',
  visaRateBus: 550,
  visaRateOnly: 600,
  visaRatePartial: 575,
  makkahZiyarat: 10,
  madinahZiyarat: 10,
  dateBands: [
    {
      label: 'CHECKOUT TILL 30 NOV',
      suggestedStartDate: '2026-11-01',
      suggestedEndDate: '2026-11-30',
      yearRollover: false
    },
    {
      label: '30 NOV TILL 20 DEC',
      suggestedStartDate: '2026-11-30',
      suggestedEndDate: '2026-12-20',
      yearRollover: false
    },
    {
      label: '20 DEC TILL 06 FEB',
      suggestedStartDate: '2026-12-20',
      suggestedEndDate: '2027-02-06',
      yearRollover: true // Rollover 2026 to 2027!
    }
  ],
  hotels: [
    {
      hotelName: 'HALA TAIBAH',
      locationArea: 'ABDUL AZIZ ROAD',
      distanceRaw: 'SHUTTLE SERVICE',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '26', roomRateRaw: '120' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '23', roomRateRaw: '105' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '40', roomRateRaw: '180' }
      ]
    },
    {
      hotelName: 'MANAZIL MARJAN',
      locationArea: 'QURBAN NAZIL ROAD',
      distanceRaw: 'SHUTTLE SERVICE',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '28', roomRateRaw: '130' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '25', roomRateRaw: '115' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '45', roomRateRaw: '200' }
      ]
    },
    {
      hotelName: 'WAHAT AL SHARK',
      locationArea: 'MASJID BILAL SIDE',
      distanceRaw: '750 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '40', roomRateRaw: '185' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '38', roomRateRaw: '175' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '50', roomRateRaw: '225' }
      ]
    },
    {
      hotelName: 'DIYAR AL SAFA (old Safa Center)',
      locationArea: 'MASJID BILAL SIDE',
      distanceRaw: '750 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '40', roomRateRaw: '185' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '38', roomRateRaw: '175' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '50', roomRateRaw: '225' }
      ]
    },
    {
      hotelName: 'ESSA KARIM HOTEL',
      locationArea: 'ALBAIK OPPOSITE SIDE',
      distanceRaw: '600 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '42', roomRateRaw: '190' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '40', roomRateRaw: '180' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '52', roomRateRaw: '235' }
      ]
    },
    {
      hotelName: 'ANWAR AL AWALI',
      locationArea: 'ALBAIK OPPOSITE SIDE',
      distanceRaw: '700 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '46', roomRateRaw: '210' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '44', roomRateRaw: '200' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '55', roomRateRaw: '250' }
      ]
    },
    {
      hotelName: 'MANAZIL MAJD',
      locationArea: 'MASJID BILAL SIDE',
      distanceRaw: '500-550 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '46', roomRateRaw: '210' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '44', roomRateRaw: '200' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '58', roomRateRaw: '265' }
      ]
    },
    {
      hotelName: 'NUZUL WAHA MADAIN',
      locationArea: 'MASJID BILAL SIDE',
      distanceRaw: '500-600 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '48', roomRateRaw: '220' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '46', roomRateRaw: '210' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '60', roomRateRaw: '270' }
      ]
    },
    {
      hotelName: 'ABRAJ ALAM AL NAJOOM',
      locationArea: 'AL ZAHIDA AREA QUBA ROAD',
      distanceRaw: '500-600 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '55', roomRateRaw: '250' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '52', roomRateRaw: '235' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '68', roomRateRaw: '310' }
      ]
    },
    {
      hotelName: 'BURJ MUWADDAH',
      locationArea: 'BAB AL SALAM ROAD',
      distanceRaw: '300-400 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '64', roomRateRaw: '300' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '62', roomRateRaw: '290' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '87', roomRateRaw: '400' }
      ]
    },
    {
      hotelName: 'BURJ MUKHTARA',
      locationArea: 'BAB AL SALAM ROAD',
      distanceRaw: '300-400 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '64', roomRateRaw: '300' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '62', roomRateRaw: '290' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '87', roomRateRaw: '400' }
      ]
    },
    {
      hotelName: 'ERGWAN AL MADINAH',
      locationArea: 'BAB AL SALAM ROAD',
      distanceRaw: '200-250 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: '70', roomRateRaw: '350' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: '70', roomRateRaw: '350' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: '110', roomRateRaw: '500' }
      ]
    },
    {
      hotelName: 'TAIF NEBRAS',
      locationArea: 'BEHIND MASJID - E-GHAMAMA SIDE',
      distanceRaw: '200-250 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'Quint 390', roomRateRaw: '370' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'Quint 385', roomRateRaw: '360' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'Quint 570', roomRateRaw: '520' }
      ]
    },
    {
      hotelName: 'RAMA AL MADINAH',
      locationArea: 'RAWDAH SIDE',
      distanceRaw: '100 MTR',
      notes: 'RATE CHANGED',
      ratesByBand: [
        { bandLabel: 'CHECKOUT TILL 30 NOV', sharingRaw: 'Quint 440', roomRateRaw: '420' },
        { bandLabel: '30 NOV TILL 20 DEC', sharingRaw: 'Quint 420', roomRateRaw: '400' },
        { bandLabel: '20 DEC TILL 06 FEB', sharingRaw: 'Quint 630', roomRateRaw: '600' }
      ]
    }
  ]
};
