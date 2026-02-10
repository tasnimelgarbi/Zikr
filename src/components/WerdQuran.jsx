import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton.jsx";
import Footer from "./Footer.jsx";
import SplashGate from "./SplashGate.jsx";

export default function QuranWirdList() {
  // ✅ key ثابت بدل key بتاع تاريخ اليوم
  const STORAGE_KEY = "quran-wirds-progress";
  const [isLoading, setIsLoading] = useState(true);
  const [completedWirds, setCompletedWirds] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [days, setDays] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/quran/quran-uthmani")
      .then((res) => res.json())
      .then((data) => {
        const surahs = data.data.surahs;
        let allAyahs = [];

        // من أول سورة البقرة
        surahs.forEach((surah) => {
          if (surah.number >= 2) {
            surah.ayahs.forEach((ayah) => {
              allAyahs.push({
                text: ayah.text,
                surahName: surah.name,
                ayahNumber: ayah.numberInSurah,
              });
            });
          }
        });

        // 90 ورد (30 يوم × 3)
        const wirdSize = Math.ceil(allAyahs.length / 90);

        const allWirds = Array.from({ length: 90 }, (_, i) => {
          const start = i * wirdSize;
          const end = start + wirdSize;

          return {
            id: i + 1,
            title: `الورد ${i + 1}`,
            ayahs: allAyahs.slice(start, end),
          };
        });

        // تقسيمهم على أيام
        const daysData = Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          wirds: allWirds.slice(i * 3, i * 3 + 3),
        }));

        setDays(daysData);
        setIsLoading(false); // ✅ لما البيانات تتحمّل خلاص
      });
  }, []);

  const toggleWird = (id) => {
    setCompletedWirds((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((wirdId) => wirdId !== id)
        : [...prev, id];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#F4EDDF] relative overflow-hidden">
      <SplashGate isDataLoading={isLoading}>
      {/* ================= HEADER ================= */}
      <header className="w-full">
        <div className="relative w-full h-[120px] overflow-visible rounded-b-[80px] bg-[#8dcba1c2] px-3 pt-6">
          <div
            className="absolute inset-0 rounded-b-[80px] opacity-30 pointer-events-none"
            style={{
              backgroundImage: "url('/full bg azskar.jpeg')",
              backgroundRepeat: "repeat",
              mixBlendMode: "multiply",
            }}
          />
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
            <div className="absolute -top-14 right-0 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
          </div>
            <div className="absolute right-4 top-3 z-20">
            <BackButton />
          </div>
        </div>
      </header>

      {/* ================= TITLE ================= */}
      <div className="w-full flex justify-center -mt-16 px-4 relative z-20">
        <div
          className="w-full max-w-md h-[90px] flex items-center justify-center shadow-[0_18px_35px_rgba(0,0,0,0.22)] rounded-[30px]"
          style={{
            backgroundImage: "url('/ramadan1.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <span className="text-[30px] font-extrabold text-amber-950">
            وِرْدُ القُرآن
          </span>
        </div>
      </div>

      {/* ================= DAYS ================= */}
      <div className="w-full flex justify-center mt-8 px-4">
        <div className="w-full max-w-md space-y-10">
          {days.map((day) => (
            <div key={day.day}>
              {/* عنوان اليوم */}
              <h2 className="text-center text-[22px] font-extrabold text-amber-900 mb-4">
                اليوم {day.day}
              </h2>

              <div className="space-y-4">
                {day.wirds.map((wird, index) => {
                  const isCompleted = completedWirds.includes(wird.id);

                  return (
                    <div
                      key={wird.id}
                     onClick={() => navigate(`/Quran/${wird.id}`, { state: wird })}
                      className="relative w-full flex items-center justify-between p-5 rounded-[26px] shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition active:scale-[0.98]"
                      style={{
                        backgroundImage: "url('/werd card.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {/* Checkbox */}
                      <div className="flex items-center gap-4 border-2 border-amber-300 rounded-full">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWird(wird.id);
                          }}
                          className="w-14 h-14 rounded-xl flex items-center justify-center"
                        >
                          {isCompleted && (
                            <Check
                              className="w-8 h-8 text-amber-700"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </div>

                      {/* النص في منتصف الكارد */}
                      <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
                        <div className="flex flex-col items-center">
                          <div className="text-[22px] font-extrabold text-amber-950">
                            الورد {index + 1}
                          </div>
                          <div className="text-[16px] font-semibold text-[#6B6B6B]">
                            ضمن اليوم {day.day}
                          </div>
                        </div>
                      </div>

                      {/* spacer يمين */}
                      <div className="w-14 h-14" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= BLOBS ================= */}
      <div className="absolute top-12 right-8 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-12 left-8 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl" />
     <Footer />
    </SplashGate> 
     </div>
  );
}