import React, { useEffect, useMemo, useState } from "react";
import { Copy, Share2, RefreshCw, CheckCircle2, X, Image } from "lucide-react";
import { toPng } from "html-to-image";
import DUAS from "../data/duas.json";
import RAMADAN_DUAS from "../data/ramadan_duas.json";
import BackButton from "./BackButton";

const DAILY_COUNT = 5;

function todayKey() {
  return `daily-duas-${new Date().toDateString()}`;
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildShareText(title, text) {
  const clean = (text || "").replace(/\n{3,}/g, "\n\n").trim();
  return `🕋 ${title}\n\n${clean}\n\n— شارك تؤجر 🌿\nhttps://zikrr.vercel.app/`;
}

async function dataUrlToFile(dataUrl, fileName = "dua.png") {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: "image/png" });
}

async function fetchAsDataUrl(url) {
  const res = await fetch(url, { cache: "force-cache" });
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

/**
 * ShareCard (مخفي) - نفس تصميمك
 */
function ShareCard({ dua, idx, bgSrc, logoSrc }) {
  return (
    <div
      id={`share-card-${idx}`}
      dir="rtl"
      className="fixed left-0 top-0 w-[1080px] min-h-[1350px] h-auto overflow-visible opacity-0 pointer-events-none -z-10 flex flex-col"
      style={{ fontFamily: "'Amiri', serif" }}
    >
      <img
        src={bgSrc}
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
        draggable="false"
        loading="eager"
        decoding="sync"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative p-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-[#D7B266] shadow-[0_18px_50px_rgba(0,0,0,0.15)] bg-white">
              <img
                src={logoSrc}
                alt="logo"
                className="h-full w-full object-cover"
                draggable="false"
                loading="eager"
                decoding="sync"
              />
            </div>

            <div>
              <div className="text-[44px] font-extrabold text-white">ذِكر</div>
              <div className="text-[26px] font-semibold text-white/85">
                الأدعية اليومية • صدقة جارية
              </div>
            </div>
          </div>

          <div
            className="rounded-full px-6 py-3 text-[22px] font-extrabold text-white shadow-lg"
            style={{
              background: "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)",
            }}
          >
            🌿 شارك تؤجر
          </div>
        </div>

        <div className="mt-14 rounded-[40px] bg-white/15 backdrop-blur border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.35)] p-14">
          <div className="text-center text-[46px] font-extrabold text-white">
            {dua?.title}
          </div>

          <div className="mt-10 text-center text-[44px] leading-[1.9] font-semibold text-white whitespace-pre-wrap">
            {dua?.text}
          </div>
        </div>
      </div>

      <div className="mt-auto p-14 relative">
        <div className="flex items-center justify-between">
          <div className="text-[26px] font-bold text-white/90">
            📌 افتح الموقع وشوف أدعية جديدة يوميًا
          </div>

          <div className="text-[26px] font-extrabold text-white">
            https://zikrr.vercel.app/
          </div>
        </div>

        <div className="mt-6 h-[2px] w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="mt-6 text-[22px] text-white/85 font-semibold">
          مشاركة الدعاء قد تكون سببًا في أجر عظيم 🤍
        </div>
      </div>
    </div>
  );
}

/* ================== Ramadan day logic (Egypt / after Maghrib) ================== */
const TZ = "Africa/Cairo";

// ✅ نفس فكرة الهيدر: لو الـ API سابق يوم → نخلي بداية رمضان +1 يوم
const EGYPT_RUYA_OFFSET_DAYS = 0;

function cleanTime(t) {
  return String(t || "").split(" ")[0];
}

function parseHHMM(t) {
  const s = cleanTime(t);
  if (!s.includes(":")) return null;
  const [h, m] = s.split(":").map(Number);
  return { h, m };
}

// بديل سريع لوقت مصر (مش محتاج تغير TimeZone على Date، بس بنستخدمه للعرض فقط)
function getCairoNowParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = fmt.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";

  const day = get("day");
  const month = get("month");
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");

  return {
    day: Number(day),
    month: Number(month),
    year: Number(year),
    hour: Number(hour),
    minute: Number(minute),
    ddmmyyyy: `${day}-${month}-${year}`,
  };
}

async function fetchHijriRamadanCalendarByCity(city) {
  const url = `https://api.aladhan.com/v1/hijriCalendarByCity?city=${encodeURIComponent(
    city
  )}&country=Egypt&method=5&month=9&timezonestring=${TZ}`;

  const res = await fetch(url);
  const json = await res.json();
  const days = json?.data;
  return Array.isArray(days) ? days : [];
}

async function fetchTimingsByCityToday(city) {
  // نجيب مواقيت اليوم عشان نعمل schedule عند المغرب بدقة
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
    city
  )}&country=Egypt&method=5&timezonestring=${TZ}`;

  const res = await fetch(url);
  const json = await res.json();
  return json?.data?.timings || null;
}

export default function DuaDaily() {
  const [duas, setDuas] = useState([]);
  const [sharingId, setSharingId] = useState(null);
  const [tab, setTab] = useState("ramadan"); // "ramadan" | "daily"
  const [ramadanInfo, setRamadanInfo] = useState({
    loading: true,
    isRamadan: false,
    dayNum: 0,
    hijriYear: "",
    hijriDay: "",
  });
  const [toast, setToast] = useState(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const [bgDataUrl, setBgDataUrl] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const bgUrl = `${origin}/duaa.png`;
  const logoUrl = `${origin}/logo.png`;

  // ✅ تحميل الخلفية واللوجو بدري
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setAssetsReady(false);
        const [bg64, logo64] = await Promise.all([
          fetchAsDataUrl(bgUrl),
          fetchAsDataUrl(logoUrl),
        ]);
        if (!mounted) return;

        setBgDataUrl(bg64);
        setLogoDataUrl(logo64);

        await (document.fonts?.ready ?? Promise.resolve());
        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => requestAnimationFrame(r));

        setAssetsReady(true);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setBgDataUrl(bgUrl);
        setLogoDataUrl(logoUrl);
        setAssetsReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [bgUrl, logoUrl]);

  // ✅ Toast helper
  const showToast = (type) => {
    const messages = {
      copy: "✅ تم نسخ الدعاء بنجاح — ربنا يجعله في ميزان حسناتك 🤍",
      share: "🤲 تم مشاركة الدعاء — شارك تؤجر بإذن الله 🌿",
      image: "🖼️ تم مشاركة الصورة — جعلها الله صدقة جارية لك 🤍",
    };

    setToast({ type, text: messages[type] || "تم بنجاح 🤍" });

    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2200);
  };

  const pickDaily = ({ forceNew = false } = {}) => {
    const key = todayKey();

    if (!forceNew) {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.length) {
            setDuas(parsed);
            return;
          }
        } catch {}
      }
    }

    const salt = forceNew ? Math.random().toString() : "";
    const seed = hashSeed(new Date().toDateString() + salt);

    const shuffled = seededShuffle(DUAS, seed);
    const picks = shuffled.slice(0, DAILY_COUNT);

    setDuas(picks);
    localStorage.setItem(key, JSON.stringify(picks));
  };

  useEffect(() => {
    pickDaily();
  }, []);

  // ✅ حساب رمضان بنفس منطق Header: بداية رمضان من المغرب + Offset مصر + تحديث عند المغرب بالضبط
  useEffect(() => {
    let alive = true;
    let maghribTimer = null;
    let safetyTimer = null;

    const computeRamadan = async () => {
      try {
        const city = localStorage.getItem("city") || "Cairo";

        setRamadanInfo((s) => ({ ...s, loading: true }));

        // 1) هات تقويم رمضان (شهر 9) — فيه أول يوم و توقيته
        const cal = await fetchHijriRamadanCalendarByCity(city);
        if (!cal.length) {
          if (!alive) return;
          setRamadanInfo({ loading: false, isRamadan: false, dayNum: 0, hijriYear: "", hijriDay: "" });
          return;
        }

        const firstDay = cal[0];

        const maghrib = parseHHMM(firstDay?.timings?.Maghrib);
        if (!maghrib) {
          if (!alive) return;
          setRamadanInfo({ loading: false, isRamadan: false, dayNum: 0, hijriYear: "", hijriDay: "" });
          return;
        }

        // 2) تاريخ بداية رمضان (gregorian) عند المغرب
        const g = firstDay?.date?.gregorian;
        const start = new Date(
          Number(g?.year),
          Number(g?.month?.number) - 1,
          Number(g?.day),
          maghrib.h,
          maghrib.m,
          0,
          0
        );

        // ✅ رُؤية مصر: تأخير يوم
        start.setDate(start.getDate() + EGYPT_RUYA_OFFSET_DAYS);

        const now = new Date();

        // 3) لو رمضان بدأ بالفعل -> احسب رقم اليوم من المغرب
        if (now >= start) {
          const dayNum = Math.floor((now - start) / 86400000) + 1;

          // نحاول نجيب سنة/يوم هجري للعرض (من نفس array لو موجود)
          const safeIndex = Math.max(0, Math.min(29, dayNum - 1));
          const hijri = cal[safeIndex]?.date?.hijri;

          if (!alive) return;
          setRamadanInfo({
            loading: false,
            isRamadan: dayNum >= 1 && dayNum <= 30,
            dayNum: dayNum,
            hijriYear: hijri?.year || "",
            hijriDay: hijri?.day || "",
          });
        } else {
          if (!alive) return;
          setRamadanInfo({ loading: false, isRamadan: false, dayNum: 0, hijriYear: "", hijriDay: "" });
        }

        // 4) جدولة تحديث عند المغرب "بتاع النهارده" بالظبط
        // نجيب مواقيت اليوم الحالية عشان نعرف المغرب القادم
        const timingsToday = await fetchTimingsByCityToday(city);
        const magToday = parseHHMM(timingsToday?.Maghrib);

        if (maghribTimer) window.clearTimeout(maghribTimer);

        if (magToday) {
          // نستخدم وقت الجهاز، وغالبًا المستخدم في مصر
          const nextMaghrib = new Date();
          nextMaghrib.setHours(magToday.h, magToday.m, 2, 0); // +2 ثواني ضمان

          // لو المغرب عدى، نعمله بكرة
          if (nextMaghrib <= new Date()) {
            nextMaghrib.setDate(nextMaghrib.getDate() + 1);
          }

          const ms = Math.max(2000, nextMaghrib.getTime() - Date.now());
          maghribTimer = window.setTimeout(() => {
            computeRamadan();
          }, ms);
        }

        // 5) Safety refresh كل ساعة
        if (safetyTimer) window.clearTimeout(safetyTimer);
        safetyTimer = window.setTimeout(() => computeRamadan(), 60 * 60 * 1000);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setRamadanInfo((s) => ({ ...s, loading: false }));
        // إعادة محاولة بعد 10 دقايق
        if (safetyTimer) window.clearTimeout(safetyTimer);
        safetyTimer = window.setTimeout(() => computeRamadan(), 10 * 60 * 1000);
      }
    };

    computeRamadan();

    return () => {
      alive = false;
      if (maghribTimer) window.clearTimeout(maghribTimer);
      if (safetyTimer) window.clearTimeout(safetyTimer);
    };
  }, []);

  // ✅ تجهيز دعاء رمضان لليوم الحالي
 const ramadanList = useMemo(() => {
  if (!ramadanInfo.isRamadan || !ramadanInfo.dayNum) return [];

  const item = (RAMADAN_DUAS || []).find(
    (d) => Number(d.day) === Number(ramadanInfo.dayNum)
  );
  if (!item) return [];

  const baseTitle =
    ramadanInfo.hijriYear
      ? `${ramadanInfo.dayNum} رمضان ${ramadanInfo.hijriYear} هـ`
      : `اليوم ${ramadanInfo.dayNum} من رمضان`;

  // ✅ لو الملف الجديد (duas array)
  if (Array.isArray(item.duas) && item.duas.length) {
    return item.duas.slice(0, 4).map((d, i) => ({
      title: `${baseTitle}`,
      text: d?.text || "",
      source: d?.source || "",
    }));
  }

  // ✅ توافق مع الشكل القديم (text واحد)
  if (item.text) {
    return [{ title: baseTitle, text: item.text, source: item.source || "" }];
  }

  return [];
}, [ramadanInfo]);

  const copyDua = async (dua) => {
    await navigator.clipboard.writeText(buildShareText(dua.title, dua.text));
    showToast("copy");
  };

  const shareDuaText = async (dua) => {
    const text = buildShareText(dua.title, dua.text);
    if (navigator.share) {
      await navigator.share({ title: dua.title, text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    }
    showToast("share");
  };

  const shareAsImage = async (dua, idx) => {
    try {
      setSharingId(idx);
      await new Promise((r) => requestAnimationFrame(r));

      const node = document.getElementById(`share-card-${idx}`);
      if (!node) throw new Error("Share card not found");

      if (document.fonts?.ready) await document.fonts.ready;

      if (!assetsReady) {
        const [bg64, logo64] = await Promise.all([
          bgDataUrl ? Promise.resolve(bgDataUrl) : fetchAsDataUrl(bgUrl),
          logoDataUrl ? Promise.resolve(logoDataUrl) : fetchAsDataUrl(logoUrl),
        ]);
        if (!bgDataUrl) setBgDataUrl(bg64);
        if (!logoDataUrl) setLogoDataUrl(logo64);
      }

      const imgs = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        imgs.map(async (img) => {
          try {
            if (!img.complete) {
              await new Promise((res) => {
                img.onload = res;
                img.onerror = res;
              });
            }
            if (img.decode) await img.decode();
          } catch {}
        })
      );

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#000",
        style: { opacity: "1", transform: "none" },
      });

      const file = await dataUrlToFile(dataUrl, "dua-zekr.png");
      const text = `🌿 دعاء اليوم من ذِكر\nhttps://zikrr.vercel.app/`;

      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({ title: "ذِكر", text, files: [file] });
        showToast("image");
        return;
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText(dua.title, dua.text))}`);
      showToast("share");
    } catch (e) {
      console.error(e);
    } finally {
      setSharingId(null);
    }
  };

  const list = tab === "ramadan" ? ramadanList : duas;

  return (
    <div dir="rtl" className="min-h-screen bg-[#F4EDDF] px-4 py-10">
      {/* Toast Popup */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-md">
          <div className="rounded-2xl bg-white/95 backdrop-blur border border-black/10 shadow-[0_18px_50px_rgba(0,0,0,0.18)] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {toast.type === "copy" && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                {toast.type === "share" && <Share2 className="w-6 h-6 text-[#B98636]" />}
                {toast.type === "image" && <Image className="w-6 h-6 text-zinc-700" />}
              </div>

              <div className="flex-1 text-[15px] leading-[1.8] font-semibold text-zinc-800">
                {toast.text}
              </div>

              <button
                onClick={() => setToast(null)}
                className="p-1 rounded-full hover:bg-black/5"
                aria-label="close"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center justify-between mb-4">
        <BackButton />

        <div className="text-2xl font-extrabold text-[#1f1f1f] mb-2">
          {tab === "ramadan" ? "أدعية رمضان" : "الأدعية اليومية"}
        </div>

        {/* عنصر فارغ علشان يظبط التوسيط */}
        <div className="w-8" />
      </div>

        {/* Tabs (رمضان أولاً) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTab("ramadan")}
            className={`rounded-full py-3 font-extrabold shadow-sm border transition ${
              tab === "ramadan" ? "bg-white" : "bg-transparent"
            }`}
          >
             أدعية رمضان
          </button>
          <button
            onClick={() => setTab("daily")}
            className={`rounded-full py-3 font-extrabold shadow-sm border transition ${
              tab === "daily" ? "bg-white" : "bg-transparent"
            }`}
          >
            الأدعية اليومية
          </button>
        </div>

        {/* زر تغيير أدعية اليوم (في تبويب اليوم فقط) */}
        {tab === "daily" && (
          <button
            onClick={() => pickDaily({ forceNew: true })}
            className="w-full rounded-full py-3 text-white font-extrabold shadow-lg"
            style={{ background: "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)" }}
          >
            <span className="inline-flex gap-2 items-center justify-center">
              <RefreshCw className="w-5 h-5" />
              تغيير أدعية اليوم
            </span>
          </button>
        )}

        {list.map((dua, idx) => (
          <React.Fragment key={idx}>
            <ShareCard dua={dua} idx={idx} bgSrc={bgDataUrl || bgUrl} logoSrc={logoDataUrl || logoUrl} />

            <div className="rounded-[28px] bg-[#FBFAF6] shadow-lg overflow-hidden">
              <div className="p-4 bg-[#F3EAD2] font-extrabold text-center">
                {dua.title}
              </div>

              <div
                className="p-6 text-center text-[19px] leading-[2.3] font-semibold text-zinc-900 whitespace-pre-wrap"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {dua.text}
              </div>

              <div className="grid grid-cols-3 gap-2 p-4">
                <button onClick={() => copyDua(dua)} className="rounded-xl py-2 border font-bold">
                  <Copy className="inline w-4 h-4" /> نسخ
                </button>

                <button
                  onClick={() => shareDuaText(dua)}
                  className="rounded-xl py-2 text-white font-bold"
                  style={{ background: "linear-gradient(180deg,#D7B266,#C89B4B)" }}
                >
                  <Share2 className="inline w-4 h-4" /> شير
                </button>

                <button
                  onClick={() => shareAsImage(dua, idx)}
                  className="rounded-xl py-2 border font-bold"
                  disabled={sharingId === idx}
                >
                  <Image className="inline w-4 h-4" /> {sharingId === idx ? "..." : "صورة"}
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}

        {tab === "ramadan" && !ramadanInfo.loading && ramadanInfo.isRamadan && list.length === 0 ? (
          <div className="text-center text-zinc-600 font-bold">
            مفيش دعاء محفوظ لليوم ده في ramadan_duas.json (لازم day من 1 لـ 30).
          </div>
        ) : null}
      </div>
    </div>
  );
}