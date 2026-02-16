import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import Payer from "./payer.jsx";
import RamdanCard from "./RamadanCard.jsx";
import SebhaCard from "./SebhaCard.jsx";
import WerdCard from "./WerdCard.jsx";
import DoaaCard from "./DoaaCard.jsx";
import AzkarCard from "./AzkarCard.jsx";
import Footer from "../components/Footer.jsx";
import DeceasedEntryCard from "./DeceasedEntryCard.jsx";
import QuickDuaPopup from "./QuickDuaPopup.jsx";

const Home = () => {
  const navigate = useNavigate();
  const [openPopup, setOpenPopup] = useState(false);

useEffect(() => {
  const t = setTimeout(() => setOpenPopup(true), 500);
  return () => clearTimeout(t);
}, []);


  return (
    <div>
      <QuickDuaPopup open={openPopup} onClose={() => setOpenPopup(false)} />

      <Header />

      <div onClick={() => navigate("/prayer-times")} className="cursor-pointer">
        <Payer />
      </div>

      <div onClick={() => navigate("/ramdan")} className="cursor-pointer">
        <RamdanCard />
      </div>

      <div className="flex flex-row justify-center items-start gap-4 mt-4">
        <SebhaCard className="w-[340px] max-w-full" />
      </div>

      <div onClick={() => navigate("/werd-page")} className="cursor-pointer">
        <WerdCard />
      </div>

      <div className="flex flex-row justify-center items-center gap-4 mt-4">
        <div className="flex-1 max-w-[320px]">
          <DoaaCard />
        </div>
        <div
          onClick={() => navigate("/azkar-counter")}
          className="flex-1 max-w-[320px] cursor-pointer"
        >
          <AzkarCard />
        </div>
      </div>

      <DeceasedEntryCard />
      <Footer />
    </div>
  );
};

export default Home;
