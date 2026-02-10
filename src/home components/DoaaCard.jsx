import React from "react";
import { Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DoaaCard() {
  const navigate = useNavigate();

  const goToDuas = () => {
    navigate("/duas"); // دي بتحوّل الصفحة للـ Route ده
  };

  return (
    <div
      onClick={goToDuas} // لما تدوسي على الكارد
      className="w-full rounded-2xl h-29 bg-white p-4 shadow-sm relative mr-2 cursor-pointer hover:shadow-md transition"
    >
      {/* زر المشاركة يفضل ما يتحركش للـ route */}
      <button
        onClick={(e) => e.stopPropagation()} // يمنع الكليك على البوتون من تحويل الصفحة
        className="absolute top-4 left-4 text-gray-400"
      >
      </button>

      <p className="text-sm font-semibold text-gray-800 mb-2">
        دعاء اليوم:
      </p>

      <p className="text-sm text-gray-600 leading-relaxed">
            اللَّهُمَّ إنَّكَ عَفُوٌّ تُحِبُّ العَفْوَ فَاعْفُ عَنَّا       
      </p>
    </div>
  );
}
