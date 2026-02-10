import React, { useMemo, useState } from "react";

const AZKAR_DEFAULT = ["سبحان الله", "الحمد لله", "الله أكبر", "لا إله إلا الله"];

// تحويل الأرقام لأرقام عربية (٠١٢٣...)
function toArabicDigits(input) {
  const map = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  return String(input).replace(/[0-9]/g, (d) => map[Number(d)]);
}

/**
 * يرسم "count" حبيبة من أصل "total" على دائرة كاملة:
 * - count=0 => مفيش
 * - count=1 => حبيبة واحدة
 * - count=total => الدائرة كلها مليانة
 */
function BeadsRing({ count, total = 100, beadR = 2.2 }) {
  const safeTotal = Math.max(1, total);
  const safeCount = Math.min(Math.max(count, 0), safeTotal);
  if (safeCount === 0) return null;

  // نبدأ من فوق (12 o'clock) وندور مع عقارب الساعة
  const startDeg = -90;
  const step = 360 / safeTotal;
  const radius = 36; // نصف قطر الدائرة اللي رسمتيها (نفس r اللي عندك)

  return (
    <g>
      {Array.from({ length: safeCount }, (_, i) => {
        const deg = startDeg + i * step;
        const rad = (deg * Math.PI) / 180;
        const cx = 50 + radius * Math.cos(rad);
        const cy = 50 + radius * Math.sin(rad);

        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={beadR}
            fill="url(#gold)"
            opacity="0.98"
          />
        );
      })}
    </g>
  );
}

export default function Sebha({
  azkar = AZKAR_DEFAULT,
  goal = 100,
  className = "",
}) {
  const [zikrIndex, setZikrIndex] = useState(0);
  const [count, setCount] = useState(0);

  const zikr = azkar[zikrIndex % azkar.length];

  const progress = useMemo(() => Math.min(1, count / goal), [count, goal]);

  const onTap = () => {
    setCount((prev) => {
      const next = prev + 1;

      if (next >= goal) {
        setZikrIndex((i) => (i + 1) % azkar.length);
        return 0; // نبدأ من صفر (مفيش حبيبات)
      }
      return next;
    });
  };

  // حلقة progress
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = c * progress;

  return (
    <section
      dir="rtl"
      className={[
        "max-w-50 max-h-60 rounded-[28px] bg-white p-4 mt-2 mr-2",
        "shadow-[0_18px_40px_rgba(0,0,0,0.12)]",
        className,
      ].join(" ")}
    >

      {/* الدائرة */}
      <div className=" flex items-center justify-center">
        <div className="relative h-[150px] w-[150px]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d8b15c" />
                <stop offset="100%" stopColor="#bf943f" />
              </linearGradient>
            </defs>

            {/* حلقة خلفية */}
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="rgba(0,0,0,0.10)"
              strokeWidth="6"
            />

            {/* ✅ الحبيبات بتلف حوالين الدائرة مع كل Tap */}
            <BeadsRing count={count} total={goal} beadR={2.25} />
          </svg>

          {/* النص في المنتصف */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[24px] font-extrabold text-black/80">
              {zikr}
            </div>
            <div className="mt-1 text-[22px] font-extrabold text-black/70">
              {toArabicDigits(count)}/{toArabicDigits(goal)}
            </div>
          </div>
        </div>
      </div>

      {/* زر Tap */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onTap}
          className="
            rounded-full px-10 py-3
            text-[18px] font-extrabold text-white
            shadow-[0_14px_22px_rgba(0,0,0,0.18)]
            bg-gradient-to-b from-[#d8b15c] to-[#bf943f]
            active:translate-y-[1px]
          "
        >
          سبّح
        </button>
      </div>
    </section>
  );
}