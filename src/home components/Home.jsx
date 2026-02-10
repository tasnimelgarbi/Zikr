import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header.jsx'
import Payer from './payer.jsx'
import RamdanCard from './RamadanCard.jsx'
import SebhaCard from './SebhaCard.jsx'
import WerdCard from './WerdCard.jsx'
import DoaaCard from './DoaaCard.jsx'
import AzkarCard from './AzkarCard.jsx'
import Footer from '../components/Footer.jsx'
import DeceasedEntryCard from './DeceasedEntryCard.jsx'

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header />

      {/* PrayerTimes */}
      <div onClick={() => navigate('/prayer-times')} className="cursor-pointer">
        <Payer />
      </div>

      {/* رمضان */}
      <div onClick={() => navigate('/ramdan')} className="cursor-pointer">
        <RamdanCard />
      </div>

      <div className="flex flex-row justify-center items-start gap-4 mt-4">
        {/* SebhaCard - ما تعملش navigation */}
        <SebhaCard className="w-[340px] max-w-full" />
      </div>

      {/* ورد */}
      <div onClick={() => navigate('/werd-page')} className="cursor-pointer">
        <WerdCard />
      </div>

      {/* دعاء و حديث اليوم في ديف واحد متوسطين */}
          <div className="flex flex-row justify-center items-center gap-4 mt-4">
        <div className="flex-1 max-w-[320px]">
          <DoaaCard />
        </div>
        <div
          onClick={() => navigate('/azkar-counter')}
          className="flex-1 max-w-[320px] cursor-pointer"
        >
          <AzkarCard />
        </div>
      </div>
      <DeceasedEntryCard />
      <Footer />
      </div>
  )
}

export default Home
