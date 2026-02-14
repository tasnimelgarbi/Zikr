import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import BackButton from "./BackButton.jsx";
import Footer from "./Footer.jsx";

export default function DailyWirdTracker() {
  const STORAGE_KEY = "quran-wirds-progress"; // نفس اللي في QuranWirdList
  const TOTAL_WIRDS = 90; // 30 يوم × 3

  const navigate = useNavigate();

  const [completedCount, setCompletedCount] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);

  // اقرأ من localStorage
  const readProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const arr = saved ? JSON.parse(saved) : [];
      setCompletedCount(Array.isArray(arr) ? arr.length : 0);
    } catch {
      setCompletedCount(0);
    }
  };

  useEffect(() => {
    readProgress();

    // لما ترجع للصفحة، اعمل ريفرش للقيم
    const onFocus = () => readProgress();
    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const progress = useMemo(() => {
    const p = Math.round((completedCount / TOTAL_WIRDS) * 100);
    return Math.max(0, Math.min(100, p));
  }, [completedCount]);

  // لما توصل 100% اعرض PopUp مرة واحدة
  useEffect(() => {
    if (progress === 100) {
      const flagKey = "quran-wirds-congrats-shown";
      const alreadyShown = localStorage.getItem(flagKey) === "1";
      if (!alreadyShown) {
        setShowCongrats(true);
        localStorage.setItem(flagKey, "1");
      }
    } else {
      // لو قلّت عن 100% لأي سبب (unset) نخليها ممكن تظهر تاني عند 100%
      localStorage.removeItem("quran-wirds-congrats-shown");
    }
  }, [progress]);

  // إعدادات الدائرة
  const r = 88;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="min-h-screen bg-[#F4EDDF] relative overflow-hidden">
      {/* PopUp + Confetti */}
      {showCongrats && (
        <>
          {/* confetti بسيط */}
          <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="absolute top-[-10px] w-2 h-4 rounded-sm opacity-80 animate-[confetti_2.8s_linear_infinite]"
                style={{
                  left: `${(i * 100) / 28}%`,
                  background: i % 3 === 0 ? "#D7B266" : i % 3 === 1 ? "#9fc7b2" : "#C89B4B",
                  animationDelay: `${i * 0.06}s`,
                  transform: `rotate(${i * 12}deg)`,
                }}
              />
            ))}
          </div>

          {/* overlay */}
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />

          {/* modal */}
          <div className="fixed inset-0 z-50 grid place-items-center px-4">
            <div className="w-full max-w-sm rounded-[28px] bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-white/50 overflow-hidden">
              <div
                className="p-5"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(215,178,102,0.35) 0%, rgba(159,199,178,0.22) 100%)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-700" />
                    <div className="text-[18px] font-extrabold text-[#1F1F1F]">
                      ما شاء الله 🎉
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCongrats(false)}
                    className="w-9 h-9 rounded-full bg-white/70 border border-white/60 grid place-items-center active:scale-95 transition"
                    aria-label="إغلاق"
                  >
                    <X className="w-5 h-5 text-zinc-700" />
                  </button>
                </div>

                <div className="mt-3 text-[15px] font-semibold text-zinc-700">
                  كملت الورد بالكامل بنسبة <span className="text-amber-800 font-extrabold">100%</span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  <div className="text-[16px] font-bold text-zinc-800">
                    ربنا يثبتك ويكتب أجرك 🤍
                  </div>
                </div>

                <button
                  onClick={() => setShowCongrats(false)}
                  className="w-full py-3.5 rounded-full text-[16px] font-extrabold text-white shadow-[0_10px_25px_rgba(0,0,0,0.18)] active:scale-95 transition"
                  style={{
                    background:
                      "linear-gradient(180deg, #D7B266 0%, #C89B4B 50%, #B98636 100%)",
                  }}
                >
                  الحمدلله
                </button>
              </div>
            </div>
          </div>

          {/* keyframes للكونفيتي */}
          <style>{`
            @keyframes confetti {
              0% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(110vh) rotate(520deg); opacity: 0; }
            }
          `}</style>
        </>
      )}

      {/* الإطار */}
      <div
        className="absolute inset-[6px] rounded-[22px]"
        style={{
          border: "2px solid rgba(184, 134, 11, 0.6)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)",
          WebkitMask:
            "radial-gradient(14px 14px at 0% 50%, transparent 98%, #000 100%) left/51% 100% no-repeat, radial-gradient(14px 14px at 100% 50%, transparent 98%, #000 100%) right/51% 100% no-repeat, linear-gradient(#000 0 0)",
          mask:
            "radial-gradient(14px 14px at 0% 50%, transparent 98%, #000 100%) left/51% 100% no-repeat, radial-gradient(14px 14px at 100% 50%, transparent 98%, #000 100%) right/51% 100% no-repeat, linear-gradient(#000 0 0)",
        }}
      />

      {/* HEADER */}
      <header className="w-full">
        <div className="relative w-full h-[120px] overflow-visible rounded-b-[80px] bg-[#8dcba1c2] px-3 pt-6">
          <div
            className="absolute inset-0 rounded-b-[80px] opacity-30 pointer-events-none"
            style={{
              backgroundImage: "url('https://i.ibb.co/S4jrZt90/full-bg-azskar.jpg')",
              backgroundRepeat: "repeat",
              mixBlendMode: "multiply",
            }}
          />
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
            <div className="absolute -top-14 right-0 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
          </div>
        </div>
      </header>
        <div className="absolute right-4 top-3 z-20">
      <BackButton />
    </div>
      {/* TITLE CARD */}
      <div className="w-full flex justify-center -mt-16 px-4 relative z-20">
        <div
          className="w-full max-w-md h-[90px] rounded-[30px] flex items-center justify-center shadow-[0_18px_35px_rgba(0,0,0,0.22)]"
          style={{
            background:
              "linear-gradient(180deg, #FFFFFF 0%, #F2F2F2 45%, #E6E6E6 100%)",
          }}
        >
          <span className="text-[30px] font-extrabold text-[#1F1F1F]">
            الوِرد القرآني اليومي
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full flex justify-center mt-6 px-4">
        <div className="w-full max-w-md">
          <div
            className="relative rounded-[32px] px-8 pt-10 pb-8 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
            style={{
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #F6F3EA 45%, #EEE7D6 100%)",
            }}
          >
            {/* Circular Progress */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r={r}
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r={r}
                    stroke="#C89B4B"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-[48px] font-extrabold"
                    style={{
                      background:
                        "linear-gradient(180deg, #D7B266 0%, #C89B4B 50%, #B98636 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                    dir="ltr"
                  >
                    {progress}%
                  </span>
                  <span className="text-[18px] font-semibold text-[#6B6B6B]">
                    مكتمل
                  </span>
                  <span className="mt-1 text-[13px] font-semibold text-zinc-500">
                    {completedCount} / {TOTAL_WIRDS} ورد
                  </span>
                </div>
              </div>
            </div>

            {/* Wird Info */}
            <div className="text-center mb-8">
              <div className="text-[24px] font-extrabold text-[#2E2E2E] mb-1">
                تقدمك الحالي
              </div>
              <div className="text-[18px] font-semibold text-[#6B6B6B]">
                كل ما تكمّل ورد (✔) النسبة بتزيد
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate("/werd-quran")}
              className="w-full py-5 rounded-full text-[22px] font-extrabold text-white
                         shadow-[0_10px_25px_rgba(0,0,0,0.25)]
                         active:scale-95 transition"
              style={{
                background:
                  "linear-gradient(180deg, #D7B266 0%, #C89B4B 50%, #B98636 100%)",
              }}
            >
              ابدأ الورد
            </button>
          </div>
        </div>
      </div>

      {/* BACKGROUND BLOBS */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl" />
    <Footer />
    </div>
  );
}