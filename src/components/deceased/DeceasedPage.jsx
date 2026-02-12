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
      .order("created_at", { ascending: true });

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
      <div
        dir="rtl"
        className="relative min-h-screen overflow-hidden bg-[#F6F0E3] px-4 pb-28"
      >
        {/* ===== Paper / Parchment Background ===== */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFF9EE] via-[#F6F0E3] to-[#EFE6D2]" />
          {/* حُبيبات خفيفة */}
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:18px_18px]" />
          {/* لمعة ذهبية */}
          <div className="absolute -top-24 left-[-120px] h-72 w-72 rounded-full bg-[#E7C87A]/25 blur-3xl" />
          <div className="absolute top-56 right-[-140px] h-80 w-80 rounded-full bg-[#C89B4B]/18 blur-3xl" />
          {/* نقش قوسي خفيف فوق */}
          <div className="absolute left-1/2 top-10 h-20 w-[92%] -translate-x-1/2 rounded-[36px] border border-black/5 bg-white/30 backdrop-blur-[1px]" />
          <div className="absolute left-1/2 top-14 h-[1px] w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#C89B4B]/35 to-transparent" />
        </div>

        {/* ===== Back Button ===== */}
        <div className="absolute top-4 right-3 z-30">
          <BackButton />
        </div>

        {/* ===== Header ===== */}
        <div className="relative z-10 mx-auto max-w-md pt-12 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 shadow-sm">
            <span className="text-sm font-extrabold text-[#7A5B1B]">
              🕊️ تذكير بالدعاء والرحمة
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-[#1F1F1F] tracking-tight">
            أحبابنا الذين فقدناهم
          </h1>
          <p className="mt-2 font-semibold text-black/60">
            دعوة صادقة… نورٌ ورحمةٌ في قبورهم
          </p>

          {/* ===== Add Button ===== */}
          <button
            onClick={() => setOpen(true)}
            className="mt-6 w-full rounded-2xl px-6 py-3 font-extrabold text-white shadow-[0_18px_40px_rgba(0,0,0,.12)] transition active:scale-[0.99]"
            style={{
              background: "linear-gradient(180deg,#2E7D64,#1F6A55,#165545)",
            }}
          >
            + أضف اسمًا للدعاء
          </button>

          {/* ===== Info Card ===== */}
          <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-4 text-right shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-8 w-8 shrink-0 rounded-xl bg-[#E7C87A]/40 flex items-center justify-center">
                <span className="text-[#7A5B1B] font-black">۞</span>
              </div>
              <div className="text-sm leading-6 text-black/70 font-semibold">
                كل ما تضغط <span className="text-[#1F6A55] font-extrabold">"رحمك الله"</span>{" "}
                تُحسب دعوة وتزيد الأجر بإذن الله.
              </div>
            </div>
          </div>
        </div>

        {/* ===== List ===== */}
        <div className="relative z-10 mx-auto mt-6 max-w-md space-y-4">
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

        <div className="relative z-10">
        </div>
      </div>       
         <Footer />
    </SplashGate>
  );
}