export default function DeceasedCard({ data, onPray }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-lg">
      <div className="text-center">
        <div className="text-xl font-extrabold">
          {data.gender === "male" ? "رحمهُ الله" : " رحمها الله"}
        </div>
        <div className="text-2xl font-extrabold mt-1 text-zinc-900">
          {data.name}
        </div>

        {data.note && (
          <div className="mt-3 text-zinc-600 font-semibold">
            “{data.note}”
          </div>
        )}
      </div>

      <button
        onClick={onPray}
        className="mt-5 w-full py-3 rounded-full font-extrabold text-white shadow"
        style={{
          background:
            "linear-gradient(180deg,#9fc7b2,#7bbf9b)",
        }}
      >
        🤍 رحمك الله ({data.prayers})
      </button>
    </div>
  );
}