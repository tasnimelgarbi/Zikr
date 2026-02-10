import { useNavigate } from "react-router-dom";

export default function AzkarCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/AzkarCounter"); 
  };

  return (
    <div className="max-w-xs mx-auto h-29 bg-white rounded-2xl p-6 text-center ml-2 shadow-sm relative mr-2 cursor-pointer hover:shadow-md transition">
      <h2 className="text-xl font-bold mb-4">أذكارك اليومية</h2>
      <button
        onClick={handleClick}
        className="text-white font-semibold py-2 px-4 rounded-4xl bg-gradient-to-b from-[#d8b15c] to-[#bf943f]" 
      >
        اقرأ أذكارك
      </button>
    </div>
  );
}
