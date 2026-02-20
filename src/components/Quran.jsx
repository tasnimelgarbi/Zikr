import React, { useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import BackButton from "./BackButton.jsx";

// مكون رقم الآية داخل دائرة (قريب من quran.com)
function AyahBadge({ n }) {
  return (
    <span className="inline-flex align-middle mx-1">
      <svg width="28" height="28" viewBox="0 0 40 40" className="inline-block" aria-hidden="true">
        <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
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
      <h2 className="text-[28px] sm:text-[34px] font-extrabold tracking-tight text-zinc-900">{name}</h2>
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

  // ✅ Bookmark
  const BOOKMARK_KEY = `quran-bookmark-${id}`;
  const [bookmark, setBookmark] = React.useState(() => {
    try {
      const saved = localStorage.getItem(BOOKMARK_KEY);
      return saved ? JSON.parse(saved) : null; // { surahName, ayahNumber }
    } catch {
      return null;
    }
  });

  // ✅ fallback لو عملت refresh أو state مش موجود
  React.useEffect(() => {
    if (!wird) {
      const wirdId = Number(id);
      const allWirds = JSON.parse(localStorage.getItem("quran-wirds-data") || "[]");
      const found = Array.isArray(allWirds) ? allWirds.find((w) => w.id === wirdId) : null;
      setWird(found || { id: wirdId, title: `الورد ${wirdId}`, ayahs: [] });
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
    return Object.entries(map);
  }, [wird]);

  const isBookmarkedAyah = (ayah) => {
    return (
      bookmark &&
      bookmark.surahName === ayah.surahName &&
      Number(bookmark.ayahNumber) === Number(ayah.ayahNumber)
    );
  };

  const setBookmarkOnAyah = (ayah) => {
    const payload = { surahName: ayah.surahName, ayahNumber: ayah.ayahNumber };
    setBookmark(payload);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(payload));
  };

  const clearBookmark = () => {
    setBookmark(null);
    localStorage.removeItem(BOOKMARK_KEY);
  };

  const goToBookmark = () => {
    if (!bookmark) return;
    const el = document.getElementById(`bm-${bookmark.surahName}-${bookmark.ayahNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // لمسة صغيرة لفت الانتباه
      el.classList.add("ring-2", "ring-amber-400/70");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-amber-400/70");
      }, 900);
    }
  };

  if (!wird) {
    return (
      <div className="min-h-screen grid place-items-center">
        <button onClick={() => navigate(-1)}>رجوع</button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 backdrop-blur bg-zinc-50/80 border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-zinc-600">
            <span className="font-semibold text-zinc-900">الورد</span>{" "}
            <span className="text-zinc-700">رقم {id}</span>
            {wird?.title ? <span className="text-zinc-500"> • {wird.title}</span> : null}
          </div>

          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
            <BackButton />
          </div>
        </div>

        {/* ✅ Bookmark actions */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex items-center gap-2">
          <button
            onClick={goToBookmark}
            disabled={!bookmark}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
              bookmark
                ? "bg-white border-zinc-200 text-zinc-800 active:scale-[0.98]"
                : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
            }`}
          >
            الرجوع للعلامة
          </button>

          <button
            onClick={clearBookmark}
            disabled={!bookmark}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
              bookmark
                ? "bg-white border-zinc-200 text-zinc-800 active:scale-[0.98]"
                : "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
            }`}
          >
            مسح العلامة
          </button>

          {bookmark ? (
            <div className="text-xs text-zinc-500 mr-1">
              علامة عند: {bookmark.surahName} • {bookmark.ayahNumber}
            </div>
          ) : null}
        </div>
      </div>

      {/* Page */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Card */}
        <div className="bg-[url('https://i.ibb.co/pvQmtYVM/quran.jpg')] border border-zinc-200 rounded-3xl shadow-sm">
          <div className="px-5 sm:px-8 py-6 sm:py-8">
            {grouped.map(([surahName, ayahs], idx) => (
              <section key={`${surahName}-${idx}`} className={idx ? "mt-10" : ""}>
                <SurahHeader name={surahName} />
                {idx === 0 ? <Basmala /> : null}

                <div
                  className="text-zinc-900 leading-[2.35] sm:leading-[2.6] text-[24px] sm:text-[28px]"
                  style={{
                    fontFamily: "'Amiri Quran', serif",
                    textAlign: "justify",
                    textJustify: "inter-word",
                  }}
                >
                  {ayahs.map((ayah, i) => {
                    const bookmarked = isBookmarkedAyah(ayah);
                    const domId = `bm-${ayah.surahName}-${ayah.ayahNumber}`;

                    return (
                      <span
                        key={i}
                        id={domId}
                        onClick={() => setBookmarkOnAyah(ayah)}
                        className={`cursor-pointer rounded-lg transition ${
                          bookmarked ? "bg-amber-100/60" : "hover:bg-black/5"
                        }`}
                        title="اضغط لوضع علامة هنا"
                      >
                        <span className="whitespace-pre-wrap">{ayah.text}</span>

                        <span className="text-zinc-700">
                          <AyahBadge n={ayah.ayahNumber} />
                        </span>

                        <span className="inline-block w-1" />
                      </span>
                    );
                  })}
                </div>
              </section>
            ))}

            {!wird?.ayahs?.length ? (
              <div className="text-center py-10 text-zinc-600">
                البيانات غير متاحة (جرّب ترجع لصفحة الأوراد وتفتح الورد تاني)
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}