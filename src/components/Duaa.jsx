import React, { useEffect, useState } from "react";
import {
  Copy,
  Share2,
  RefreshCw,
  CheckCircle2,
  X,
  Image,
} from "lucide-react";
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
  return `🕋 ${title}\n\n${clean}\n\n— شارك تؤجر 🌿\nzekr.app`; // غيّر الدومين بتاعك هنا
}

/** ✅ تحويل dataURL إلى File */
async function dataUrlToFile(dataUrl, fileName = "dua.png") {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: "image/png" });
}

function Toast({ show, text, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[999]">
      <div className="flex items-center gap-2 rounded-full bg-zinc-900 text-white px-4 py-2 shadow-lg">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-semibold">{text}</span>
        <button onClick={onClose} className="ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * ✅ كارت مشاركة مخفي (Design جامد للصورة اللي هتتشير)
 * - ده مش ظاهر للمستخدم
 * - بيتحوّل لـ PNG وقت المشاركة
 */
function ShareCard({ dua, idx }) {
  return (
    <div
      id={`share-card-${idx}`}
      dir="rtl"
      className="fixed -left-[9999px] top-0 w-[1080px] h-[1350px] overflow-hidden"
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
            {/* ✅ لوجو الموقع (حطه في public/logo.png) */}
            <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-[#D7B266] shadow-[0_18px_50px_rgba(0,0,0,0.15)] bg-white">
              <img
                src="/logo.png"
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

          <div className="rounded-full px-6 py-3 text-[22px] font-extrabold text-white shadow-lg"
               style={{ background: "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)" }}>
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
            zekr.app
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
  const [toast, setToast] = useState({ show: false, text: "" });
  const [sharingId, setSharingId] = useState(null);

  const showToast = (t) => {
    setToast({ show: true, text: t });
    setTimeout(() => setToast({ show: false, text: "" }), 1500);
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
    showToast("تم النسخ 🤍");
  };

  const shareDuaText = async (dua) => {
    const text = buildShareText(dua.title, dua.text);
    if (navigator.share) {
      await navigator.share({ title: dua.title, text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    }
    showToast("تمت المشاركة 🌿");
  };

  /**
   * ✅ مشاركة صورة (بدون تحميل)
   * - يطلع PNG من ShareCard (المخفي)
   * - يستخدم navigator.share(files) لو متاح
   * - fallback: مشاركة نص/واتساب
   */
  const shareAsImage = async (dua, idx) => {
    try {
      setSharingId(idx);

      // استنى frame عشان الـShareCard يبقى موجود في الـDOM
      await new Promise((r) => requestAnimationFrame(r));

      const node = document.getElementById(`share-card-${idx}`);
      if (!node) throw new Error("Share card not found");

      // جودة أعلى (مهم جدًا عشان الصورة تبقى فخمة)
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#FBF6EA",
      });

      const file = await dataUrlToFile(dataUrl, "dua-zekr.png");
      const text = `🌿 دعاء اليوم من ذِكر\nzekr.app`; // غيّر الدومين

      // ✅ لو المتصفح بيدعم مشاركة ملفات
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({
          title: "ذِكر",
          text,
          files: [file],
        });
        showToast("تمت مشاركة الصورة 🌿");
        return;
      }

      // ✅ fallback 1: واتساب بالنص
      window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText(dua.title, dua.text))}`);
      showToast("مشاركة نص بدل الصورة ✅");
    } catch (e) {
      console.error(e);
      showToast("تعذر مشاركة الصورة ❌");
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F4EDDF] px-4 py-10">
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

            {/* ✅ الكارت اللي ظاهر في الصفحة */}
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

      <Toast
        show={toast.show}
        text={toast.text}
        onClose={() => setToast({ show: false, text: "" })}
      />
    </div>
  );
}