import React from "react";
import bg from "/werd card.png"; // عدّل المسار حسب مكان الملف

export default function DailyWirdCard() {
  const title = "الورد اليومي من القرآن";
  const progress = 0.82; // 0..1

  // Progress circle math
  const size = 54; // قريب من الشكل في التصميم
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, progress)) * c;

  return (
    <section dir="rtl" className="w-full">
      <div className="mx-auto relative w-full overflow-hidden rounded-[22px] shadow-[0_10px_28px_rgba(0,0,0,0.10)] ring-1 ring-black/5 mt-4">
        {/* الخلفية (عشان النقوش تبان) */}
        <img
          src={bg}
          alt="Wird card background"
          className="w-full h-[95px] object-cover"
          draggable="false"
        />

        {/* المحتوى */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          {/* يمين: دائرة التقدم */}
          <div className="relative grid place-items-center shrink-0">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="rotate-[-90deg]"
              aria-hidden="true"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="rgba(16,185,129,0.18)"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="rgba(16,185,129,0.78)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c - dash}`}
              />
            </svg>

            {/* أيقونة الكتاب */}
            <div className="absolute grid place-items-center w-9 h-9 rounded-full bg-white/85 shadow-sm ring-1 ring-black/5">
                <img
                src="https://cdn-icons-png.flaticon.com/512/13534/13534590.png"
                alt="Quran icon"
                className="w-5 h-5 object-contain"
                />
            </div>
          </div>

          {/* النص في المنتصف */}
          <div className="flex-1 min-w-0 p-2">
            <div className="truncate text-[22px] font-extrabold text-black/75">
              {title}
            </div>
          </div>

          {/* فراغ بسيط يسار زي التصميم */}
          <div className="w-2 shrink-0" />
        </div>
      </div>
    </section>
  );
}