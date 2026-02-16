import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function AddDeceasedModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [note, setNote] = useState("");

  // ✅ حل المشكلة: Portal + قفل سكرول الخلفية
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-md overflow-hidden rounded-3xl border border-black/10 bg-white/85 shadow-[0_22px_70px_rgba(0,0,0,.25)]">
        {/* Decorative header */}
        <div className="relative px-6 pt-6 pb-4">
          {/* Parchment gradients */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFF9EE] via-[#F6F0E3] to-[#EFE6D2]" />
            <div className="absolute -top-16 left-[-90px] h-44 w-44 rounded-full bg-[#E7C87A]/28 blur-3xl" />
            <div className="absolute top-12 right-[-100px] h-48 w-48 rounded-full bg-[#C89B4B]/18 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:18px_18px]" />
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="relative z-10 absolute top-4 right-4 h-10 w-10 rounded-2xl border border-black/10 bg-white/70 text-xl font-black text-black/55 transition hover:bg-white hover:text-black/80"
            aria-label="Close"
          >
            ×
          </button>

          <div className="relative z-10 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 shadow-sm">
              <span className="text-sm font-extrabold text-[#7A5B1B]">۞</span>
              <span className="text-sm font-extrabold text-[#7A5B1B]">
                أضف اسمًا للدعاء
              </span>
              <span className="text-sm font-extrabold text-[#7A5B1B]">۞</span>
            </div>

            <h2 className="mt-3 text-xl font-extrabold text-[#1F1F1F]">
              اللهم اجعلها صدقةً جارية 🤍
            </h2>
            <p className="mt-1 text-sm font-semibold text-black/60">
              اكتب الاسم واختر الصيغة، ويمكنك إضافة صفة طيبة (اختياري)
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="relative px-6 pb-6">
          {/* Name */}
          <div className="mb-3 text-right">
            <label className="mb-2 block text-sm font-extrabold text-black/70">
              الاسم
            </label>
            <input
              placeholder="اسم المتوفى"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 font-semibold text-black/80 outline-none transition focus:ring-4 focus:ring-[#E7C87A]/30"
            />
          </div>

          {/* Gender */}
          <div className="mb-3 text-right">
            <label className="mb-2 block text-sm font-extrabold text-black/70">
              الصيغة
            </label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-black/10 bg-white/80 px-4 py-3 pr-10 font-semibold text-black/80 outline-none transition focus:ring-4 focus:ring-[#E7C87A]/30"
              >
                <option value="male">رحمه الله</option>
                <option value="female">رحمها الله</option>
              </select>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/55">
                ▼
              </span>
            </div>
          </div>

          {/* Note */}
          <div className="mb-5 text-right">
            <label className="mb-2 block text-sm font-extrabold text-black/70">
              صفة طيبة أو دعاء (اختياري)
            </label>
            <textarea
              placeholder="مثال: كان حسن الخلق، اللهم اغفر له وارحمه"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-black/10 bg-white/80 px-4 py-3 font-semibold text-black/80 outline-none transition focus:ring-4 focus:ring-[#E7C87A]/30"
            />
          </div>

          {/* Actions */}
          <button
            onClick={() =>
              onSubmit({
                name,
                gender,
                note,
                prayers: 0,
              })
            }
            className="w-full rounded-2xl py-3 font-extrabold text-white shadow-[0_14px_30px_rgba(0,0,0,.12)] transition active:scale-[0.99]"
            style={{
              background: "linear-gradient(180deg,#2E7D64,#1F6A55,#165545)",
            }}
          >
            إضافة 🤍
          </button>

          {/* small footer hint */}
          <div className="mt-3 text-center text-xs font-semibold text-black/55">
            يمكن غلق النافذة بالضغط خارج المربع
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
