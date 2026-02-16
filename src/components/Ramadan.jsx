import { useEffect, useState } from "react";
import { Clock3, ChevronLeft, ChevronRight } from "lucide-react";
import BackButton from "./BackButton.jsx";
import Footer from "./Footer.jsx";

export default function RamadanDashboard({
  titel = "لوحة تحكم رمضان",
}){

  const bg = "https://i.ibb.co/vxdkLmLZ/ramdan-card.jpg";
const [ramadanStartFajr, setRamadanStartFajr] = useState(null);
const [ramadanDays, setRamadanDays] = useState([]);
const [activeDay, setActiveDay] = useState(null);
const [isRamadan, setIsRamadan] = useState(false);
const [iftar, setIftar] = useState("");
const [imsak, setImsak] = useState("");
const [dayText, setDayText] = useState("");
const [countdown, setCountdown] = useState("--:--:--");
const [nextPrayerText, setNextPrayerText] = useState("");

useEffect(() => {
  const lat = localStorage.getItem("lat");
  const lng = localStorage.getItem("lng");
  const city = localStorage.getItem("city") || "Cairo";
  const method = 5;
  const school = 0;

  // ✅ كاش ذكي: التاريخ + مصدر البيانات + الإعدادات
  const sourceKey =
    lat && lng ? `gps-${lat}-${lng}` : `city-${encodeURIComponent(city)}`;
  const todayKey = `ramadan-info-${new Date().toDateString()}-${sourceKey}-m${method}-s${school}`;

  const cached = localStorage.getItem(todayKey);
  if (cached) {
    try {
      const { timings, hijri } = JSON.parse(cached);
      applyData(timings, hijri);
      return;
    } catch {}
  }
  let url;
  if (lat && lng) {
    url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
  } else {
    url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
      city
    )}&country=Egypt&method=${method}&school=${school}`;
  }

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const timings = data?.data?.timings;
      const hijri = data?.data?.date?.hijri;
      if (!timings || !hijri) return;

      localStorage.setItem(todayKey, JSON.stringify({ timings, hijri }));
      applyData(timings, hijri);
    })
    .catch((err) => {
      console.error("Prayer API Error:", err);
    });

  function applyData(timings, hijri) {
    const cleanTime = (t) => String(t || "").split(" ")[0];

    setIftar(cleanTime(timings.Maghrib));
    setImsak(cleanTime(timings.Imsak || timings.Fajr));

    const monthEn = String(hijri?.month?.en || "").toLowerCase();
    const isRamadan = monthEn.includes("ram");

    if (isRamadan) {
      setIsRamadan(true);
      setActiveDay(Number(hijri.day));
      setDayText(`اليوم ${hijri.day} من رمضان`);
    } else {
      setIsRamadan(false);
      setActiveDay(null);
      setDayText("اليوم 0 من رمضان");
    }
  }
}, []);

useEffect(() => {
    const city = localStorage.getItem("city") || "Cairo";
    fetch(`https://api.aladhan.com/v1/hijriCalendarByCity?city=${city}&country=Egypt&method=5&month=9`)
    .then(res => res.json())
   .then(res => {
  const days = res.data;
  setRamadanDays(days.map(d => Number(d.date.hijri.day)));

  const firstDay = days[0];
  const fajrClean = firstDay.timings.Fajr.split(" ")[0];
  const [h, m] = fajrClean.split(":").map(Number);

  const firstFajrDate = new Date(
    firstDay.date.gregorian.year,
    firstDay.date.gregorian.month.number - 1,
    firstDay.date.gregorian.day,
    h,
    m,
    0
  );
  setRamadanStartFajr(firstFajrDate);
});
}, []);

