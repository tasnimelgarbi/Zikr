import React, { useEffect, useState } from "react";
import bg from "/ramdan card.png";

export default function Ramdan({
  title = "رمضان كريم",
}) {

  const [imsak, setImsak] = useState("--:--");
  const [iftar, setIftar] = useState("--:--");

  useEffect(() => {
    const fetchTimes = async () => {
  try {
    const city = localStorage.getItem("city") || "Cairo";

    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Egypt&method=5`
    );
        const data = await res.json();
        const timings = data.data.timings;

        // تحويل للـ 12 ساعة بالعربي
        const format12Hour = (time24) => {
          const [h, m] = time24.split(":").map(Number);
          const period = h >= 12 ? "م" : "ص";
          const hour12 = h % 12 === 0 ? 12 : h % 12;
          return `${hour12}:${m.toString().padStart(2,"0")} ${period}`;
        };

        setImsak(format12Hour(timings.Imsak));
        setIftar(format12Hour(timings.Maghrib));
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
