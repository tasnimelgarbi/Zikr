import React, { useEffect, useState } from "react";
import { Copy, Share2, RefreshCw, CheckCircle2, X, Image } from "lucide-react";
import { toPng } from "html-to-image";
import DUAS from "../data/duas.json";
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

// ✅ نفس طريقة الـ Base64 عشان أول شير يطلع كامل (Safari/iOS)
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
 * ✅ ShareCard (مخفي)
 * ✅ تعديلين فقط:
 * 1) الخلفية بقت نفس duaa.png + overlay
 * 2) اللوجو والخلفية من DataURL (تحميل فوري ومضمون)
 * ⚠️ باقي المقاسات/التصميم زي ما هو
 */
function ShareCard({ dua, idx, bgSrc, logoSrc }) {
  return (
    <div
      id={`share-card-${idx}`}
      dir="rtl"
      className="fixed left-0 top-0 w-[1080px] min-h-[1350px] h-auto overflow-visible opacity-0 pointer-events-none -z-10 flex flex-col"
      style={{ fontFamily: "'Amiri', serif" }}
    >
      {/* ✅ نفس خلفية الشير التانية */}
      <img
        src={bgSrc}
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
        draggable="false"
        loading="eager"
        decoding="sync"
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Header */}
      <div className="relative p-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* ✅ لوجو الموقع */}
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
                أدعية اليوم • صدقة جارية
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

        {/* Title */}
        <div className="mt-14 rounded-[40px] bg-white/15 backdrop-blur border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.35)] p-14">
          <div className="text-center text-[46px] font-extrabold text-white">
            {dua?.title}
          </div>

          <div className="mt-10 text-center text-[44px] leading-[1.9] font-semibold text-white whitespace-pre-wrap">
            {dua?.text}
          </div>
        </div>
      </div>

      {/* Footer */}
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

export default function DuaDaily() {
  const [duas, setDuas] = useState([]);
  const [sharingId, setSharingId] = useState(null);

  // ✅ Toast state
  const [toast, setToast] = useState(null);

  // ✅ نفس طريقة التحميل الفوري (Base64) للخلفية واللوجو
  const [assetsReady, setAssetsReady] = useState(false);
  const [bgDataUrl, setBgDataUrl] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const bgUrl = `${origin}/duaa.png`; // ✅ نفس الخلفية
  const logoUrl = `${origin}/logo.png`;

  // ✅ حمّل الأصول أول ما الصفحة تفتح (عشان أول شير يطلع كامل)
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
        // fallback
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

  /**
   * ✅ مشاركة صورة
   * - نفس منطق الانتظار للخطوط
   * - + ضمان الأصول base64 قبل التصوير (لو لأي سبب ما اتجهزتش)
   */
  const shareAsImage = async (dua, idx) => {
    try {
      setSharingId(idx);

      await new Promise((r) => requestAnimationFrame(r));

      const node = document.getElementById(`share-card-${idx}`);
      if (!node) throw new Error("Share card not found");

      // ✅ استنى تحميل الخطوط
      if (document.fonts?.ready) await document.fonts.ready;

      // ✅ لو الأصول مش جاهزة (نادرًا)، جهزها هنا
      if (!assetsReady) {
        const [bg64, logo64] = await Promise.all([
          bgDataUrl ? Promise.resolve(bgDataUrl) : fetchAsDataUrl(bgUrl),
          logoDataUrl ? Promise.resolve(logoDataUrl) : fetchAsDataUrl(logoUrl),
        ]);
        if (!bgDataUrl) setBgDataUrl(bg64);
        if (!logoDataUrl) setLogoDataUrl(logo64);
      }

      // ✅ استنى صور الكارت نفسها (مهم)
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
        // 🔥 مهم عشان الكارت مخفي بـ opacity-0
        style: {
          opacity: "1",
          transform: "none",
        },
      });

      const file = await dataUrlToFile(dataUrl, "dua-zekr.png");
      const text = `🌿 دعاء اليوم من ذِكر\nhttps://zikrr.vercel.app/`;

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          title: "ذِكر",
          text,
          files: [file],
        });
        showToast("image");
        return;
      }

      // fallback: واتساب بالنص
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          buildShareText(dua.title, dua.text)
        )}`
      );
      showToast("share");
    } catch (e) {
      console.error(e);
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F4EDDF] px-4 py-10">
      {/* ✅ Toast Popup */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 w-full max-w-md">
          <div className="rounded-2xl bg-white/95 backdrop-blur border border-black/10 shadow-[0_18px_50px_rgba(0,0,0,0.18)] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {toast.type === "copy" && (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                )}
                {toast.type === "share" && (
                  <Share2 className="w-6 h-6 text-[#B98636]" />
                )}
                {toast.type === "image" && (
                  <Image className="w-6 h-6 text-zinc-700" />
                )}
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
        <BackButton className="mb-4" />

        <div className="text-center text-2xl font-extrabold text-[#1f1f1f]">
          🌿 أدعية اليوم
        </div>

        <button
          onClick={() => pickDaily({ forceNew: true })}
          className="w-full rounded-full py-3 text-white font-extrabold shadow-lg"
          style={{
            background: "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)",
          }}
        >
          <span className="inline-flex gap-2 items-center justify-center">
            <RefreshCw className="w-5 h-5" />
            تغيير أدعية اليوم
          </span>
        </button>

        {duas.map((dua, idx) => (
          <React.Fragment key={idx}>
            {/* ✅ ShareCard مخفي: ده اللي بيتحوّل لصورة عند المشاركة */}
            <ShareCard
              dua={dua}
              idx={idx}
              bgSrc={bgDataUrl || bgUrl}
              logoSrc={logoDataUrl || logoUrl}
            />

            {/* ✅ الكارت اللي ظاهر في الصفحة (زي كودك) */}
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
                <button
                  onClick={() => copyDua(dua)}
                  className="rounded-xl py-2 border font-bold"
                >
                  <Copy className="inline w-4 h-4" /> نسخ
                </button>

                <button
                  onClick={() => shareDuaText(dua)}
                  className="rounded-xl py-2 text-white font-bold"
                  style={{
                    background: "linear-gradient(180deg,#D7B266,#C89B4B)",
                  }}
                >
                  <Share2 className="inline w-4 h-4" /> شير
                </button>

                <button
                  onClick={() => shareAsImage(dua, idx)}
                  className="rounded-xl py-2 border font-bold"
                  disabled={sharingId === idx}
                >
                  <Image className="inline w-4 h-4" />{" "}
                  {sharingId === idx ? "..." : "صورة"}
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
