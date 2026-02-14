import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function CitySelector({
  backgroundImage,
  storageKey = "city",
  storageKeyAr = "city_ar",
  onDone,
}) {
  const reduceMotion = useReducedMotion();

 const GOVERNORATES = useMemo(
  () => [
    { ar: "القاهرة", en: "Cairo", lat: 30.025000, lng: 31.237500 },
    { ar: "الجيزة", en: "Giza", lat: 30.008056, lng: 31.210833 },
    { ar: "الإسكندرية", en: "Alexandria", lat: 31.200000, lng: 29.900000 },

    { ar: "الدقهلية", en: "Mansoura", lat: 31.036389, lng: 31.380556 },
    { ar: "البحر الأحمر", en: "Hurghada", lat: 27.252778, lng: 33.818056 },
    { ar: "البحيرة", en: "Damanhur", lat: 31.039167, lng: 30.469167 },
    { ar: "الفيوم", en: "Faiyum", lat: 29.310000, lng: 30.841667 },
    { ar: "الغربية", en: "Tanta", lat: 30.788333, lng: 31.001944 },
    { ar: "الإسماعيلية", en: "Ismailia", lat: 30.604167, lng: 32.272222 },
    { ar: "المنوفية", en: "Shibin El Kom", lat: 30.552500, lng: 31.009167 },
    { ar: "المنيا", en: "Minya", lat: 28.110000, lng: 30.750278 },
    { ar: "القليوبية", en: "Banha", lat: 30.466667, lng: 31.183333 },
    { ar: "الوادي الجديد", en: "Kharga", lat: 25.451389, lng: 30.546389 },
    { ar: "السويس", en: "Suez", lat: 29.973611, lng: 32.526389 },

    { ar: "أسوان", en: "Aswan", lat: 24.093333, lng: 32.906944 },
    { ar: "أسيوط", en: "Assiut", lat: 27.180833, lng: 31.183611 },
    { ar: "بني سويف", en: "Beni Suef", lat: 29.074444, lng: 31.097778 },
    { ar: "بورسعيد", en: "Port Said", lat: 31.256667, lng: 32.284167 },
    { ar: "دمياط", en: "Damietta", lat: 31.416667, lng: 31.816667 },

    { ar: "الشرقية", en: "Zagazig", lat: 30.587778, lng: 31.501944 },
    { ar: "جنوب سيناء", en: "El Tor", lat: 28.236389, lng: 33.625278 },
    { ar: "كفر الشيخ", en: "Kafr El Sheikh", lat: 31.114167, lng: 30.940000 },
    { ar: "مطروح", en: "Marsa Matruh", lat: 31.352500, lng: 27.245278 },

    { ar: "الأقصر", en: "Luxor", lat: 25.696389, lng: 32.645833 },
    { ar: "قنا", en: "Qena", lat: 26.164167, lng: 32.726667 },
    { ar: "شمال سيناء", en: "Arish", lat: 31.131667, lng: 33.798333 },
    { ar: "سوهاج", en: "Sohag", lat: 26.556944, lng: 31.694722 },
  ],
  []
);

  const [selectedEn, setSelectedEn] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // GPS states (خفيفة ومش بتأثر على التصميم)
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const selectedObj = useMemo(
    () => GOVERNORATES.find((g) => g.en === selectedEn),
    [GOVERNORATES, selectedEn]
  );

  const handleDone = () => {
    if (!selectedObj) return;

    // مؤقتًا زي ما انت عامل (لحد ما نحولها لإحداثيات في الخطوة الجاية)
    localStorage.setItem(storageKey, selectedObj.en); // ✅ للـ API الحالي
    localStorage.setItem(storageKeyAr, selectedObj.ar); // للعرض

    // لو موجود GPS قديم نخليه يتشال عشان يبقى واضح إن الاختيار يدوي
    localStorage.removeItem("lat");
    localStorage.removeItem("lng");

    onDone?.(selectedObj.en);
  };

  const handleGPS = () => {
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError("المتصفح لا يدعم تحديد الموقع.");
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // نخزن الإحداثيات — ده اللي هنستخدمه في الفيتش بعدين
        localStorage.setItem("lat", String(lat));
        localStorage.setItem("lng", String(lng));

        // للعرض
        localStorage.setItem(storageKeyAr, "موقعي الحالي");

        // ممكن نخلي city فاضي أو قيمة ثابتة (مش مهم لأننا هنعتمد على lat/lng)
        localStorage.setItem(storageKey, "GPS");

        setGpsLoading(false);

        // يفتح على طول
        onDone?.("GPS");
      },
      (err) => {
        setGpsLoading(false);

        // رسائل ودّية حسب سبب الفشل
        if (err?.code === 1) setGpsError("لازم تسمح بالـ GPS من المتصفح.");
        else if (err?.code === 2) setGpsError("تعذر تحديد موقعك الآن.");
        else if (err?.code === 3) setGpsError("الوقت انتهى.. جرّب تاني.");
        else setGpsError("حصل خطأ.. جرّب تاني.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            className="h-full w-full object-cover"
            alt="city background"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 shadow-[inset_0_0_220px_rgba(0,0,0,.85)]" />
        </div>

        {/* Content */}
        <motion.div
          dir="rtl"
          className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          <div className="mt-56 w-full max-w-md rounded-3xl border border-[#F3E6C8]/20 bg-black/10 p-4 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,.35)]">
            <label className="mb-2 block text-right text-sm text-[#F3E6C8]/90">
              المحافظة
            </label>

            {/* Custom Selector */}
            <div className="relative">
              {/* Dropdown Button */}
              <div
                onClick={() => setOpen((prev) => !prev)}
                className="cursor-pointer rounded-2xl bg-black/40 px-4 py-3 text-white backdrop-blur-md shadow-md"
              >
                {selectedObj ? selectedObj.ar : "اختر المحافظة..."}
              </div>

              {/* Dropdown List */}
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 mt-1 w-full rounded-2xl bg-black/70 backdrop-blur-md shadow-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                >
                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder="ابحث هنا..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 mb-2 rounded-lg bg-black/30 text-white placeholder-gray-400 outline-none"
                  />

                  {/* Options */}
                  {GOVERNORATES.filter((g) => g.ar.includes(search))
                    .slice(0, 100)
                    .map((g) => (
                      <div
                        key={g.en}
                        onClick={() => {
                          setSelectedEn(g.en);
                          setOpen(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-yellow-400/40 text-white"
                      >
                        {g.ar}
                      </div>
                    ))}
                </motion.div>
              )}
            </div>

            {/* GPS Button (مضاف من غير ما يكسر الديزاين) */}
            <motion.button
              onClick={handleGPS}
              disabled={gpsLoading}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              className={[
                "mt-3 w-full rounded-2xl py-3 font-bold transition border",
                gpsLoading
                  ? "bg-white/15 text-white/70 cursor-wait border-white/20"
                  : "bg-black/35 text-white hover:bg-black/45 border-[#F3E6C8]/20",
              ].join(" ")}
            >
              {gpsLoading ? "جاري تحديد موقعك..." : "تحديد موقعي الحالي تلقائيًا"}
            </motion.button>

            {gpsError ? (
              <div className="mt-2 text-right text-sm text-red-200/90">
                {gpsError}
              </div>
            ) : null}

            <motion.button
              onClick={handleDone}
              disabled={!selectedObj}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              className={[
                "mt-4 w-full rounded-2xl py-3 font-bold transition",
                selectedObj
                  ? "bg-[#E7C87A] text-black hover:brightness-105"
                  : "bg-white/30 text-white/70 cursor-not-allowed",
              ].join(" ")}
            >
              تم
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}