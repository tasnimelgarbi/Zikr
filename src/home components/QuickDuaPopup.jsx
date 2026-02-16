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

// ✅ preload + decode (مهم جدًا للموبايل)
async function preloadAndDecode(url) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;

  if (!img.complete) {
    await new Promise((res) => {
      img.onload = res;
      img.onerror = res;
    });
  }

  try {
    if (img.decode) await img.decode();
  } catch {}

  return true;
}

// ✅ ShareCard مخفي — الخلفية img (أفضل مع html-to-image)
function ShareCard({ item, bgUrl, logoUrl }) {
  if (!item) return null;

  return (
    <div
      id="quick-share-card"
      dir="rtl"
      className="fixed left-0 top-0 w-[1080px] min-h-[1350px] h-auto overflow-hidden opacity-0 pointer-events-none -z-10 flex flex-col"
      style={{ fontFamily: "'Amiri', serif" }}
    >
      <img
        src={bgUrl}
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
        draggable="false"
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative p-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#D7B266] shadow-2xl bg-white">
              <img
                src={logoUrl}
                alt="logo"
                className="h-full w-full object-cover"
                draggable="false"
                crossOrigin="anonymous"
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
              background: "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)",
            }}
          >
            🌿 شارك تؤجر
          </div>
        </div>

        <div className="mt-24 rounded-[60px] bg-black/35 backdrop-blur-xl border border-white/20 shadow-[0_40px_140px_rgba(0,0,0,0.6)] p-24">
          <div className="text-center text-[48px] font-extrabold text-[#D7B266]">
            {item.type}
          </div>

          <div className="mt-16 text-center text-[60px] leading-[2] font-semibold text-white whitespace-pre-wrap">
            {item.text}
          </div>
        </div>
      </div>

      <div className="relative mt-auto p-20 text-center">
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
  const [assetsReady, setAssetsReady] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const bgUrl = `${origin}/duaa.png`;
  const logoUrl = `${origin}/logo.png`;

  useEffect(() => {
    if (!open) return;

    const idxKey = "quick-dua-last-idx";
    const last = Number(localStorage.getItem(idxKey) || "-1");
    const next = (last + 1) % QUICK_DUAS.length;

    localStorage.setItem(idxKey, String(next));
    setItem(QUICK_DUAS[next]);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // ✅ أهم حاجة: preload assets + fonts أول ما يفتح البوباب
    setAssetsReady(false);
    (async () => {
      try {
        await Promise.all([
          preloadAndDecode(bgUrl),
          preloadAndDecode(logoUrl),
          document.fonts?.ready ?? Promise.resolve(),
        ]);

        // ✅ خلي فيه frame عشان Safari يرسم الخلفية فعلاً
        await new Promise((r) => requestAnimationFrame(r));
        await new Promise((r) => requestAnimationFrame(r));

        setAssetsReady(true);
      } catch {
        setAssetsReady(true); // حتى لو فشل، ما نعلقش
      }
    })();

    return () => (document.body.style.overflow = prev);
  }, [open, bgUrl, logoUrl]);

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

  // ✅ أهم تعديل: ممنوع يبدأ شير الصورة إلا لما تجهز + منع الدبل كليك
  const shareAsImage = async () => {
    if (!item) return;
    if (sharing) return; // ✅ منع الضغط السريع/المتكرر

    try {
      setSharing(true);

      // ✅ استنى الفونت يخلص تحميل (مهم جدًا)
      await (document.fonts?.ready ?? Promise.resolve());

      // ✅ لو لسه الصور ما جهزتش، استنى
      if (!assetsReady) {
        await Promise.all([preloadAndDecode(bgUrl), preloadAndDecode(logoUrl)]);
      }

      // ✅ خلي رندر يثبت (Safari محتاج frame زيادة)
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));

      const node = document.getElementById("quick-share-card");
      if (!node) throw new Error("Share card not found");

      // ✅ استنى صور الكارت نفسها (bg + logo) — ضمان إضافي
      const imgs = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        imgs.map(async (img) => {
          if (!img.complete) {
            await new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            });
          }
          try {
            if (img.decode) await img.decode();
          } catch {}
        })
      );

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#000",
        style: { opacity: "1", transform: "none" },
        useCORS: true,
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

      // fallback
      window.open(
        `https://wa.me/?text=${encodeURIComponent(buildShareText(item))}`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSharing(false);
    }
  };

  if (!open || !item) return null;

  return createPortal(
    <>
      <ShareCard item={item} bgUrl={bgUrl} logoUrl={logoUrl} />

      <div className="fixed inset-0 z-[999999] flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

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
                  background:
                    "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)",
                }}
              >
                <Share2 className="inline w-4 h-4 ml-1" /> شير
              </button>

              <button
                onClick={shareAsImage}
                disabled={sharing || !assetsReady}
                className="rounded-2xl py-3 border border-black/10 bg-white font-extrabold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                aria-busy={sharing ? "true" : "false"}
              >
                <ImageIcon className="inline w-4 h-4 ml-1" />{" "}
                {sharing ? "جاري..." : assetsReady ? "صورة" : "..."}
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
