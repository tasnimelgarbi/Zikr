import React, { useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import BackButton from "./BackButton.jsx";

// مكون رقم الآية داخل دائرة (قريب من quran.com)
function AyahBadge({ n }) {
  return (
    <span className="inline-flex align-middle mx-1">
      <svg
        width="28"
        height="28"
        viewBox="0 0 40 40"
        className="inline-block"
        aria-hidden="true"
      >
        {/* إطار خارجي */}
        <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
        {/* نقاط زخرفية بسيطة */}
        <circle cx="20" cy="3.6" r="1.2" fill="currentColor" opacity="0.35" />
        <circle cx="20" cy="36.4" r="1.2" fill="currentColor" opacity="0.35" />
        <circle cx="3.6" cy="20" r="1.2" fill="currentColor" opacity="0.35" />
        <circle cx="36.4" cy="20" r="1.2" fill="currentColor" opacity="0.35" />

        <text
          x="20"
          y="25"
          textAnchor="middle"
          fontSize="14"
          fontFamily="'Inter', system-ui, -apple-system, Segoe UI, Roboto"
          fill="currentColor"
          opacity="0.9"
        >
          {n}
        </text>
      </svg>
    </span>
  );
}

function SurahHeader({ name }) {
  return (
    <div className="text-center mb-4">
      <h2 className="text-[28px] sm:text-[34px] font-extrabold tracking-tight text-zinc-900">
        {name}
      </h2>
      <div className="mt-3 h-px w-40 mx-auto bg-zinc-200" />
    </div>
  );
}

function Basmala() {
  return (
    <div
      className="text-center text-[26px] sm:text-[30px] text-zinc-900 mb-6"
      style={{ fontFamily: "'Amiri Quran', serif" }}
    >
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </div>
  );
}

export default function Quran() {

const { id } = useParams();
const location = useLocation();
const navigate = useNavigate();
const [wird, setWird] = React.useState(location.state || null);

// fallback لو عملت refresh أو state مش موجود
React.useEffect(() => {
  if (!wird) {
    // جلب الورد من localStorage
    const savedWirds = JSON.parse(localStorage.getItem("quran-wirds-progress") || "[]");
    const wirdId = Number(id);
    
    // placeholder لو مش مخزّن كامل
    const placeholder = { id: wirdId, ayahs: [] };
    
    const found = savedWirds.find(w => w.id === wirdId) || placeholder;
    setWird(found);
  }
}, [id, wird]);

  const grouped = useMemo(() => {
    if (!wird?.ayahs?.length) return [];
    const map = wird.ayahs.reduce((acc, ayah) => {
      const key = ayah.surahName || "سورة";
      if (!acc[key]) acc[key] = [];
      acc[key].push(ayah);
      return acc;
    }, {});
    return Object.entries(map); // [ [surahName, ayahs], ... ]
  }, [wird]);

    if (!wird) {
    return (
      <div className="min-h-screen grid place-items-center">
        <button onClick={() => navigate(-1)}>رجوع</button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-50">
      {/* Top bar (زي quran.com بسيط) */}
      <div className="sticky top-0 z-20 backdrop-blur bg-zinc-50/80 border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-zinc-600">
            <span className="font-semibold text-zinc-900">الورد</span>{" "}
            <span className="text-zinc-700">رقم {id}</span>
          </div>
             <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
                <BackButton />
              </div>
        </div>
      </div>

      {/* Page */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Card */}
        <div className="bg-[url('/quran.png')] border border-zinc-200 rounded-3xl shadow-sm">
          <div className="px-5 sm:px-8 py-6 sm:py-8">
            {grouped.map(([surahName, ayahs], idx) => (
              <section key={`${surahName}-${idx}`} className={idx ? "mt-10" : ""}>
                <SurahHeader name={surahName} />

                {/* (اختياري) البسملة: اعرضها لأول سورة في الورد أو لو بتحب دايمًا */}
                {idx === 0 ? <Basmala /> : null}

                {/* Body: زي quran.com - آيات بتنسيق مريح */}
                <div
                  className="text-zinc-900 leading-[2.35] sm:leading-[2.6] text-[24px] sm:text-[28px]"
                  style={{
                    fontFamily: "'Amiri Quran', serif",
                    textAlign: "justify",
                    textJustify: "inter-word",
                  }}
                >
                  {ayahs.map((ayah, i) => (
                    <span key={i}>
                      <span className="whitespace-pre-wrap">{ayah.text}</span>
                      {/* رقم الآية بدائرة */}
                      <span className="text-zinc-700">
                        <AyahBadge n={ayah.ayahNumber} />
                      </span>

                      {/* مسافة بسيطة بين الآيات */}
                      <span className="inline-block w-1" />
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}