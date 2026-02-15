import React, { useEffect, useState } from "react";

/* ========= ICONS MAP ========= */
const ICONS = {
  fajr: "https://cdn-icons-png.flaticon.com/512/6796/6796223.png",
  sunrise: "https://cdn-icons-png.flaticon.com/512/6796/6796223.png",
  dhuhr: "https://cdn-icons-png.flaticon.com/512/3222/3222918.png",
  asr: "https://cdn-icons-png.flaticon.com/512/12184/12184739.png",
  maghrib: "https://cdn-icons-png.flaticon.com/512/1812/1812660.png",
  isha: "https://cdn-icons-png.flaticon.com/512/1812/1812660.png",
};

function PrayerIconImg({ name }) {
  return (
    <img
      src={ICONS[name]}
      alt={name}
      draggable="false"
      className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
    />
  );
}

export default function PrayerTimes() {
  const [prayers, setPrayers] = useState([]);

useEffect(() => {
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

      const todayKey = `prayer-times-${new Date().toDateString()}-${sourceKey}-m${method}-s${school}`;

      const cleanTime = (t) => String(t || "").split(" ")[0];

      const cached = localStorage.getItem(todayKey);
      if (cached) {
        const timings = JSON.parse(cached);
        buildAndSetPrayers(timings);
        return;
      }

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
      buildAndSetPrayers(timings);

      function buildAndSetPrayers(timings) {
        const formatTime = (time24) => {
          const [h, m] = cleanTime(time24).split(":").map(Number);
          const period = h >= 12 ? "م" : "ص";
          let hour = h % 12;
          if (hour === 0) hour = 12;
          return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
        };

        const prayersArray = [
          { name: "الفجر", time: formatTime(timings.Fajr), rawTime: cleanTime(timings.Fajr), icon: "fajr" },
          { name: "الشروق", time: formatTime(timings.Sunrise), rawTime: cleanTime(timings.Sunrise), icon: "sunrise" },
          { name: "الظهر", time: formatTime(timings.Dhuhr), rawTime: cleanTime(timings.Dhuhr), icon: "dhuhr" },
          { name: "العصر", time: formatTime(timings.Asr), rawTime: cleanTime(timings.Asr), icon: "asr" },
          { name: "المغرب", time: formatTime(timings.Maghrib), rawTime: cleanTime(timings.Maghrib), icon: "maghrib" },
          { name: "العشاء", time: formatTime(timings.Isha), rawTime: cleanTime(timings.Isha), icon: "isha" },
        ];

        const now = new Date();
        let foundActive = false;

        prayersArray.forEach((p) => {
          const [hour, minute] = p.rawTime.split(":").map(Number);
          const pDate = new Date();
          pDate.setHours(hour, minute, 0, 0);

          if (!foundActive && pDate > now) {
            p.active = true;
            foundActive = true;
          } else {
            p.active = false;
          }
        });

        if (!foundActive) prayersArray[0].active = true;

        setPrayers(prayersArray);
      }
    } catch (err) {
      console.error("Prayer API Error:", err);
    }
  };

  fetchTimings();
}, []);


  return (
    <section dir="rtl" className="w-full overflow-x-hidden rounded-2xl p-3 mt-6">
      {/* ===== CARDS ===== */}
      <div className="grid grid-cols-6 gap-2">
        {prayers.map((it, idx) => {
          const isActive = it.active;

          return (
            <div
              key={idx}
              className={[
                "flex flex-col items-center rounded-2xl p-2 transition-all shadow-md duration-200 ease-in-out",
                isActive
                  ? "bg-[#A7CDB6] shadow-md scale-[1.03]"
                  : "bg-white/60",
              ].join(" ")}
            >
              {/* icon */}
              <div
                className={[
                  "mb-1 flex h-9 w-9 items-center justify-center rounded-full overflow-hidden",
                  isActive
                    ? "bg-white"
                    : "bg-[rgba(167,205,182,0.35)]",
                ].join(" ")}
              >
                <PrayerIconImg name={it.icon} />
              </div>

              {/* name */}
              <span
                className={[
                  "text-[8px] sm:text-xs font-medium leading-none",
                  isActive ? "text-white" : "text-gray-700",
                ].join(" ")}
              >
                {it.name}
              </span>

              {/* time */}
              <span
                className={[
                  "mt-0.5 text-[10px] sm:text-xs font-semibold leading-none",
                  isActive ? "text-white" : "text-gray-900",
                ].join(" ")}
              >
                {it.time}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
