import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

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

    const fetchTimings = async () => {
      try {
        const res = await fetch(
          "https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5"
        );
        const data = await res.json();
        const timings = data.data.timings;

        prayersArray = [
          { name: "الفجر", time: timings.Fajr },
          { name: "الشروق", time: timings.Sunrise },
          { name: "الظهر", time: timings.Dhuhr },
          { name: "العصر", time: timings.Asr },
          { name: "المغرب", time: timings.Maghrib },
          { name: "العشاء", time: timings.Isha },
        ];

        updateCountdown(); // أول مرة
      } catch (err) {
        console.log("Error fetching timings:", err);
      }
    };

    const updateCountdown = () => {
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
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hijri date logic
  useEffect(() => {
  const fetchRamadan = async () => {
    try {
      const res = await fetch(
        "https://api.aladhan.com/v1/hijriCalendarByCity?city=Cairo&country=Egypt&method=5&month=9"
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
