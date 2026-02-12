export default function DeceasedCard({ data, onPray }) {
  const dua = data.gender === "male" ? "رحمهُ الله" : "رحمها الله";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/70 p-5 shadow-[0_16px_40px_rgba(0,0,0,.10)]">
      {/* شريط جانبي زخرفي */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-[#E7C87A]/70 via-[#C89B4B]/40 to-transparent" />

      {/* ختم دائري خفيف */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full border border-black/10 bg-[#E7C87A]/15" />
      <div className="pointer-events-none absolute -left-7 -top-7 h-20 w-20 rounded-full border border-black/10 bg-white/40" />

      <div className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1">
          <span className="text-sm font-extrabold text-[#7A5B1B]">✦</span>
          <span className="text-sm font-extrabold text-black/75">{dua}</span>
          <span className="text-sm font-extrabold text-[#7A5B1B]">✦</span>
        </div>

        <div className="mt-3 text-2xl font-extrabold text-[#1E1E1E]">
          {data.name}
        </div>

        {data.note && (
          <div className="mt-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-semibold text-black/65">
            “{data.note}”
          </div>
        )}
      </div>

      <button
        onClick={onPray}
        className="mt-5 w-full rounded-2xl py-3 font-extrabold text-white shadow-[0_14px_30px_rgba(0,0,0,.12)] transition active:scale-[0.99]"
        style={{
          background: "linear-gradient(180deg,#2E7D64,#1F6A55,#165545)",
        }}
      >
         رحمك الله ({data.prayers}) 🤍
      </button>

      {/* فاصل زخرفي */}
      <div className="pointer-events-none mt-4">
        <div className="mx-auto h-[1px] w-[75%] bg-gradient-to-r from-transparent via-black/20 to-transparent" />
      </div>
    </div>
  );
}