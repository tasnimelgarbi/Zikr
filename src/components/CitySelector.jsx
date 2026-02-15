import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/** ===== Overlay Component (Popup Loading) ===== */
function GpsLoadingOverlay({ open, seconds = 0, onCancel }) {
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!open) return;

    if (seconds < 4) setHint("بنحدد موقعك بدقة…");
    else if (seconds < 9) setHint("معلش ثانية… الدقة العالية بتاخد وقت بسيط 🙏");
    else setHint("لو طولت، فعّل Location من الجهاز أو جرّب تاني.");

  }, [open, seconds]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div dir="rtl" className="w-[92%] max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>

          <div className="flex-1">
            <div className="text-base font-extrabold text-zinc-900">
              جاري تحديد موقعك
            </div>
            <div className="text-sm text-zinc-600 mt-0.5">{hint}</div>
          </div>

          <div className="text-xs font-bold text-zinc-500">
            {String(seconds).padStart(2, "0")}s
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-700 leading-relaxed">
          عشان المواقيت تطلع مظبوطة، بنستخدم دقة عالية — أول مرة ممكن تاخد شوية.
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-extrabold text-zinc-700 active:scale-[0.99]"
          >
            إلغاء
          </button>

        </div>
      </div>
    </div>
  );
}

/** ===== GPS helpers ===== */
const toRad = (d) => (d * Math.PI) / 180;

const haversineMeters = (aLat, aLng, bLat, bLng) => {
  const R = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1));
};

const getStableLocation = async ({
  tries = 3,
  minAcceptableAccuracy = 2000, // 2km
  maxJumpMeters = 50000, // 50km
} = {}) => {
  const lastLat = Number(localStorage.getItem("lat"));
  const lastLng = Number(localStorage.getItem("lng"));
  const hasLast = Number.isFinite(lastLat) && Number.isFinite(lastLng);

  let best = null;

  const getOnce = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });

  for (let i = 0; i < tries; i++) {
    const pos = await getOnce();
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = pos.coords.accuracy ?? Infinity;

    if (hasLast) {
      const jump = haversineMeters(lastLat, lastLng, lat, lng);
      if (jump > maxJumpMeters && accuracy > 5000) continue;
    }

    if (!best || accuracy < best.accuracy) best = { lat, lng, accuracy };

    if (accuracy <= minAcceptableAccuracy) break;
  }

  if (!best) throw new Error("No reliable location");
  if (best.accuracy > 15000) throw new Error("Low accuracy (IP-based)");

  return best;
};

export default function CitySelector({
  backgroundImage,
  storageKey = "city",
  storageKeyAr = "city_ar",
  onDone,
}) {
  const reduceMotion = useReducedMotion();

  const GOVERNORATES = useMemo(
    () => [
      { ar: "القاهرة", en: "Cairo", lat: 30.025, lng: 31.2375 },
      { ar: "الجيزة", en: "Giza", lat: 30.008056, lng: 31.210833 },
      { ar: "الإسكندرية", en: "Alexandria", lat: 31.2, lng: 29.9 },

      { ar: "الدقهلية", en: "Mansoura", lat: 31.036389, lng: 31.380556 },
      { ar: "البحر الأحمر", en: "Hurghada", lat: 27.252778, lng: 33.818056 },
      { ar: "البحيرة", en: "Damanhur", lat: 31.039167, lng: 30.469167 },
      { ar: "الفيوم", en: "Faiyum", lat: 29.31, lng: 30.841667 },
      { ar: "الغربية", en: "Tanta", lat: 30.788333, lng: 31.001944 },
      { ar: "الإسماعيلية", en: "Ismailia", lat: 30.604167, lng: 32.272222 },
      { ar: "المنوفية", en: "Shibin El Kom", lat: 30.5525, lng: 31.009167 },
      { ar: "المنيا", en: "Minya", lat: 28.11, lng: 30.750278 },
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
      { ar: "كفر الشيخ", en: "Kafr El Sheikh", lat: 31.114167, lng: 30.94 },
      { ar: "مطروح", en: "Marsa Matruh", lat: 31.3525, lng: 27.245278 },

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

  // GPS UI states
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // overlay seconds
  const [gpsSeconds, setGpsSeconds] = useState(0);

  // cancellation trick
  const gpsReqIdRef = useRef(0);

  useEffect(() => {
    if (!gpsLoading) return;
    setGpsSeconds(0);
    const t = setInterval(() => setGpsSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [gpsLoading]);

  const selectedObj = useMemo(
    () => GOVERNORATES.find((g) => g.en === selectedEn),
    [GOVERNORATES, selectedEn]
  );

  const handleDone = () => {
    if (!selectedObj) return;

    localStorage.setItem(storageKey, selectedObj.en);
    localStorage.setItem(storageKeyAr, selectedObj.ar);

    localStorage.removeItem("lat");
    localStorage.removeItem("lng");

    onDone?.(selectedObj.en);
  };

  const startGps = useCallback(async () => {
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError("المتصفح لا يدعم تحديد الموقع.");
      return;
    }

    const reqId = ++gpsReqIdRef.current;
    setGpsLoading(true);

    try {
      const { lat, lng, accuracy } = await getStableLocation();

      // لو المستخدم لغى، نتجاهل النتيجة
      if (reqId !== gpsReqIdRef.current) return;

      localStorage.setItem("lat", String(lat));
      localStorage.setItem("lng", String(lng));

      localStorage.setItem(storageKeyAr, "موقعي الحالي");
      localStorage.setItem(storageKey, "GPS");

      localStorage.setItem("gps_accuracy", String(Math.round(accuracy)));

      setGpsLoading(false);
      onDone?.("GPS");
    } catch (err) {
      if (reqId !== gpsReqIdRef.current) return;

      setGpsLoading(false);

      const msg = String(err?.message || "");
      if (msg.includes("Low accuracy")) {
        setGpsError("الموقع غير دقيق (تقريبي). فعّل Location من ويندوز/المتصفح وحاول تاني.");
        return;
      }

      if (err?.code === 1) setGpsError("لازم تسمح بالـ GPS من المتصفح.");
      else if (err?.code === 2) setGpsError("تعذر تحديد موقعك الآن.");
      else if (err?.code === 3) setGpsError("الوقت انتهى.. جرّب تاني.");
      else setGpsError("حصل خطأ.. جرّب تاني.");
    }
  }, [storageKey, storageKeyAr, onDone]);

  const handleGPS = () => startGps();

  const cancelGps = () => {
    gpsReqIdRef.current++; // يبطل الطلب الحالي
    setGpsLoading(false);
    // (اختياري) ما تمسحش gpsError هنا عشان لو كان فيه رسالة يفضل شايفها
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay Loading Popup */}
        <GpsLoadingOverlay
          open={gpsLoading}
          seconds={gpsSeconds}
          onCancel={cancelGps}
        />

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
              <div
                onClick={() => setOpen((prev) => !prev)}
                className="cursor-pointer rounded-2xl bg-black/40 px-4 py-3 text-white backdrop-blur-md shadow-md"
              >
                {selectedObj ? selectedObj.ar : "اختر المحافظة..."}
              </div>

              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 mt-1 w-full rounded-2xl bg-black/70 backdrop-blur-md shadow-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                >
                  <input
                    type="text"
                    placeholder="ابحث هنا..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 mb-2 rounded-lg bg-black/30 text-white placeholder-gray-400 outline-none"
                  />

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

            {/* GPS Button */}
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
