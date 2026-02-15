import React, { useEffect, useState } from "react";

export default function GpsLoadingOverlay({
  open,
  onCancel,
  seconds = 0,
}) {
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!open) return;

    if (seconds < 4) setHint("بنحدد موقعك بدقة…");
    else if (seconds < 9) setHint("معلش ثانية… الدقة العالية بتاخد وقت بسيط 🙏");
    else setHint("لو طولت، فعّل الـ Location من الجهاز.");
  }, [open, seconds]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        dir="rtl"
        className="w-[92%] max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
      >
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

        <div className="mt-4">
          <button
            onClick={onCancel}
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-extrabold text-zinc-700 active:scale-[0.99]"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
