import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

const clearPrayerCaches = () => {
  if (typeof window === "undefined") return;

  try {
    const ls = window.localStorage;
    const prefixes = ["countdown-timings-", "prayer-times-", "imsak-iftar-"];

    for (let i = ls.length - 1; i >= 0; i--) {
      const k = ls.key(i);
      if (!k) continue;

      if (prefixes.some((p) => k.startsWith(p))) {
        ls.removeItem(k);
      }
    }
  } catch (e) {
    console.warn("localStorage not available, skipping cache clear.");
  }
};

export default function Header({
  onCalendar,
}) {
  const [hijriHeader, setHijriHeader] = useState("اليوم 0 من رمضان");
  const [isRamadan, setIsRamadan] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [gregorianHeader, setGregorianHeader] = useState("");
  const [countdown, setCountdown] = useState("--:--:--");
  const [nextPrayerText, setNextPrayerText] = useState("");
  
  //countdown logic
 useEffect(() => {
  let prayersArray = [];
  let intervalId = null;

  const fetchTimings = async () => {
    try {
      const rawLat = localStorage.getItem("lat");
      const rawLng = localStorage.getItem("lng");
      const city = localStorage.getItem("city") || "Cairo";

      const method = 5;
      const school = 0;

      const lat = rawLat ? Number(rawLat).toFixed(4) : null;
      const lng = rawLng ? Number(rawLng).toFixed(4) : null;

      const sourceKey =
        lat && lng ? `gps-${lat}-${lng}` : `city-${encodeURIComponent(city)}`;

      const todayKey = `countdown-timings-${new Date().toDateString()}-${sourceKey}-m${method}-s${school}`;

      const cleanTime = (t) => String(t || "").split(" ")[0]; // "05:12 (EET)" -> "05:12"

      // ✅ كاش
      const cached = localStorage.getItem(todayKey);
      if (cached) {
        const timings = JSON.parse(cached);
        setTimingsAndStart(timings);
        return;
      }

      // ✅ URL حسب GPS أو city
      let url;
      if (lat && lng) {
        url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
      } else {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
          city
        )}&country=Egypt&method=${method}&school=${school}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      const timings = data?.data?.timings;
      if (!timings) return;

      localStorage.setItem(todayKey, JSON.stringify(timings));
      setTimingsAndStart(timings);

      function setTimingsAndStart(timings) {
        prayersArray = [
          { name: "الفجر", time: cleanTime(timings.Fajr) },
          { name: "الشروق", time: cleanTime(timings.Sunrise) },
          { name: "الظهر", time: cleanTime(timings.Dhuhr) },
          { name: "العصر", time: cleanTime(timings.Asr) },
          { name: "المغرب", time: cleanTime(timings.Maghrib) },
          { name: "العشاء", time: cleanTime(timings.Isha) },
        ];

        updateCountdown(); // أول مرة بعد ما القائمة تتعبّي

        // ابدأ العداد بعد ما جه timings (علشان ميبقاش فيه ثانية فاضية)
        if (!intervalId) {
          intervalId = setInterval(updateCountdown, 1000);
        }
      }
    } catch (err) {
      console.log("Error fetching timings:", err);
    }
  };

  const updateCountdown = () => {
    if (!prayersArray.length) return;

    const now = new Date();
    let nextPrayer = null;

    for (let p of prayersArray) {
      const [h, m] = p.time.split(":").map(Number);
      const pDate = new Date();
      pDate.setHours(h, m, 0, 0);

      if (pDate > now) {
        nextPrayer = { ...p, date: pDate };
        break;
      }
    }

    if (!nextPrayer) {
      const [h, m] = prayersArray[0].time.split(":").map(Number);
      const pDate = new Date();
      pDate.setDate(pDate.getDate() + 1);
      pDate.setHours(h, m, 0, 0);
      nextPrayer = { ...prayersArray[0], date: pDate };
    }

    const diff = Math.max(0, nextPrayer.date - now);
    const hours = Math.floor(diff / 1000 / 3600);
    const minutes = Math.floor((diff / 1000 % 3600) / 60);
    const seconds = Math.floor(diff / 1000 % 60);

    setCountdown(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
    setNextPrayerText(`متبقي على صلاة ${nextPrayer.name}`);
  };

  fetchTimings();

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, []);

  // Hijri date logic
  useEffect(() => {
  const fetchRamadan = async () => {
  try {
    const city = localStorage.getItem("city") || "Cairo";

    const res = await fetch(
      `https://api.aladhan.com/v1/hijriCalendarByCity?city=${city}&country=Egypt&method=5&month=9`
    );
      const data = await res.json();
      const today = new Date();
      const firstDay = data.data[0]; // أول يوم رمضان

      const firstFajr = new Date(
        firstDay.date.gregorian.year,
        firstDay.date.gregorian.month.number - 1,
        firstDay.date.gregorian.day
      );

      // إذا رمضان بدأ
      const currentHijri = data.data.find(d => {
        const gDate = new Date(d.date.gregorian.year, d.date.gregorian.month.number - 1, d.date.gregorian.day);
        return today >= gDate;
      });

      if (currentHijri) {
        setIsRamadan(true);
        setActiveDay(Number(currentHijri.date.hijri.day));
        setHijriHeader(`اليوم ${currentHijri.date.hijri.day} من رمضان`);
      } else {
        setIsRamadan(false);
        setActiveDay(0);
        setHijriHeader("اليوم 0 من رمضان");
      }
      const twoday = new Date();
      setGregorianHeader(
        twoday.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      );
    } catch (err) {
      console.log(err);
    }
  };

  fetchRamadan();
}, []);

  return (
    <header className="w-full">
      {/* زر تغيير المدينة */}
          <button
        onClick={() => {
          localStorage.removeItem("city");
          localStorage.removeItem("city_ar");

          // ✅ مهم جدًا لو كنت استخدمت GPS قبل كده
          localStorage.removeItem("lat");
          localStorage.removeItem("lng");

          // ✅ امسح كاش الصلوات لليوم (اختياري بس يخلي التغيير يظهر فورًا)
          clearPrayerCaches();

          window.location.reload();
        }}
        className="absolute top-5 left-3 px-2 py-2 font-bold text-white rounded-full shadow-lg z-50"
        style={{
          background:"linear-gradient(180deg, #D7B266 0%, #C89B4B 45%, #B98636 100%)",
          border: "2px solid #E7C87A",
          boxShadow: "0 6px 15px rgba(0,0,0,0.25)",
        }}
      >
        تغيير المدينة
      </button>

      {/* Top mint area */}
      <div className="relative w-full h-[160px] overflow-visible rounded-b-[80px] bg-[#8dcba1c2] px-3 pt-6">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
          <div className="absolute -top-14 right-0 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
        </div>
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconButton onClick={onCalendar} size="small">
              <CalendarMonthRoundedIcon sx={{ fontSize: 30, color: "#2B2B2B" }} />
            </IconButton>

            <div className="leading-tight">
              <div className="text-[18px] font-semibold text-[#1f1f1f]">{hijriHeader}</div>
              <div className="text-[13px] font-medium text-[#1f1f1f]/85 mt-1">{gregorianHeader}</div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <div
            className="relative w-[92%] max-w-md h-[108px] rounded-[30px]
              shadow-[0_18px_35px_rgba(0,0,0,0.18)]
              mt-2"
            style={{
              background:
                "linear-gradient(180deg, #D7B266 0%, #C89B4B 45%, #B98636 100%)",
              WebkitMask:
                "radial-gradient(18px 18px at 0% 50%, transparent 98%, #000 100%) left/51% 100% no-repeat, radial-gradient(18px 18px at 100% 50%, transparent 98%, #000 100%) right/51% 100% no-repeat, linear-gradient(#000 0 0)",
              mask:
                "radial-gradient(18px 18px at 0% 50%, transparent 98%, #000 100%) left/51% 100% no-repeat, radial-gradient(18px 18px at 100% 50%, transparent 98%, #000 100%) right/51% 100% no-repeat, linear-gradient(#000 0 0)",
            }}
          >
            <div
              className="absolute inset-[6px] rounded-[22px]"
              style={{
                border: "2px solid rgba(255,255,255,0.28)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10)",
              }}
            />

            <div className="relative h-full flex flex-col items-center justify-center text-center">
              <div
                className="text-white font-extrabold tracking-[2px] leading-none"
                style={{
                  fontSize: "54px",
                  textShadow: "0 8px 18px rgba(0,0,0,0.25)",
                }}
              >
                {countdown}
              </div>
              <div
                className="mt-1 text-white font-semibold"
                style={{
                  fontSize: "18px",
                  textShadow: "0 6px 14px rgba(0,0,0,0.20)",
                }}
              >
                {nextPrayerText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
