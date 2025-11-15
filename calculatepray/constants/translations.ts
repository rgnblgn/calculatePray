export type Language = "tr" | "en" | "ar";

export interface Translations {
  // Language Selection
  languageSelection: {
    title: string;
    subtitle: string;
    continue: string;
  };

  // Onboarding
  onboarding: {
    title: string;
    startDateLabel: string;
    debtDateLabel: string;
    yearsAgoPlaceholder: string;
    or: string;
    selectDate: string;
    continue: string;
  };

  // Main Screen
  main: {
    title: string;
    subtitle: string;
    resetButton: string;
    currentDebts: string;
    total: string;
    voluntaryPrayers: string;
    approxDays: string;
    noDays: string;
    congratulations: string;
    debtMessage: string;
    showDetails: string;
    hideDetails: string;
    detailsTitle: string;
    pieces: string;
    saveButton: string;
    savedMessage: string;
    savedDescription: string;
    noVoluntaryWarning: string;
    resetWarning: string;
    resetWarningMessage: string;
    cancel: string;
    yesDelete: string;
  };

  // Fasting Screen
  fasting: {
    title: string;
    subtitle: string;
    debtLabel: string;
    infoText: string;
    successText: string;
    tipsTitle: string;
    tipsText: string;
  };

  // Daily Ayah
  ayah: {
    title: string;
  };

  // Prayer names
  prayers: {
    sabah: string;
    ogle: string;
    ikindi: string;
    aksam: string;
    yatsi: string;
  };
}

