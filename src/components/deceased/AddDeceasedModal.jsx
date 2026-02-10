import { useState } from "react";

export default function AddDeceasedModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [note, setNote] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-6 w-[90%] max-w-md shadow-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 text-2xl font-bold"
        >
          ×
        </button>

        <h2 className="text-xl font-extrabold mb-4 text-center">
          أضف اسمًا للدعاء🤍 
        </h2>

        <input
          placeholder="اسم المتوفى"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-3 rounded-xl border"
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full mb-3 p-3 rounded-xl border"
        >
          <option value="male">رحمه الله</option>
          <option value="female">رحمها الله</option>
        </select>

        <textarea
          placeholder="صفة طيبة أو دعاء (اختياري)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl border"
        />

        <button
          onClick={() =>
            onSubmit({
              name,
              gender,
              note,
              prayers: 0,
            })
          }
          className="w-full py-3 rounded-xl font-extrabold text-white"
          style={{
            background:
              "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)",
          }}
        >
          إضافة 🤍
        </button>
      </div>
    </div>
  );
}
