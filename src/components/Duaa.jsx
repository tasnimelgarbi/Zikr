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

/**
 * ✅ ShareCard (مخفي) — سيبناه زي ما هو
 * ⚠️ أهم تعديل للصورة هيكون في toPng options (style.opacity = 1)
 */
function ShareCard({ dua, idx }) {
  return (
    <div
      id={`share-card-${idx}`}
      dir="rtl"
      className="fixed left-0 top-0 w-[1080px] h-[1350px] overflow-hidden opacity-0 pointer-events-none -z-10"
      style={{
        background:
          "radial-gradient(circle at 20% 10%, rgba(215,178,102,.35), transparent 55%), radial-gradient(circle at 80% 40%, rgba(200,155,75,.35), transparent 60%), linear-gradient(180deg,#FBF6EA,#F3EAD2,#EAD9B8)",
        fontFamily: "'Amiri', serif",
      }}
    >
      {/* pattern خفيف */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,.35) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Header */}
      <div className="relative p-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* ✅ لوجو الموقع (public/logo.png) */}
            <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-[#D7B266] shadow-[0_18px_50px_rgba(0,0,0,0.15)] bg-white">
              <img
                src="https://i.ibb.co/jZMtLmJG/logo.png"
                crossOrigin="anonymous"
                alt="logo"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <div className="text-[44px] font-extrabold text-[#1f1f1f]">
                ذِكر
              </div>
              <div className="text-[26px] font-semibold text-zinc-700">
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
        <div className="mt-14 rounded-[40px] bg-white/70 backdrop-blur border border-black/10 shadow-[0_24px_80px_rgba(0,0,0,0.12)] p-14">
          <div className="text-center text-[46px] font-extrabold text-[#1f1f1f]">
            {dua?.title}
          </div>

          <div className="mt-10 text-center text-[44px] leading-[1.9] font-semibold text-zinc-900 whitespace-pre-wrap">
            {dua?.text}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-14">
        <div className="flex items-center justify-between">
          <div className="text-[26px] font-bold text-zinc-800">
            📌 افتح الموقع وشوف أدعية جديدة يوميًا
          </div>

          <div className="text-[26px] font-extrabold text-[#1f1f1f]">
            https://zikrr.vercel.app/
          </div>
        </div>

        <div className="mt-6 h-[2px] w-full bg-gradient-to-r from-transparent via-black/20 to-transparent" />
        <div className="mt-6 text-[22px] text-zinc-700 font-semibold">
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
   * ✅ مشاركة صورة (تعديل الصورة فقط)
   * - أهم حاجة: style.opacity=1 في toPng عشان الكارت مخفي بـ opacity-0
   * - استنى الخطوط والصور قبل التصوير
   */
  const shareAsImage = async (dua, idx) => {
    try {
      setSharingId(idx);

      await new Promise((r) => requestAnimationFrame(r));

      const node = document.getElementById(`share-card-${idx}`);
      if (!node) throw new Error("Share card not found");

      // ✅ استنى تحميل الخطوط
      if (document.fonts?.ready) await document.fonts.ready;

      // ✅ استنى تحميل الصور داخل الكارت
      const imgs = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          });
        })
      );

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#FBF6EA",

        // 🔥 ده اللي بيحل مشكلة "خلفية بس"
        // لأن الكارت مخفي بـ opacity-0، فبنخلي نسخة التصوير opacity=1
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
            <ShareCard dua={dua} idx={idx} />

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