useEffect(() => {
  if (!ramadanStartFajr) return;

  const interval = setInterval(() => {
    const now = new Date();

    // 🟡 قبل رمضان
    if (!isRamadan) {
      const diff = ramadanStartFajr - now;
      if (diff <= 0) return;

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setCountdown(
        `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`
      );
      setNextPrayerText("متبقي على فجر رمضان");
      return;
    }

    // 🟢 رمضان
    const updateCountdown = () => {
  const now = new Date();

  const cleanTime = (time, addDay = false) => {
    const [h, m] = time.split(" ")[0].split(":").map(Number);
    const d = new Date();
    if (addDay) d.setDate(d.getDate() + 1);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const fajr = cleanTime(imsak);
  const maghrib = cleanTime(iftar);

  let target;
  let label;

  if (now >= fajr && now < maghrib) {
    target = maghrib;
    label = "المغرب";
  } else {
    target = cleanTime(imsak, true);
    label = "الفجر";
  }

  const diff = target - now;

  if (diff <= 0) return;

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  setCountdown(
    `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`
  );
  setNextPrayerText(`متبقي على صلاة ${label}`);
};

  }, 1000);

  return () => clearInterval(interval);
}, [ramadanStartFajr, isRamadan, imsak, iftar]);

const convertTo12Hour = (time24) => {
  const [h, m] = time24.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit", hour12: true });
};
const iftar12 = convertTo12Hour(iftar);

const weekDays = ["أر","خ","ج","س","ح","أث","ث"];
  
return (
    <>
    <div className="bg-[#F4EDDF]">
      {/* ================= header ================= */}
      <header className="w-full">

        {/* ================= HEADER ================= */}
        <div className="relative w-full h-[160px] overflow-visible rounded-b-[80px] bg-[#8dcba1c2] px-3 pt-6">
          
          {/* زخرفة الخلفية */}
          <div
            className="absolute inset-0 rounded-b-[80px] opacity-30 pointer-events-none"
            style={{
              backgroundImage: "url('https://i.ibb.co/S4jrZt90/full-bg-azskar.jpg')",
              backgroundRepeat: "repeat",
              mixBlendMode: "multiply",
            }}
          />
          {/* لمعة خفيفة */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
            <div className="absolute -top-14 right-0 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
          </div>
          {/* محتوى الهيدر */}
         <div className="relative flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* زر الرجوع على اليسار */}
        <div className="absolute left-[110%] top-1/2 -translate-y-1/2">
          <BackButton />
        </div>

        <div className="text-[35px] font-extrabold text-[#1f1f1f]">
          {titel}
        </div>
      </div>
        </div>
        </div>

        {/* ================= TIMER CARD ================= */}
          <div className="w-full flex justify-center">
          <div
            className="relative w-[92%] max-w-md h-[108px] rounded-[30px]
                      shadow-[0_18px_35px_rgba(0,0,0,0.18)]
                      -mt-20 z-10"
            style={{
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #F2F2F2 45%, #E6E6E6 100%)",
              WebkitMask:
                "radial-gradient(18px 18px at 0% 50%, transparent 98%, #000 100%) left/51% 100% no-repeat, radial-gradient(18px 18px at 100% 50%, transparent 98%, #000 100%) right/51% 100% no-repeat, linear-gradient(#000 0 0)",
              mask:
                "radial-gradient(18px 18px at 0% 50%, transparent 98%, #000 100%) left/51% 100% no-repeat, radial-gradient(18px 18px at 100% 50%, transparent 98%, #000 100%) right/51% 100% no-repeat, linear-gradient(#000 0 0)",
            }}
          >
            {/* الإطار الداخلي */}
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
            {/* لمعة فوقية */}
            <div
              className="absolute left-0 right-0 top-0 h-1/2 rounded-[26px] opacity-60"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 75%)",
                pointerEvents: "none",
              }}
            />
            {/* المحتوى */}
            <div className="relative h-full flex flex-col items-center justify-center text-center">
              {/* العدّاد دهبي */}
              <div
                className="font-extrabold tracking-[2px] leading-none"
                style={{
                  fontSize: "54px",
                  background:
                    "linear-gradient(180deg, #D7B266 0%, #C89B4B 50%, #B98636 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 8px 18px rgba(0,0,0,0.25)",
                }}
              >
                {countdown}
              </div>
              {/* النص تحت دهبي */}
              <div
                className="mt-1 font-semibold"
                style={{
                  fontSize: "18px",
                  background:
                    "linear-gradient(180deg, #D7B266 0%, #C89B4B 50%, #B98636 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 6px 14px rgba(0,0,0,0.20)",
                }}
              >
                {nextPrayerText}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= CARDS ================= */}
    <div dir="rtl" className="mt-4 mb-4 flex justify-center gap-3 px-3">
      {/* Card 1 */}
      <div className="flex items-center justify-between bg-[#F7F7F1] rounded-[22px] px-4 py-3 w-full w-[48%] max-w-[170px] shadow-md">
        <div className="text-right leading-tight ml-4">
          <div className="text-[18px] font-extrabold text-[#2E2E2E]">الإفطار</div>
          <div className="text-[18px] font-extrabold text-[#2E2E2E]">{convertTo12Hour(iftar)}</div>
        </div>
        <div className="ml-3 w-11 h-11 rounded-full bg-[#e0e4b0] flex items-center justify-center">
          <Clock3 className="w-7 h-7 text-[#1F1F1F]" />
        </div>
      </div>
      {/* Card 2 */}
      <div className="flex items-center justify-between bg-[#F7F7F1] rounded-[22px] px-4 py-3 w-full w-[48%] max-w-[170px] shadow-md">
        <div className="text-right leading-tight ml-1">
          <div className="text-[18px] font-extrabold text-[#2E2E2E]">الإمساك</div>
          <div className="text-[18px] font-extrabold text-[#2E2E2E]"> {convertTo12Hour(imsak)}</div>
        </div>
        <div className="ml-3 w-11 h-11 rounded-full bg-[#A7D2B7] flex items-center justify-center
                        shadow-[0_6px_12px_rgba(0,0,0,0.10)]">
          <Clock3 className="w-7 h-7 text-[#1F1F1F]" />
        </div>
      </div>
    </div>

