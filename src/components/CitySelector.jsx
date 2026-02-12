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
      { ar: "القاهرة", en: "Cairo" },
      { ar: "الجيزة", en: "Giza" },
      { ar: "الإسكندرية", en: "Alexandria" },
      { ar: "الدقهلية", en: "Dakahlia" },
      { ar: "البحر الأحمر", en: "RedSea" },
      { ar: "البحيرة", en: "Beheira" },
      { ar: "الفيوم", en: "Fayoum" },
      { ar: "الغربية", en: "Gharbia" },
      { ar: "الإسماعيلية", en: "Ismailia" },
      { ar: "المنوفية", en: "Menofia" },
      { ar: "المنيا", en: "Minya" },
      { ar: "القليوبية", en: "Qalyubia" },
      { ar: "الوادي الجديد", en: "NewValley" },
      { ar: "السويس", en: "Suez" },
      { ar: "أسوان", en: "Aswan" },
      { ar: "أسيوط", en: "Assiut" },
      { ar: "بني سويف", en: "BeniSuef" },
      { ar: "بورسعيد", en: "PortSaid" },
      { ar: "دمياط", en: "Damietta" },
      { ar: "الشرقية", en: "Sharkia" },
      { ar: "جنوب سيناء", en: "SouthSinai" },
      { ar: "كفر الشيخ", en: "KafrElSheikh" },
      { ar: "مطروح", en: "Matrouh" },
      { ar: "الأقصر", en: "Luxor" },
      { ar: "قنا", en: "Qena" },
      { ar: "شمال سيناء", en: "NorthSinai" },
      { ar: "سوهاج", en: "Sohag" },
    ],
    []
  );

  const [selectedEn, setSelectedEn] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedObj = useMemo(
    () => GOVERNORATES.find((g) => g.en === selectedEn),
    [GOVERNORATES, selectedEn]
  );

  const handleDone = () => {
    if (!selectedObj) return;
    localStorage.setItem(storageKey, selectedObj.en); // ✅ للـ API
    localStorage.setItem(storageKeyAr, selectedObj.ar); // اختياري للعرض
    onDone?.(selectedObj.en);
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
