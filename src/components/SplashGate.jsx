import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CitySelector from "./CitySelector";

/* =========================
   الصور (لو في public/)
   ========================= */
// import introBg from "/intro.png";      // خلفية الشارع المصري
// import zekrLogo from "/logo.png";      // لوجو ذِكْر المدور
// import cityBg from "/city-bg.png";     // ✅ الخلفية اللي عملتهالك (حطها في public)

/* =========================
   إعدادات
   ========================= */
const MIN_INTRO_MS = 2000;
const introBg = "https://i.ibb.co/39P5zTkJ/intro.png";
const cityBg = "https://i.ibb.co/hxnhwGjr/city-bg.png";
const zekrLogo = "https://i.ibb.co/jZMtLmJG/logo.png";

/* ========================= */
function shouldShowIntroToday() {
  const key = "zekr-intro-date";
  const today = new Date().toDateString();
  const saved = localStorage.getItem(key);
  if (saved === today) return true;
  localStorage.setItem(key, today);
  return true;
}

/* =========================
   Track كل fetch / axios
   ========================= */
function installNetworkTrackerOnce() {
  if (window.__zekrTrackerInstalled) return;
  window.__zekrTrackerInstalled = true;

  window.__zekrPending = 0;
  window.__zekrListeners = new Set();

  const notify = () => {
    window.__zekrListeners.forEach((fn) => fn(window.__zekrPending));
  };

  const inc = () => {
    window.__zekrPending++;
    notify();
  };

  const dec = () => {
    window.__zekrPending = Math.max(0, window.__zekrPending - 1);
    notify();
  };

  /* fetch */
  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = (...args) => {
      inc();
      return originalFetch(...args).finally(dec);
    };
  }

  /* XHR (axios) */
  const XHR = window.XMLHttpRequest;
  if (XHR) {
    const open = XHR.prototype.open;
    const send = XHR.prototype.send;

    XHR.prototype.open = function (...args) {
      this.__track = true;
      return open.apply(this, args);
    };

    XHR.prototype.send = function (...args) {
      if (this.__track) inc();
      const done = () => {
        if (this.__track) dec();
        this.removeEventListener("loadend", done);
        this.removeEventListener("error", done);
        this.removeEventListener("abort", done);
      };
      this.addEventListener("loadend", done);
      this.addEventListener("error", done);
      this.addEventListener("abort", done);
      return send.apply(this, args);
    };
  }

  window.__zekrSubscribePending = (fn) => {
    window.__zekrListeners.add(fn);
    fn(window.__zekrPending);
    return () => window.__zekrListeners.delete(fn);
  };
}

/* =========================
   SplashGate
   ========================= */
export default function SplashGate({ children }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(() => shouldShowIntroToday());
  const [pending, setPending] = useState(0);
  const startedAt = useRef(Date.now());

  // ✅ بوابة المدينة: لو مفيش city في localStorage يبقى لازم يختار
  const [cityReady, setCityReady] = useState(() => {
    return Boolean(localStorage.getItem("city"));
  });

  useEffect(() => {
    installNetworkTrackerOnce();
    const unsub = window.__zekrSubscribePending((p) => setPending(p));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!open) return;
    const tick = () => {
      const elapsed = Date.now() - startedAt.current;
      if (pending === 0 && elapsed >= MIN_INTRO_MS) {
        setOpen(false);
      }
    };
    const i = setInterval(tick, 120);
    return () => clearInterval(i);
  }, [open, pending]);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: `${(i * 47) % 100}%`,
        top: `${(i * 31) % 100}%`,
        delay: (i % 6) * 0.2,
        size: (i % 3) + 1,
      })),
    []
  );

  return (
    <>
      {/* ✅ ممنوع عرض أي جزء من الموقع قبل اختيار المحافظة */}
      {(!open && cityReady) ? children : null}

      {/* ✅ بعد انتهاء الـ Intro مباشرة لو مفيش محافظة → CitySelector */}
      {!open && !cityReady && (
        <CitySelector
          backgroundImage={cityBg}
          onDone={() => setCityReady(true)}
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* ===== Background ===== */}
            <div className="absolute inset-0">
              <img
                src={introBg}
                className="h-full w-full object-cover"
                alt="intro background"
              />
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,.85)]" />
            </div>

            {/* ===== Decorations ===== */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-10 h-[2px] w-[90%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#F3E6C8]/40 to-transparent" />

              <Lantern left="10%" top="70px" delay={0} reduce={reduceMotion} />
              <Lantern left="85%" top="80px" delay={0.3} reduce={reduceMotion} />
              <Lantern left="15%" top="72%" delay={0.5} reduce={reduceMotion} />
              <Lantern left="88%" top="70%" delay={0.7} reduce={reduceMotion} />

              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full bg-[#F8E7B2]/70"
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                    boxShadow: "0 0 18px rgba(231,200,122,.35)",
                    willChange: "transform, opacity",
                  }}
                  animate={
                    reduceMotion
                      ? { opacity: 0.4 }
                      : { opacity: [0.15, 0.9, 0.15], y: [0, -10, 0] }
                  }
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* ===== Content ===== */}
            <motion.div
              className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
            >
              <motion.div
                animate={reduceMotion ? {} : { y: [0, -6, 0] }}
                transition={{ duration: 2.6, repeat: Infinity }}
              >
                <div className="relative">
                  <div className="absolute -inset-6 rounded-full bg-[#F3E6C8]/10 blur-2xl" />
                  <div className="h-28 w-28 overflow-hidden rounded-full border border-[#F3E6C8]/35">
                    <img
                      src={zekrLogo}
                      alt="ذِكْر"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>

              <p className="mt-4 max-w-xs text-sm text-[#F3E6C8]/90">
                صدقة جارية علي أرواحنا وجميع أرواح المسلمين
              </p>

              <div className="mt-6 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-[#F3E6C8]"
                    animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>

              <span className="mt-3 text-xs text-[#F3E6C8]/60">
                {pending > 0 ? `جاري التحميل... (${pending})` : "جاهز"}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* =========================
   Lantern
   ========================= */
function Lantern({ left, top, delay, reduce }) {
  return (
    <motion.div
      className="absolute"
      style={{ left, top }}
      animate={reduce ? {} : { y: [0, 10, 0], opacity: [0.7, 1, 0.7] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      <div className="mx-auto h-6 w-[2px] bg-[#F3E6C8]/25" />
      <div className="relative h-12 w-9 rounded-lg border border-[#F3E6C8]/25 bg-black/30">
        <div className="absolute inset-1 rounded-md bg-gradient-to-b from-[#F8E7B2]/50 to-transparent" />
        <div className="absolute -bottom-4 left-1/2 h-8 w-12 -translate-x-1/2 rounded-full bg-[#E7C87A]/15 blur-xl" />
      </div>
    </motion.div>
  );
}