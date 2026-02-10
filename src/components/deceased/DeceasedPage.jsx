import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import AddDeceasedModal from "./AddDeceasedModal";
import DeceasedCard from "./DeceasedCard";
import Footer from "../Footer";
import BackButton from "../BackButton"; 
import SplashGate from "../SplashGate";

export default function DeceasedPage() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("deceased")
      .select("*")
      .order("created_at", { ascending: false });

    setList(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addDeceased = async (payload) => {
    await supabase.from("deceased").insert(payload);
    setOpen(false);
    fetchData();
  };

  const prayFor = async (id, prayers) => {
    await supabase
      .from("deceased")
      .update({ prayers: prayers + 1 })
      .eq("id", id);

    fetchData();
  };

  return (
    <SplashGate isDataLoading={isLoading}>
    <div dir="rtl" className="min-h-screen bg-[#F4EDDF] px-4 pb-24">
        {/* ===== Back Button ===== */}
        <div className="absolute top-4 right-3 z-30">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center py-10">
          <h1 className="text-3xl font-extrabold text-zinc-900">
            🕊️ اذكروا محاسن موتاكم
          </h1>
          <p className="mt-2 text-zinc-600 font-semibold">
            لعل دعوة صادقة ترفع درجاتهم
          </p>
        </div>

      {/* زر إضافة */}
      <button
        onClick={() => setOpen(true)}
        className="mx-auto mb-8 block rounded-2xl px-6 py-3 font-extrabold text-white shadow-lg"
        style={{
          background:
            "linear-gradient(180deg,#D7B266,#C89B4B,#B98636)",
        }}
      >
       أضف اسمًا للدعاء
      </button>

      {/* القائمة */}
      <div className="space-y-4 max-w-md mx-auto">
        {list.map((item) => (
          <DeceasedCard
            key={item.id}
            data={item}
            onPray={() => prayFor(item.id, item.prayers)}
          />
        ))}
      </div>

      <AddDeceasedModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={addDeceased}
      />
      <Footer/>
    </div>  
    </SplashGate>
  );
}