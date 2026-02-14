import React, { useEffect, useState } from "react";

export default function Ramdan({
  title = "رمضان كريم",
}) {

  const bg = "https://i.ibb.co/vxdkLmLZ/ramdan-card.jpg";
  const [imsak, setImsak] = useState("--:--");
  const [iftar, setIftar] = useState("--:--");

 useEffect(() => {
  const fetchTimes = async () => {
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

      const todayKey = `imsak-iftar-${new Date().toDateString()}-${sourceKey}-m${method}-s${school}`;

      const cached = localStorage.getItem(todayKey);
      if (cached) {
        const timings = JSON.parse(cached);
        applyData(timings);
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
      applyData(timings);

      function applyData(timings) {
        const cleanTime = (t) => String(t || "").split(" ")[0];

        const format12Hour = (time24) => {
          const [h, m] = cleanTime(time24).split(":").map(Number);
          const period = h >= 12 ? "م" : "ص";
          const hour12 = h % 12 === 0 ? 12 : h % 12;
          return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
        };

        setImsak(format12Hour(timings.Imsak || timings.Fajr));
        setIftar(format12Hour(timings.Maghrib));
      }
    } catch (err) {
      console.log(err);
    }
  };

  fetchTimes();
}, []);

  return (
    <section
      dir="rtl"
      className="mx-auto relative w-full max-w-[900px] overflow-hidden rounded-[24px] mt-2"
    >
      {/* الخلفية */}
      <img
        src={bg}
        alt="Ramadan background"
        className="w-full h-[140px] sm:h-[180px] md:h-[220px] lg:h-[260px] object-cover"
      />

      {/* المحتوى */}
        <div className="absolute inset-0 flex justify-start items-start mr-4">
            <div className="text-right rtl">
          {/* العنوان */}
          <h2 className="mt-4 text-[20px] sm:text-[22px] md:text-[26px] lg:text-[30px] font-extrabold text-black/80">
            {title}
          </h2>

          {/* الإمساك / الإفطار */}
          <div className="mt-4 flex gap-4 sm:gap-6">
            <div>
              <div className="text-[14px] sm:text-[16px] md:text-[18px] font-bold">الإمساك</div>
              <div className="mt-1 text-[16px] sm:text-[18px] md:text-[20px] font-extrabold">
                {imsak}
              </div>
            </div>

            <div className="h-8 sm:h-10 w-px bg-black/20" />

            <div>
              <div className="text-[14px] sm:text-[16px] md:text-[18px] font-bold">الإفطار</div>
              <div className="mt-1 text-[16px] sm:text-[18px] md:text-[20px] font-extrabold">
                {iftar}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
