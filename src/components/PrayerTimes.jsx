import { useEffect, useState } from "react";
import panelBg from "/werd card.png";
import BackButton from "./BackButton.jsx";
import Footer from "./Footer.jsx";

export default function PrayerTimesCard() {
  const icon = {
    fajr: "https://cdn-icons-png.flaticon.com/512/6796/6796223.png",
    sunrise: "https://cdn-icons-png.flaticon.com/512/6796/6796223.png",
    dhuhr: "https://cdn-icons-png.flaticon.com/512/3222/3222918.png",
    asr: "https://cdn-icons-png.flaticon.com/512/12184/12184739.png",
    maghrib: "https://cdn-icons-png.flaticon.com/512/1812/1812660.png",
    isha: "https://cdn-icons-png.flaticon.com/512/1812/1812660.png",
  };

  const title = "مواقيت الصلاة";
  const [times, setTimes] = useState(null);
  const [countdown, setCountdown] = useState("00:00:00");
  const [remaining, setRemaining] = useState("");
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    fetch("https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5")
      .then(res => res.json())
      .then(data => {
        setTimes(data.data.timings);
      });
  }, []);

  useEffect(() => {
    if (!times) return;

    const prayers = [
      { key: "fajr", label: "الفجر", time: times.Fajr },
      { key: "dhuhr", label: "الظهر", time: times.Dhuhr },
      { key: "asr", label: "العصر", time: times.Asr },
      { key: "maghrib", label: "المغرب", time: times.Maghrib },
      { key: "isha", label: "العشاء", time: times.Isha },
    ];

    const updateCountdown = () => {
      const now = new Date();
      let nextPrayer = null;

      for (let p of prayers) {
        const [h, m] = p.time.split(":");
        const prayerTime = new Date();
        prayerTime.setHours(h, m, 0);

        if (prayerTime > now) {
          nextPrayer = { ...p, date: prayerTime };
          break;
        }
      }

      if (!nextPrayer) {
        const [h, m] = times.Fajr.split(":");
        const fajrTomorrow = new Date();
        fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
        fajrTomorrow.setHours(h, m, 0);
        nextPrayer = { key: "fajr", label: "الفجر", date: fajrTomorrow };
      }

      const diff = nextPrayer.date - now;
      const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

      setCountdown(`${hours}:${minutes}:${seconds}`);
      setRemaining(`متبقي على صلاة ${nextPrayer.label}`);
      setActiveKey(nextPrayer.key);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [times]);

  const rows = times ? [
    { key: "fajr", label: "الفجر", time: formatTime(times.Fajr), icon: icon.fajr, iconBg: "#a8c9b8", textColor: "text-gray-800" },
    { key: "dhuhr", label: "الظهر", time: formatTime(times.Dhuhr), icon: icon.dhuhr, iconBg: "#a8c9b8", textColor: "text-gray-800" },
    { key: "asr", label: "العصر", time: formatTime(times.Asr), icon: icon.asr, iconBg: "#d4c4a8", textColor: "text-gray-800" },
    { key: "maghrib", label: "المغرب", time: formatTime(times.Maghrib), icon: icon.maghrib, iconBg: "#c4a857", textColor: "text-gray-800" },
    { key: "isha", label: "العشاء", time: formatTime(times.Isha), icon: icon.isha, iconBg: "#c4a857", textColor: "text-gray-800", hasGoldBorder: true },
  ] : [];

  function formatTime(time24) {
    if (!time24) return "";
    let [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "م" : "ص";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }

  return (
    <div dir="rtl" className="min-h-screen w-full" style={{ backgroundColor: "#b8d4c8" }}>
      <div className="absolute top-10 right-8 z-30">
        <BackButton />
      </div>

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${panelBg})`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative px-4 py-6">
        <div className="mx-auto w-full max-w-[390px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#f5f1e8] shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_3px_rgba(180,140,70,0.3)]">
            <div className="relative px-6 pt-6 pb-5">
              <h2 className="text-center text-[20px] font-bold text-gray-800">{title}</h2>

              {/* ================== عداد متبقي على الصلاة ================== */}
              <div className="mt-4 mb-2 flex flex-col items-center justify-center rounded-[20px] py-4 shadow-md" 
              style={{
              background:
                "linear-gradient(180deg, #D7B266 0%, #C89B4B 45%, #B98636 100%)",}}>
                <div className="text-[28px] sm:text-[32px] font-extrabold text-white">{countdown}</div>
                <div className="mt-1 text-[14px] sm:text-[16px] font-semibold text-white">{remaining}</div>
              </div>

              {/* صفوف الصلوات */}
              <div className="mt-6 space-y-3">
                {rows.map((r) => (
                  <PrayerRow
                    key={r.key}
                    label={r.label}
                    time={r.time}
                    iconUrl={r.icon}
                    iconBg={r.iconBg}
                    textColor={r.textColor}
                    isActive={r.key === activeKey}
                    hasGoldBorder={r.hasGoldBorder}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrayerRow({ label, time, iconUrl, iconBg, textColor, isActive, hasGoldBorder }) {
  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden rounded-[20px] h-[72px] shadow-lg"
      style={hasGoldBorder ? { boxShadow: '0 0 0 2px #c4a857' } : {}}
    >
      {/* الخلفية */}
      <img
        src="/werd card.png"
        alt={label}
        className="w-full h-full object-cover"
        draggable="false"
      />

      {/* overlay دهبي نص شفاف لو active */}
      {isActive && (
        <div className="absolute inset-0 bg-[#A7CDB6]/50 rounded-[20px]" />
      )}

      {/* المحتوى فوق الصورة */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div
            className="grid h-11 w-11 place-items-center rounded-full"
            style={{ backgroundColor: iconBg }}
          >
            <img
              src={iconUrl}
              alt={label}
              className="h-6 w-6 object-contain brightness-0 invert"
              draggable="false"
            />
          </div>

          <div>
            <div className={`text-[15px] font-bold ${textColor}`}>{label}</div>
            <div className={`mt-0.5 text-[14px] font-semibold ${textColor === "text-yellow-900" ? "text-yellow-900" : "text-gray-700"}`}>{time}</div>
          </div>
        </div>

        <div className="w-[35%]" />
      </div>
      <Footer />
    </section>
  );
}