<div className="w-full max-w-[360px] mx-auto px-1">
       {/* ================= day ================= */}
       <div
          dir="rtl"
          className="relative max-w-[700px] overflow-hidden rounded-t-[24px]"
        >
          {/* الخلفية */}
          <img
            src={bg}
            alt="Ramadan background"
            className="w-full h-[170px] object-cover"
          />
          {/* المحتوى */}
           <div className="absolute inset-0 flex justify-end items-center">
            <div className="text-right rtl w-full">
              {/* العنوان */}
              <h2 className="text-[25px] font-extrabold text-black/80 mr-3">
                {dayText}
              </h2>
            </div>
          </div>
        </div>

      {/* ================= taqueem ================= */}
    <div dir="rtl" className="w-full">
      {/* CARD */}
      <div
        className="w-full max-w-[560px] rounded-[28px] bg-[#F7F7F1] px-5 pt-4 pb-5 -mb-5 -mt-5 relative z-10 shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          {/* Title */}
          <div className="text-right">
            <div className="text-[26px] font-extrabold text-[#2E2E2E] leading-none">
              التقويم الهجري
            </div>
            <div className="mt-2 text-[18px] font-semibold text-[#6B6B6B]">
              رمضان ١٤٤٥
            </div>
          </div>
          {/* Arrows */}
          <div className="flex items-center gap-6 pt-2">
            <button
              className="text-[#6B6B6B] active:scale-95 transition"
              aria-label="السابق"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              className="text-[#6B6B6B] active:scale-95 transition"
              aria-label="التالي"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>
        {/* Weekdays */}
        <div className="mt-4 grid grid-cols-7 gap-y-3">
          {weekDays.map((d, i) => (
            <div
              key={i}
              className="text-center text-[16px] font-semibold text-[#7A7A7A]"
            >
              {d}
            </div>
          ))}
          {/* Days grid */}
         {ramadanDays.map((day, idx) => {
  const isSelected = day === activeDay;
  const isMuted = !isRamadan;

  return (
    <div key={idx} className="flex justify-center">
      <div
        className={[
          "w-10 h-10 rounded-full flex items-center justify-center",
          "text-[18px] font-semibold",
          isSelected
            ? "bg-[#A8CBB8] text-[#1F1F1F] shadow-[0_10px_18px_rgba(0,0,0,0.12)]"
            : "bg-transparent",
          isMuted ? "text-[#C8C8C8]" : "text-[#2E2E2E]",
        ].join(" ")}
      >
        {day}
      </div>
    </div>
  );
})}
        </div>
      </div>
    </div>

      {/* ================= backgroung ================= */}
      <div
        className="h-96 bg-no-repeat bg-cover rounded-b-2xl"
        style={{ backgroundImage: "url('https://i.ibb.co/Kjc5gBRH/ramadan1.jpg')" }}
      ></div>
    </div>
    </div>
    <Footer />
    </>
  );
}
