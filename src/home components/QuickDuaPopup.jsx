import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Share2, X, Image as ImageIcon } from "lucide-react";
import { toPng } from "html-to-image";
import QUICK_DUAS from "../data/quickDuas.js";

function buildShareText(item) {
  return `🌿 ${item.type}\n\n${item.text}\n\n— شارك تؤجر\nhttps://zikrr.vercel.app/`;
}

async function dataUrlToFile(dataUrl, fileName = "zekr.png") {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: "image/png" });
}

// ✅ preload لأي صورة (حتى لو background)
async function preloadImage(url) {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous"; // safe
    img.src = url;
    if (!img.complete) {
      await new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    }
    if (img.decode) await img.decode();
  } catch {}
}

// ✅ ShareCard مخفي — يتحول لصورة
function ShareCard({ item }) {
  if (!item) return null;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const bgUrl = `${origin}/duaa.png`;
  const logoUrl = `${origin}/logo.png`;

  return (
    <div
      id="quick-share-card"
      dir="rtl"
      className="fixed left-0 top-0 w-[1080px] min-h-[1350px] h-auto overflow-visible opacity-0 pointer-events-none -z-10 flex flex-col"
      style={{
        fontFamily: "'Amiri', serif",
        backgroundImage: `
          linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.65)),
          url('${bgUrl}')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative p-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#D7B266] shadow-2xl bg-white">
              <img
                src={logoUrl}
                alt="logo"
                className="h-full w-full object-cover"
                draggable="false"
              />
            </div>

            <div>
              <div className="text-[56px] font-extrabold text-white">ذِكر</div>
              <div className="text-[28px] font-semibold text-[#D7B266]">
                ورد سريع • {item.type}
              </div>
            </div>
          </div>

          <div
            className="rounded-full px-10 py-4 text-[24px] font-extrabold text-black shadow-xl"
            style={{
              background:
                "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)",
            }}
          >
            🌿 شارك تؤجر
          </div>
        </div>

        {/* Card Body */}
        <div className="mt-24 rounded-[60px] bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_40px_140px_rgba(0,0,0,0.6)] p-24">
          <div className="text-center text-[48px] font-extrabold text-[#D7B266]">
            {item.type}
          </div>

          <div className="mt-16 text-center text-[60px] leading-[2] font-semibold text-white whitespace-pre-wrap">
            {item.text}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-20 text-center">
        <div className="text-[28px] font-bold text-white/90">
          https://zikrr.vercel.app/
        </div>

        <div className="mt-8 h-[3px] w-full bg-gradient-to-r from-transparent via-[#D7B266] to-transparent" />

        <div className="mt-8 text-[24px] text-white/80 font-semibold">
          مشاركة الذكر قد تكون سببًا في أجر عظيم 🤍
        </div>
      </div>
    </div>
  );
}

export default function QuickDuaPopup({ open, onClose }) {
  const [item, setItem] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!open) return;

    const idxKey = "quick-dua-last-idx";
    const last = Number(localStorage.getItem(idxKey) || "-1");
    const next = (last + 1) % QUICK_DUAS.length;

    localStorage.setItem(idxKey, String(next));
    setItem(QUICK_DUAS[next]);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  const copy = async () => {
    if (!item) return;
    await navigator.clipboard.writeText(buildShareText(item));
  };

  const share = async () => {
    if (!item) return;
    const text = buildShareText(item);
    if (navigator.share) await navigator.share({ title: "ذِكر", text });
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareAsImage = async () => {
    if (!item) return;

    try {
      setSharing(true);
      await new Promise((r) => requestAnimationFrame(r));

      const node = document.getElementById("quick-share-card");
      if (!node) throw new Error("Share card not found");

      const origin = window.location.origin;
      const bgUrl = `${origin}/duaa.png`;
      const logoUrl = `${origin}/logo.png`;

      // ✅ preload الخلفية واللوجو قبل التصوير
      await preloadImage(bgUrl);
      await preloadImage(logoUrl);

      if (document.fonts?.ready) await document.fonts.ready;

      // استنى صور img داخل الكارت
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

      const file = await dataUrlToFile(dataUrl, "zekr-quick.png");

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          title: "ذِكر",
          text: "🌿 ورد سريع من ذِكر",
          files: [file],
        });
        return;
      }

      window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText(item))}`);
    } catch (e) {
      console.error(e);
    } finally {
      setSharing(false);
    }
  };

  if (!open || !item) return null;

  return createPortal(
    <>
      <ShareCard item={item} />

      <div className="fixed inset-0 z-[999999] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-[92%] max-w-md overflow-hidden rounded-3xl border border-black/10 bg-white/90 shadow-[0_22px_70px_rgba(0,0,0,.25)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 h-10 w-10 rounded-2xl border border-black/10 bg-white/70 text-xl font-black text-black/55 transition hover:bg-white hover:text-black/80"
            aria-label="Close"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>

          <div className="p-6 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#F6F0E3] px-4 py-2 shadow-sm">
              <span className="text-sm font-extrabold text-[#7A5B1B]">۞</span>
              <span className="text-sm font-extrabold text-[#7A5B1B]">
                ورد سريع • {item.type}
              </span>
              <span className="text-sm font-extrabold text-[#7A5B1B]">۞</span>
            </div>

            <div className="mt-4 rounded-2xl bg-[#FBFAF6] p-5 border border-black/10">
              <div
                className="text-[20px] leading-[2.1] font-semibold text-zinc-900 whitespace-pre-wrap"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {item.text}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={copy}
                className="rounded-2xl py-3 border border-black/10 bg-white font-extrabold shadow-sm"
              >
                <Copy className="inline w-4 h-4 ml-1" /> نسخ
              </button>

              <button
                onClick={share}
                className="rounded-2xl py-3 text-white font-extrabold shadow-sm"
                style={{
                  background: "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)",
                }}
              >
                <Share2 className="inline w-4 h-4 ml-1" /> شير
              </button>

              <button
                onClick={shareAsImage}
                disabled={sharing}
                className="rounded-2xl py-3 border border-black/10 bg-white font-extrabold shadow-sm disabled:opacity-60"
              >
                <ImageIcon className="inline w-4 h-4 ml-1" />{" "}
                {sharing ? "..." : "صورة"}
              </button>
            </div>

            <div className="mt-3 text-xs font-semibold text-black/55">
              يمكن غلق النافذة بالضغط خارج المربع
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
