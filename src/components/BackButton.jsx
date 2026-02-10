import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
  const path = location.pathname;
  if (path === "/werd-quran") {
    navigate("/werd-page");
  } else if (path.startsWith("/Quran/")) { 
    navigate("/werd-quran");
  } else {
    navigate("/");
  }
};

  return (
    <button
      onClick={goBack}
      className={[
        "inline-flex items-center gap-2",
        "h-10 px-4 rounded-full",
        "bg-white/70 backdrop-blur-md",
        "border border-white/60",
        "shadow-[0_10px_25px_rgba(0,0,0,0.12)]",
        "text-amber-950 font-extrabold",
        "active:scale-[0.98] transition",
        "hover:bg-white/80",
        className,
      ].join(" ")}
      aria-label="رجوع"
    >
      <ArrowRight className="w-5 h-5" />
    </button>
  );
}