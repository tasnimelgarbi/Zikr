import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./home components/Home.jsx";
import PrayerTimes from "./components/PrayerTimes.jsx";
import AzkarCounter from "./components/AzkarCounter.jsx";
import Ramdan from "./components/Ramadan.jsx";
import WerdPage from "./components/WerdPage.jsx";
import WerdQuran from "./components/WerdQuran.jsx";
import Quran from "./components/Quran.jsx";
import Duaa from "./components/Duaa.jsx";
import DeceasedPage from "./components/deceased/DeceasedPage.jsx";

import SplashGate from "./components/SplashGate.jsx";

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Home /></Page>} />
        <Route path="/prayer-times" element={<Page><PrayerTimes /></Page>} />
        <Route path="/azkar-counter" element={<Page><AzkarCounter /></Page>} />
        <Route path="/ramdan" element={<Page><Ramdan /></Page>} />
        <Route path="/werd-page" element={<Page><WerdPage /></Page>} />
        <Route path="/werd-quran" element={<Page><WerdQuran /></Page>} />
        <Route path="/quran/:id" element={<Page><Quran /></Page>} />
        <Route path="/duas" element={<Page><Duaa /></Page>} />
        <Route path="/deceased" element={<Page><DeceasedPage /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <SplashGate>
        <AnimatedRoutes />
      </SplashGate>
    </Router>
  );
}

export default App;