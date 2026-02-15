import { useState, useEffect } from "react";
import BackButton from "./BackButton.jsx";
import Footer from "./Footer.jsx";

/* ================= AZKAR DATA ================= */
const AZKAR = {
  morning: {
    title: "أذكار الصباح",
    items: [
      { text: "أصبحنا و أصبح الملك لله، و الحمد لله، لا إله إلا الله وحده لا شريك له، له الملك و له الحمد وهو على كل شئ قدير", max: 3 },
      { text: " رب أسألك خير ما في هذا اليوم  و خير ما بعده، و أعوذ بك من شر ما في هذا اليوم و شر ما بعده، رب أعوذ بك من الكسل، و سوء الكبر، رب أعوذ بك من عذاب في النار و عذاب القبر", max: 3 },
      { text: "اللهم بك أصبحنا، و بك أمسينا، و بك نحيا، و بك نموت، و اليك النشور", max: 3 },
      { text: " اللهم أنت ربي لا إله إلا أنت، خلقتني و أنا عبدك، و أنا على عهدك و وعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، و أبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت ", max: 3 },
      { text: " اللهم إني أصبحت أشهد ك  و أشهد حملة عرشك، و ملائكتك  و جميع خلقك، أنك أنت الله لا إله إلا أنت وحدك لا شريك لك، و أن محمدا عبدك و رسولك", max: 4 },
      { text: "اللهم ما أصبح بي من نعمة أو بأحد من خلقك فمنك  وحدك لا شريك لك، فلك الحمد ولك الشكر", max: 3 },
      { text: "اللهم عافني في بدني، اللهم عافني في سمعي، و اللهم عافني في بصري، لا إله إلا أنت . اللهم إني أعوذ بك من الكفر، و الفقر، و أعوذ بك من عذاب القبر، لا إله إلا أنت", max: 3 },
      { text: "حسبي الله لا إله إلا هو عليه توكلت و هو رب العرش العظيم", max: 7 },
      { text: " اللهم إني أسألك العفو و العافية في الدنيا و الأخره، اللهم  إني أسألك العفو و العافية، في ديني و دنياي و أهلي، و مالي، اللهم استر عوراتي، و آمن روعاتي، اللهم احفظني من بين يدي، و من خلفي، و عن يميني، و عن شمالي،  و من فوقي، و أعوذ بعظمتك إن أغتال من تحتي", max: 3 },
      { text: "اللهم عالم الغيب و الشهادة فاطر السموات و الأرض، رب كل شئ و مليكه، أشهد أن لا إله إلا أنت، أعوذ بك من شر نفسي، و من شر الشيطان و شركه، و أن أقترف على نفسي سوءا، أو أجره إلى مسلم", max: 3 },
      { text: " بسم الله الذي لا يضر مع اسمه شئ في الأرض و لا في السماء وهو السميع العليم", max: 3 },
      { text: "رضيت بالله ربا، و بالإسلام دينا، و بمحمد صلى الله عليه و سلم نبيا", max: 3 },
      { text: "يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله و لا تكلني إلى نفسي طرفة عين", max: 3 },
      { text: "أصبحنا و أصبح الملك لله رب العالمين، اللهم إني أسألك خير هذا اليوم : فتحه، و نصره و نوره و بركته و هداه، و أعوذ بك من شر ما فيه و شره ما بعده", max: 3 },
      { text: "أصبحنا على فطرة الإسلام وعلى كلمة الإخلاص، و على دين نبينا محمد صلى الله عليه وسلم، و على ملة أبينا إبراهيم، حنيفا مسلما وما كان من المشركين", max: 3 },
      { text: "سُبْحَانَ اللَّهِ", max: 100 },
      { text: "لا إله إلا الله وحده لا شريك له، له الملك و له الحمد، و هو على كل شئ قدير ", max: 10 },
      { text: "سبحان الله و بحمده : عدد خلقه، و رضا نفسه، و زنة عرشه، و مداد كلماته", max: 3 },
    ],
  },

  evening: {
    title: "أذكار المساء",
    items: [
      { text: "اللهم إني أسألك خير هذا المساء وخير ما بعده، و أعوذ بك من شر هذا المساء وشر ما بعده، اللهم إني أسألك خير هذا المساء وخير ما بعده، و أعوذ بك من شر هذا المساء وشر ما بعده", max: 3 },
      { text: "أعوذ بكلمات الله التّامات التي لا يجاوزهنّ برّ ولا فاجر، من شرِّ ما خلق، وذرأ وبرأ، ومن شرِّ ما ينزل من السماء، ومن شرِّ ما يعرُج فيها، ومن شرِّ ما ذَرأ في الأرض، ومن شرِّ ما يخرج منها، ومن شرِّ فتن الليل والنهار، ومن شرِّ كلِّ طارقٍ إلا طارقاً يطرق بخيرٍ يا رحمن", max: 3 },
      { text: "بسم الله الذي لا يضرُّ مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم", max: 7 },
      { text: "سبحان الله", max: 33 },
      { text: "الحمد لله", max: 33 },
      { text: "الله أكبر", max: 34 },
      { text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.", max: 3 },
    ],
  },

  sleep: {
    title: "أذكار النوم",
    items: [
      { text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِن أَمْسَكْتَ نَفْسِي فارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا، بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ", max: 3 },
      { text: "للَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْياهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا. اللَّهُمَّ إِنِّي أَسْأَلُكَ العَافِيَةَ", max: 3 },
      { text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", max: 3 },
      { text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", max: 3 },
      { text: "سبحان الله", max: 33 },
      { text: "الحمد لله", max: 33 },
      { text: "الله أكبر", max: 34 },
      { text: "اللَّهُمَّ رَبَّ السَّمَوَاتِ السَّبْعِ وَرَبَّ الأَرْضِ، وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ، وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ. اللَّهُمَّ أَنْتَ الأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الآخِرُ فَلَيسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ", max: 1 },
      { text: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا، وَآوَانَا، فَكَمْ مِمَّنْ لاَ كَافِيَ لَهُ وَلاَ مُؤْوِيَ", max: 3 },
      { text: "اللَّهُمَّ عَالِمَ الغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ", max: 3 },
      { text: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لاَ مَلْجَأَ وَلاَ مَنْجَا مِنْكَ إِلاَّ إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ", max: 3 },
    ],
  },
};

/* ================= COMPONENT ================= */
export default function AzkarApp() {
  const tasbihImg = "https://i.ibb.co/9km9cKj2/sebha.png";
  const bg = "https://i.ibb.co/7dbPtvSd/bg-azkar.jpg";
  
  const [type, setType] = useState("morning");
  const [zekrIndex, setZekrIndex] = useState(0);
  const [count, setCount] = useState(0);

  const currentList = AZKAR[type].items;
  const currentZekr = currentList[zekrIndex];
  const progress = count / currentZekr.max;

  useEffect(() => {
    setZekrIndex(0);
    setCount(0);
  }, [type]);

  const handleClick = () => {
    if (count < currentZekr.max) {
      setCount(count + 1);
    } else if (zekrIndex < currentList.length - 1) {
      setZekrIndex(zekrIndex + 1);
      setCount(0);
    }
  };

  /* ======== CIRCLE SETTINGS ======== */
  const radius = 150;
  const strokeWidth = 14;
  const size = radius * 2 + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <>
    <div dir="rtl" className="min-h-screen w-full flex flex-col items-center gap-6">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Header */}
     <div className="w-full bg-[#8dcba1c2] h-[100px] rounded-b-4xl relative flex items-center justify-center">
        {/* Back button */}
        <div className="absolute right-4 top-4 z-20">
          <BackButton />
        </div>

        <h1 className="text-3xl font-extrabold text-black">أذكار وتسبيح</h1>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-4 mt-2 whitespace-nowrap">
        <Tab text="أذكار النوم" active={type === "sleep"} onClick={() => setType("sleep")} />
        <Tab text="أذكار المساء" active={type === "evening"} onClick={() => setType("evening")} />
        <Tab text="أذكار الصباح" active={type === "morning"} onClick={() => setType("morning")} />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md px-3">
        <div
          className="relative rounded-[32px] shadow-lg p-6"
          style={{
            backgroundImage: `url(${panelBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Counter Circle */}
          <div className="relative mx-auto mb-8 mt-14" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e0d5c0"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#9fc7b2"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-300"
              />
            </svg>

            {/* Text inside */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <div className="text-6xl font-bold text-gray-800">{count}</div>
              <div className="text-gray-400 text-lg mb-2">/{currentZekr.max}</div>
            <div
                className="font-semibold leading-relaxed text-gray-800 text-center overflow-hidden break-words"
                style={{
                  maxWidth: "220px",
                  fontSize: currentZekr.text.length < 50 ? "1.8rem" : "clamp(12px, 2.5vw, 16px)"
                }}
              >
                {currentZekr.text}
              </div>
            </div>
          </div>

          {/* Tasbih Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleClick}
              className="w-22 h-22 rounded-full shadow-lg active:scale-95 transition bg-[#D4B96E] shadow-2xl"
            >
              <img src={tasbihImg} alt="سبحة" className="rounded-full w-full h-full object-contain" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex justify-between mb-2">
              <span className="font-bold">{Math.floor(progress * 100)}%</span>
              <span className="text-sm text-gray-600">مستوى التقدم</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4B96E] to-[#9fc7b2]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>   
    <Footer />
    </>
  );
}

/* ================= TAB ================= */
function Tab({ text, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full font-bold transition ${
        active ? "bg-[#D4B96E] text-gray-800 shadow" : "bg-white text-gray-700"
      }`}
    >
      {text}
    </button>
  );
}