export const translations: Record<Language, Translations> = {
  tr: {
    languageSelection: {
      title: "🌍 Dil Seçimi",
      subtitle: "Lütfen dilinizi seçin",
      continue: "Devam Et",
    },
    onboarding: {
      title: "🕌 Namaz Takip",
      startDateLabel: "Başlangıç Tarihi",
      debtDateLabel: "Borç Tarihi",
      yearsAgoPlaceholder: "Kaç yıl önce? (ör: 5)",
      or: "veya",
      selectDate: "Tarih Seç",
      continue: "Devam Et ✓",
    },
    main: {
      title: "🕌 Namaz Takip",
      subtitle: "Kaza namazlarınızı kolayca yönetin",
      resetButton: "Yeni Tarih Gir",
      currentDebts: "📊 Güncel Kazalar",
      total: "Toplam",
      voluntaryPrayers: "🌟 Nafile Namazlar",
      approxDays: "Yaklaşık",
      noDays: "gün borcunuz var.",
      congratulations: "Tebrikler! Borcunuz kalmadı! 🎉",
      debtMessage: "Allah namazlarınızı kabul etsin. 🤲",
      showDetails: "Detayları Göster",
      hideDetails: "Detayları Gizle",
      detailsTitle: "Vakit Bazında Kalan Borçlar:",
      pieces: "adet",
      saveButton: "Kaydet ve Borçtan Düş",
      savedMessage: "✅ Kaydedildi",
      savedDescription: "nafile namaz borçtan düşüldü. Allah kabul etsin! 🤲",
      noVoluntaryWarning: "Kaydedilecek nafile namaz bulunmuyor.",
      resetWarning: "⚠️ Emin Misiniz?",
      resetWarningMessage:
        "Tüm veriler silinecek ve yeni tarih girişi yapmanız gerekecek. Devam etmek istiyor musunuz?",
      cancel: "İptal",
      yesDelete: "Evet, Sil",
    },
    fasting: {
      title: "🌙 Oruç Takip",
      subtitle: "Kaza oruçlarınızı kolayca yönetin",
      debtLabel: "Kaza Orucu Borcu",
      infoText: "Kalan borcunuz",
      successText: "✅ Tebrikler! Borcunuz kalmadı! 🎉",
      tipsTitle: "💡 İpucu",
      tipsText:
        "• Her tuttuğunuz kaza orucunda (-) butonuna basın\n• Yeni borç oluştuğunda (+) butonuna basın\n• Verileriniz otomatik olarak kaydedilir",
    },
    ayah: {
      title: "📖 Günün Ayeti",
    },
    prayers: {
      sabah: "Sabah",
      ogle: "Öğle",
      ikindi: "İkindi",
      aksam: "Akşam",
      yatsi: "Yatsı",
    },
  },
  en: {
    languageSelection: {
      title: "🌍 Language Selection",
      subtitle: "Please select your language",
      continue: "Continue",
    },
    onboarding: {
      title: "🕌 Prayer Tracker",
      startDateLabel: "Start Date",
      debtDateLabel: "Debt Date",
      yearsAgoPlaceholder: "How many years ago? (e.g: 5)",
      or: "or",
      selectDate: "Select Date",
      continue: "Continue ✓",
    },
    main: {
      title: "🕌 Prayer Tracker",
      subtitle: "Easily manage your missed prayers",
      resetButton: "Enter New Date",
      currentDebts: "📊 Current Debts",
      total: "Total",
      voluntaryPrayers: "🌟 Voluntary Prayers",
      approxDays: "Approximately",
      noDays: "days of debt remaining.",
      congratulations: "Congratulations! No debt remaining! 🎉",
      debtMessage: "May Allah accept your prayers. 🤲",
      showDetails: "Show Details",
      hideDetails: "Hide Details",
      detailsTitle: "Remaining Debts by Prayer Time:",
      pieces: "pieces",
      saveButton: "Save and Deduct from Debt",
      savedMessage: "✅ Saved",
      savedDescription:
        "voluntary prayers deducted from debt. May Allah accept! 🤲",
      noVoluntaryWarning: "No voluntary prayers to save.",
      resetWarning: "⚠️ Are You Sure?",
      resetWarningMessage:
        "All data will be deleted and you will need to enter a new date. Do you want to continue?",
      cancel: "Cancel",
      yesDelete: "Yes, Delete",
    },
    fasting: {
      title: "🌙 Fasting Tracker",
      subtitle: "Easily manage your missed fasts",
      debtLabel: "Missed Fasting Debt",
      infoText: "Remaining debt",
      successText: "✅ Congratulations! No debt remaining! 🎉",
      tipsTitle: "💡 Tip",
      tipsText:
        "• Press (-) button for each fast you complete\n• Press (+) button when new debt occurs\n• Your data is saved automatically",
    },
    ayah: {
      title: "📖 Verse of the Day",
    },
    prayers: {
      sabah: "Fajr",
      ogle: "Dhuhr",
      ikindi: "Asr",
      aksam: "Maghrib",
      yatsi: "Isha",
    },
  },
  ar: {
    languageSelection: {
      title: "🌍 اختيار اللغة",
      subtitle: "الرجاء اختيار لغتك",
      continue: "متابعة",
    },
    onboarding: {
      title: "🕌 متابعة الصلاة",
      startDateLabel: "تاريخ البداية",
      debtDateLabel: "تاريخ الدين",
      yearsAgoPlaceholder: "منذ كم سنة؟ (مثال: 5)",
      or: "أو",
      selectDate: "اختر التاريخ",
      continue: "متابعة ✓",
    },
    main: {
      title: "🕌 متابعة الصلاة",
      subtitle: "إدارة صلواتك الفائتة بسهولة",
      resetButton: "أدخل تاريخ جديد",
      currentDebts: "📊 الديون الحالية",
      total: "المجموع",
      voluntaryPrayers: "🌟 صلوات نافلة",
      approxDays: "تقريباً",
      noDays: "يوم من الدين المتبقي.",
      congratulations: "تهانينا! لا يوجد دين متبقي! 🎉",
      debtMessage: "تقبل الله صلواتك. 🤲",
      showDetails: "إظهار التفاصيل",
      hideDetails: "إخفاء التفاصيل",
      detailsTitle: "الديون المتبقية حسب وقت الصلاة:",
      pieces: "قطعة",
      saveButton: "احفظ واخصم من الدين",
      savedMessage: "✅ تم الحفظ",
      savedDescription: "صلوات نافلة خصمت من الدين. تقبل الله! 🤲",
      noVoluntaryWarning: "لا توجد صلوات نافلة للحفظ.",
      resetWarning: "⚠️ هل أنت متأكد؟",
      resetWarningMessage:
        "سيتم حذف جميع البيانات وستحتاج إلى إدخال تاريخ جديد. هل تريد المتابعة؟",
      cancel: "إلغاء",
      yesDelete: "نعم، احذف",
    },
    fasting: {
      title: "🌙 متابعة الصيام",
      subtitle: "إدارة صيامك الفائت بسهولة",
      debtLabel: "دين الصيام الفائت",
      infoText: "الدين المتبقي",
      successText: "✅ تهانينا! لا يوجد دين متبقي! 🎉",
      tipsTitle: "💡 نصيحة",
      tipsText:
        "• اضغط على زر (-) لكل صيام تكمله\n• اضغط على زر (+) عند حدوث دين جديد\n• يتم حفظ بياناتك تلقائياً",
    },
    ayah: {
      title: "📖 آية اليوم",
    },
    prayers: {
      sabah: "الفجر",
      ogle: "الظهر",
      ikindi: "العصر",
      aksam: "المغرب",
      yatsi: "العشاء",
    },
  },
};

export const getTranslation = (language: Language): Translations => {
  return translations[language];
};
