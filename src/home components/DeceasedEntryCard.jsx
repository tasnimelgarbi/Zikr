import React from "react";
import { useNavigate } from "react-router-dom";

export default function DeceasedEntryCard() {
  const navigate = useNavigate();

  const title = "اذكروا محاسن موتاكم";
  const subtitle = "لعل دعوة صادقة ترفع درجاتهم";
  const bg = "https://i.ibb.co/1GxY6s6R/werd-card.png";

  return (
    <section dir="rtl" className="w-full">
      <div
        onClick={() => navigate("/deceased")}
        className="mx-auto relative w-full overflow-hidden rounded-[22px] shadow-[0_10px_28px_rgba(0,0,0,0.10)] ring-1 ring-black/5 mt-4 cursor-pointer active:scale-[0.98] transition"
      >
        {/* الخلفية */}
        <img
          src={bg}
          alt="Deceased card background"
          className="w-full h-[100px] object-cover"
          draggable="false"
        />

        {/* المحتوى */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          
          {/* أيقونة */}
          <div className="grid place-items-center w-12 h-12 rounded-full bg-white/85 shadow-sm ring-1 ring-black/5 shrink-0">
            <img
              src="https://cdn-icons-png.flaticon.com/512/709/709722.png"
              alt="Dua icon"
              className="w-6 h-6 object-contain"
            />
          </div>

          {/* النص */}
          <div className="flex-1 min-w-0 px-3">
            <div className="truncate text-[22px] font-extrabold text-black/80">
              {title}
            </div>
            <div className="truncate text-sm font-semibold text-black/55 mt-1">
              {subtitle}
            </div>
          </div>

          {/* سهم خفيف */}
          <div className="text-xl text-black/40 font-bold">
            ‹
          </div>
        </div>
      </div>
    </section>
  );
}
