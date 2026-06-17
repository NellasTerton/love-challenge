import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart, Calendar, Gift, Lock, Check, X, Sparkles, RefreshCw, Trophy, Coffee, Zap,
  CheckCircle2, Volume2, VolumeX, Smile, MessageCircle, Settings, Flame, Star,
  Compass, ChevronRight, Sparkle, Hourglass, HelpCircle, TrendingUp, Award
} from "lucide-react";

import { QuestCard } from "./types";
import {
  svenMainTasks, svenJokerTasks, tamillaMainTasks, tamillaJokerTasks,
  historicalTasks, storeItems
} from "./data";

let myConfettiInstance: any = null;

const getConfetti = () => {
  if (typeof window === "undefined") return () => {};
  if (!myConfettiInstance) {
    let canvasElement = document.getElementById("confetti-canvas") as HTMLCanvasElement;
    if (!canvasElement) {
      canvasElement = document.createElement("canvas");
      canvasElement.id = "confetti-canvas";
      canvasElement.style.position = "fixed";
      canvasElement.style.top = "0";
      canvasElement.style.left = "0";
      canvasElement.style.width = "100%";
      canvasElement.style.height = "100%";
      canvasElement.style.pointerEvents = "none";
      canvasElement.style.zIndex = "999999";
      document.body.appendChild(canvasElement);
    }
    myConfettiInstance = confetti.create(canvasElement, {
      resize: true,
      useWorker: false
    });
  }
  return myConfettiInstance;
};

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // ПРОСТО БЕРЕМ ДЕНЬ ИЗ ССЫЛКИ ОТ БОТА (ПО УМОЛЧАНИЮ 1)
  const [currentDay, setCurrentDay] = useState<number>(parseInt(urlParams.get("day") || "1"));

  const initialUser = (urlParams.get("user") as "Sven" | "Tamilla") || "Sven";
  const initialSScore = parseInt(urlParams.get("ss") || "0");
  const initialTScore = parseInt(urlParams.get("ts") || "0");
  
  const [currentUser, setCurrentUser] = useState<"Sven" | "Tamilla">(initialUser);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"task" | "calendar" | "store">("task");

  const [svenJokerCount, setSvenJokerCount] = useState<number>(3);
  const [tamillaJokerCount, setTamillaJokerCount] = useState<number>(3);

  const [svenScore, setSvenScore] = useState<number>(initialSScore);
  const [tamillaScore, setTamillaScore] = useState<number>(initialTScore);

  const [svenOrder] = useState<number[]>(() => {
    const saved = localStorage.getItem("svenOrder");
    if (saved) return JSON.parse(saved);
    const arr = Array.from({length: 30}, (_, i) => i).sort(() => Math.random() - 0.5);
    localStorage.setItem("svenOrder", JSON.stringify(arr));
    return arr;
  });

  const [tamillaOrder] = useState<number[]>(() => {
    const saved = localStorage.getItem("tamillaOrder");
    if (saved) return JSON.parse(saved);
    const arr = Array.from({length: 30}, (_, i) => i).sort(() => Math.random() - 0.5);
    localStorage.setItem("tamillaOrder", JSON.stringify(arr));
    return arr;
  });

  const [svenTodayCard, setSvenTodayCard] = useState<QuestCard | null>(null);
  const [tamillaTodayCard, setTamillaTodayCard] = useState<QuestCard | null>(null);

  // Сохраняем веер заданий в локальную память телефона
  const [svenActiveHand, setSvenActiveHand] = useState<QuestCard[]>(() => {
    const saved = localStorage.getItem("svenActiveHand");
    return saved ? JSON.parse(saved) : [];
  });
  const [tamillaActiveHand, setTamillaActiveHand] = useState<QuestCard[]>(() => {
    const saved = localStorage.getItem("tamillaActiveHand");
    return saved ? JSON.parse(saved) : [];
  });

  const [svenCompletedDays, setSvenCompletedDays] = useState<number[]>([]);
  const [tamillaCompletedDays, setTamillaCompletedDays] = useState<number[]>([]);

  // Сохраняем "отказы" в локальную память телефона
  const [svenFailedDays, setSvenFailedDays] = useState<number[]>(() => {
    const saved = localStorage.getItem("svenFailedDays");
    return saved ? JSON.parse(saved) : [];
  });
  const [tamillaFailedDays, setTamillaFailedDays] = useState<number[]>(() => {
    const saved = localStorage.getItem("tamillaFailedDays");
    return saved ? JSON.parse(saved) : [];
  });

  // Хуки для авто-обновления памяти телефона при любых изменениях в веере
  useEffect(() => { localStorage.setItem("svenActiveHand", JSON.stringify(svenActiveHand)); }, [svenActiveHand]);
  useEffect(() => { localStorage.setItem("tamillaActiveHand", JSON.stringify(tamillaActiveHand)); }, [tamillaActiveHand]);
  useEffect(() => { localStorage.setItem("svenFailedDays", JSON.stringify(svenFailedDays)); }, [svenFailedDays]);
  useEffect(() => { localStorage.setItem("tamillaFailedDays", JSON.stringify(tamillaFailedDays)); }, [tamillaFailedDays]);

  const [purchasedItemIds, setPurchasedItemIds] = useState<{ [key: number]: number }>({});
  const [purchasedItemSuccess, setPurchasedItemSuccess] = useState<any | null>(null);

  const [selectedActiveCardId, setSelectedActiveCardId] = useState<number | null>(null);

  const [declineModal, setDeclineModal] = useState<{ isOpen: boolean; day: number; isTodayCard: boolean; } | null>(null);
  const [completeConfirmModalCard, setCompleteConfirmModalCard] = useState<QuestCard | null>(null);
  const [jokerReplaceModalOpen, setJokerReplaceModalOpen] = useState<boolean>(false);
  const [flyingCard, setFlyingCard] = useState<{ day: number; title: string; points: number; } | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [calendarTarget, setCalendarTarget] = useState<"me" | "partner">("me");

  const partnerName = currentUser === "Sven" ? "Tamilla" : "Sven";
  const currentUserScore = currentUser === "Sven" ? svenScore : tamillaScore;
  const setCurrentUserScore = currentUser === "Sven" ? setSvenScore : setTamillaScore;

  const currentTodayCard = currentUser === "Sven" ? svenTodayCard : tamillaTodayCard;
  const setCurrentTodayCard = currentUser === "Sven" ? setSvenTodayCard : setTamillaTodayCard;

  const currentActiveHand = currentUser === "Sven" ? svenActiveHand : tamillaActiveHand;
  const setCurrentActiveHand = currentUser === "Sven" ? setSvenActiveHand : setTamillaActiveHand;

  const currentJokerCount = currentUser === "Sven" ? svenJokerCount : tamillaJokerCount;
  const setCurrentJokerCount = currentUser === "Sven" ? setSvenJokerCount : setTamillaJokerCount;

  // Очищаем руку, если задание уже подтвердил партнер (через ссылку)
  useEffect(() => {
    const sDoneStr = urlParams.get("sd");
    const tDoneStr = urlParams.get("td");
    const sDone = sDoneStr ? sDoneStr.split(",").filter(x => x && x !== "None" && x !== "null" && x !== "undefined").map(Number).filter(n => !isNaN(n) && n > 0) : [];
    const tDone = tDoneStr ? tDoneStr.split(",").filter(x => x && x !== "None" && x !== "null" && x !== "undefined").map(Number).filter(n => !isNaN(n) && n > 0) : [];
    
    setSvenCompletedDays(sDone);
    setTamillaCompletedDays(tDone);
    
    setSvenActiveHand(prev => prev.filter(q => !sDone.includes(q.day)));
    setTamillaActiveHand(prev => prev.filter(q => !tDone.includes(q.day)));
  }, []);

  useEffect(() => {
    const sInHand = svenActiveHand.some(q => q.day === currentDay);
    const sDone = svenCompletedDays.includes(currentDay) || svenFailedDays.includes(currentDay);
    if (!sInHand && !sDone && currentDay <= 30) {
      const taskIndex = svenOrder[currentDay - 1];
      const pts = taskIndex < 10 ? 1 : taskIndex < 20 ? 2 : 3;
      setSvenTodayCard({ day: currentDay, title: svenMainTasks[taskIndex] || "No task available", points: pts, status: "active" });
    } else {
      setSvenTodayCard(null);
    }

    const tInHand = tamillaActiveHand.some(q => q.day === currentDay);
    const tDone = tamillaCompletedDays.includes(currentDay) || tamillaFailedDays.includes(currentDay);
    if (!tInHand && !tDone && currentDay <= 30) {
      const taskIndex = tamillaOrder[currentDay - 1];
      const pts = taskIndex < 10 ? 1 : taskIndex < 20 ? 2 : 3;
      setTamillaTodayCard({ day: currentDay, title: tamillaMainTasks[taskIndex] || "No task available", points: pts, status: "active" });
    } else {
      setTamillaTodayCard(null);
    }
  }, [currentDay, svenCompletedDays, tamillaCompletedDays, svenFailedDays, tamillaFailedDays, svenOrder, tamillaOrder]);

  const triggerConfettiExplosion = () => {
    const count = 220;
    const defaults = { origin: { y: 0.75 }, spread: 90, ticks: 160 };
    const localConfetti = getConfetti();
    function fire(particleRatio: number, opts: any) { try { localConfetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) }); } catch (err) {} }
    fire(0.25, { spread: 30, startVelocity: 60, colors: ["#f43f5e", "#fda4af", "#ff0d72"] });
    fire(0.2, { spread: 70, colors: ["#ec4899", "#f472b6", "#eab308"] });
    fire(0.35, { spread: 110, decay: 0.92, scalar: 0.95, colors: ["#f43f5e", "#ffffff", "#fda4af"] });
    fire(0.1, { spread: 130, startVelocity: 28, decay: 0.93, scalar: 1.3, colors: ["#ec4899", "#fda4af"] });
    fire(0.1, { spread: 130, startVelocity: 48, colors: ["#f43f5e", "#eab308"] });
  };

  const acceptTodayTask = () => {
    if (!currentTodayCard) return;
    const cardData = { day: currentTodayCard.day, title: currentTodayCard.title, points: currentTodayCard.points };
    setFlyingCard(cardData);
    if (currentUser === "Sven") setSvenTodayCard(null); else setTamillaTodayCard(null);
    setTimeout(() => {
      const updatedCard: QuestCard = { ...cardData, status: "active" };
      if (currentUser === "Sven") setSvenActiveHand(prev => [...prev, updatedCard]); else setTamillaActiveHand(prev => [...prev, updatedCard]);
      setFlyingCard(null);
    }, 600);
  };

  const initiateDeclineToday = () => {
    if (!currentTodayCard) return;
    setDeclineModal({ isOpen: true, day: currentTodayCard.day, isTodayCard: true });
  };

  const initiateJokerToday = () => {
    if (currentJokerCount <= 0) return;
    setJokerReplaceModalOpen(true);
  };

  const applyJokerToday = () => {
    if (currentJokerCount <= 0 || !currentTodayCard) return;
    let jokerPool = currentUser === "Sven" ? svenJokerTasks : tamillaJokerTasks;
    const randomIndex = Math.floor(Math.random() * jokerPool.length);
    const selectedJokerTask = jokerPool[randomIndex];
    const updatedToday: QuestCard = { ...currentTodayCard, title: `${selectedJokerTask} 🪄`, points: 1, isJoker: true };
    if (currentUser === "Sven") { setSvenJokerCount(prev => prev - 1); setSvenTodayCard(updatedToday); } 
    else { setTamillaJokerCount(prev => prev - 1); setTamillaTodayCard(updatedToday); }
    setJokerReplaceModalOpen(false);
    triggerConfettiExplosion();
  };

  // ФОНОВАЯ ОТПРАВКА ЗАПРОСА В ТЕЛЕГРАМ АПИ БЕЗ ЗАКРЫТИЯ ПРИЛОЖЕНИЯ
  const completeActiveCard = async (card: QuestCard) => {
    const BOT_TOKEN = "8818196922:AAE82tjqjVU4CV0coydo_cjboDOwVOVCU-s";
    const partnerId = currentUser === "Sven" ? urlParams.get("t_id") : urlParams.get("s_id");

    if (partnerId && partnerId !== "None" && partnerId !== "null") {
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: partnerId,
            text: `🔔 CONFIRMATION REQUIRED!\n\n${currentUser} claims to have completed the task for Day ${card.day} (worth ${card.points} points).\nDid they really do it?`,
            reply_markup: {
              inline_keyboard: [
                [{ text: "✅ Yes, confirmed!", callback_data: `verify_${currentUser}_${card.day}_${card.points}` }],
                [{ text: "❌ No, cheating!", callback_data: "verify_reject" }]
              ]
            }
          })
        });
        alert("Request sent to your partner! Waiting for their confirmation.");
      } catch (err) {
        alert("Request sent (Network fallback).");
      }
    } else {
      alert("Test mode: Partner is not registered in the bot yet!");
    }

    setCompleteConfirmModalCard(null);
    setSelectedActiveCardId(null);
  };

  const handleBuyItem = (item: any) => {
    if (currentDay < 30 || currentUserScore < item.cost) return;
    if (currentUser === "Sven") setSvenScore(prev => Math.max(0, prev - item.cost));
    else setTamillaScore(prev => Math.max(0, prev - item.cost));
    setPurchasedItemIds(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
    setPurchasedItemSuccess(item);
    triggerConfettiExplosion();
  };

  const initiateDeclineActiveHand = (card: QuestCard) => {
    setDeclineModal({ isOpen: true, day: card.day, isTodayCard: false });
  };

  const confirmDecline = () => {
    if (!declineModal) return;
    const targetDay = declineModal.day;
    if (declineModal.isTodayCard) {
      setCurrentTodayCard(null);
      if (currentUser === "Sven") setSvenFailedDays(prev => [...prev, targetDay]); else setTamillaFailedDays(prev => [...prev, targetDay]);
    } else {
      setCurrentActiveHand(prev => prev.filter(q => q.day !== targetDay));
      if (currentUser === "Sven") setSvenFailedDays(prev => [...prev, targetDay]); else setTamillaFailedDays(prev => [...prev, targetDay]);
    }
    setSelectedActiveCardId(null);
    setDeclineModal(null);
  };

  const getDayStatus = (day: number, isPartnerTab: boolean) => {
    if (day > currentDay) return "locked-future";
    if (isPartnerTab) {
      if (day === currentDay) return "locked-partner-today";
      const partnerCompleted = currentUser === "Sven" ? tamillaCompletedDays : svenCompletedDays;
      const partnerFailed = currentUser === "Sven" ? tamillaFailedDays : svenFailedDays;
      const partnerHand = currentUser === "Sven" ? tamillaActiveHand : svenActiveHand;
      if (partnerCompleted.includes(day)) return "confirmed";
      if (partnerFailed.includes(day)) return "missed";
      if (partnerHand.some(q => q.day === day)) return "partner-in-progress";
      return "locked-future";
    } else {
      const myCompleted = currentUser === "Sven" ? svenCompletedDays : tamillaCompletedDays;
      const myFailed = currentUser === "Sven" ? svenFailedDays : tamillaFailedDays;
      const myHand = currentUser === "Sven" ? svenActiveHand : tamillaActiveHand;
      if (myCompleted.includes(day)) return "confirmed";
      if (myFailed.includes(day)) return "missed";
      if (myHand.some(q => q.day === day)) return "active-hand-quest";
      if (day === currentDay && currentTodayCard) return "pending-today-quest";
      return "locked-future";
    }
  };

  const handleDayClick = (day: number, status: string) => {
    if (day > currentDay || status.includes("locked")) return;
    setSelectedDay(day);
  };

  return (
    <div id="love-roots" className="h-screen max-h-screen overflow-hidden bg-slate-900 text-slate-100 flex flex-col justify-center items-center font-sans selection:bg-rose-500 selection:text-white pb-0">
      <div id="mobile-wrap" className="w-full max-w-md bg-gradient-to-b from-rose-50 via-pink-50 to-rose-100 flex flex-col relative h-full md:h-[calc(100vh-48px)] md:max-h-[850px] md:my-auto md:rounded-3xl md:shadow-2xl overflow-hidden md:border md:border-rose-200/40 pb-0 pt-4">
        <div className="absolute top-20 left-6 text-pink-300 opacity-25 text-3xl pointer-events-none animate-float-gentle">💖</div>
        <div className="absolute bottom-40 right-6 text-pink-300 opacity-25 text-4xl pointer-events-none animate-float-gentle" style={{ animationDelay: "3s" }}>🌸</div>
        <main id="app-viewport" className="flex-1 overflow-y-auto px-4 pb-6 pt-2 z-10 scrollbar-none flex flex-col justify-between">
          {activeTab === "task" && (
            <div id="tab-tasks-deck" className="flex-1 flex flex-col gap-4 animate-fadeIn relative min-h-[500px]">
              <div className="w-full flex items-center justify-between bg-white/80 backdrop-blur-md py-3 px-4.5 rounded-[1.8rem] border border-white/90 shadow-md z-10 shrink-0 select-none">
                <span className="text-sm font-extrabold bg-white border border-rose-200/80 py-1.5 px-4 rounded-full flex items-center gap-2.5 shadow-2xs text-rose-800">
                  <button onClick={() => setCurrentDay(prev => Math.max(1, prev - 1))} className="text-rose-500 hover:text-rose-750 font-black cursor-pointer px-1.5 text-base active:scale-90 transition-transform select-none" title="Previous Day">◀</button>
                  <span className="font-extrabold text-[12.5px] sm:text-[14px]">Day {currentDay} of 30</span>
                  <button onClick={() => setCurrentDay(prev => Math.min(30, prev + 1))} className="text-rose-500 hover:text-rose-750 font-black cursor-pointer px-1.5 text-base active:scale-90 transition-transform select-none" title="Next Day">▶</button>
                </span>
                <div className="text-sm font-black text-rose-900 bg-rose-100/90 border border-rose-200/30 py-2 px-5 rounded-full flex items-center gap-1.5 select-none shadow-2xs transition-all">
                  <Smile size={15} className="text-rose-500 animate-pulse" />
                  <span className="font-extrabold text-rose-700 text-[12.5px] sm:text-[14px]">{currentUser}</span>
                </div>
              </div>

              <div className={`flex-1 flex flex-col justify-between gap-4 transition-all duration-350 relative ${currentTodayCard ? "pointer-events-none filter blur-[5px] select-none opacity-30 scale-[0.97]" : "opacity-100 scale-100"}`}>
                <div id="tasks-zone-2" className="w-full flex-1 flex flex-col gap-2 relative min-h-[390px]">
                  <div className="flex items-center justify-between pl-1">
                    <h3 className="text-[13px] sm:text-[14px] font-black uppercase text-rose-900/90 tracking-wider">My Active Quests ({currentActiveHand.length})</h3>
                  </div>
                  {currentActiveHand.length > 0 ? (
                    <div className="flex-1 w-full flex flex-col justify-end pb-8 relative mt-1 overflow-hidden rounded-2xl">
                      <AnimatePresence>
                        {selectedActiveCardId !== null && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }} onClick={() => setSelectedActiveCardId(null)} className="absolute inset-0 bg-slate-950 z-20 cursor-pointer rounded-2xl" />
                        )}
                      </AnimatePresence>
                      <div className="relative w-full h-[330px] flex items-center justify-center select-none pt-4">
                        {currentActiveHand.map((card, index) => {
                          const mid = (currentActiveHand.length - 1) / 2;
                          const rotateAngle = (index - mid) * 7;
                          const xOffset = (index - mid) * 48;
                          const yOffset = Math.abs(index - mid) * 4;
                          const isSelected = selectedActiveCardId === card.day;
                          return (
                            <motion.div key={`active-hand-card-${card.day}`} layout animate={isSelected ? { y: -30, scale: 1.12, rotate: 0, x: 0, zIndex: 40 } : { y: yOffset, scale: 1, rotate: rotateAngle, x: xOffset, zIndex: 10 + index }} onClick={() => setSelectedActiveCardId(card.day)} whileHover={!isSelected ? { y: yOffset - 25, scale: 1.05, zIndex: 50, transition: { duration: 0.15 } } : {}} className={`absolute w-52 h-72 rounded-[1.8rem] p-5 shadow-lg flex flex-col justify-between cursor-pointer border-2 transition-all select-none ${isSelected ? "bg-white text-slate-800 border-rose-400 ring-2 ring-rose-200" : "bg-gradient-to-br from-white to-rose-50/80 text-slate-705 border-rose-100"}`}>
                              <div className="flex items-center justify-between"><span className="text-[11px] font-sans font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">Day {card.day}</span></div>
                              <p className="text-[13px] sm:text-[14px] font-black text-rose-950 leading-snug text-left line-clamp-6 flex-1 mt-2.5">{card.title}</p>
                              <div className="flex items-center justify-between text-xs font-black text-rose-600 mt-1.5"><span className="flex items-center gap-1 bg-rose-50 border border-rose-100/50 py-1 px-2.5 rounded-full text-[11px]">💖 {card.points} {card.points === 1 ? "point" : "points"}</span>{isSelected && <span className="text-rose-500 font-extrabold animate-bounce text-sm">★</span>}</div>
                            </motion.div>
                          );
                        })}
                      </div>
                      <div className="h-20 w-full relative z-30 px-3 mt-4 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {selectedActiveCardId !== null ? (
                            <motion.div key="focus-panel" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="bg-white/95 backdrop-blur-md border border-rose-200/60 p-2.5 px-5 rounded-2xl shadow-md flex items-center justify-center gap-3.5 text-slate-850 mx-auto">
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={() => { const quest = currentActiveHand.find(q => q.day === selectedActiveCardId); if (quest) setCompleteConfirmModalCard(quest); }} className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-[10.5px] px-3.5 py-2.5 rounded-xl shadow-sm border border-emerald-400/20 inline-flex items-center gap-1 cursor-pointer transition-colors"><Award size={12} className="stroke-[2.5]" /><span>Done!</span></button>
                                <button onClick={() => { const quest = currentActiveHand.find(q => q.day === selectedActiveCardId); if (quest) initiateDeclineActiveHand(quest); }} className="bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 font-extrabold text-[10.5px] px-3 py-2.5 rounded-xl border border-rose-200 cursor-pointer transition-colors">Decline</button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div key="no-focus-place" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} className="text-center text-[11px] text-rose-900/60 font-bold max-w-[280px]">💡 Keep quests in your hand and complete them on any convenient day!</motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 w-full bg-white/50 backdrop-blur-xs border border-white/80 rounded-2xl flex flex-col justify-center items-center p-6 text-center gap-2 py-10 shadow-3xs">
                      <div className="w-12 h-12 rounded-full bg-rose-50 text-xl flex items-center justify-center border border-rose-100/50">🎴</div>
                      <span className="text-xs font-bold text-rose-900/70">Your quest hand is empty</span>
                    </div>
                  )}
                </div>
                <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-sm flex flex-col gap-2 items-center justify-center text-center mt-auto">
                  <div className="flex items-baseline gap-1"><span className="text-3xl font-sans font-black text-rose-900 tracking-tight">{currentUserScore}</span><span className="text-xs font-black text-rose-950">/ 60 points</span></div>
                  <div className="w-full h-3.5 bg-rose-100/70 rounded-full overflow-hidden relative border border-rose-200/40 p-0.5">
                    <div className="h-full bg-gradient-to-r from-pink-400 via-rose-500 to-rose-600 rounded-full transition-all duration-1000 flex items-center justify-end pr-1.5 relative" style={{ width: `${Math.min(100, (currentUserScore / 60) * 100)}%` }}>{currentUserScore > 2 && <span className="text-[8px] text-white font-extrabold">❤️</span>}</div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {currentTodayCard && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 top-[48px] bottom-0 z-40 flex flex-col justify-center items-center px-3">
                    <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-md rounded-2xl" />
                    <div className="w-full max-w-[320px] z-50 relative px-2 flex flex-col gap-4">
                      <div className="text-center"><span className="inline-flex items-center gap-1 bg-rose-600 border border-rose-450 text-white font-black text-[9.5px] uppercase tracking-wider py-1 px-3.5 rounded-full shadow-lg animate-pulse">✨ DECISION REQUIRED • DAILY CARD ✨</span></div>
                      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: -50, rotate: -5 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="w-full bg-white rounded-[2rem] p-6 shadow-2xl border-4 border-rose-200/80 relative overflow-hidden text-slate-850 flex flex-col justify-between min-h-[380px] sm:min-h-[420px]">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-rose-100/40 via-transparent to-transparent pointer-events-none rounded-none" />
                        <div className="flex items-center justify-between w-full">
                          <span className="bg-rose-500 text-white font-sans font-black text-[10px] px-3.5 py-1 rounded-full inline-flex items-center gap-1 shadow-xs uppercase font-extrabold tracking-wider">📅 Day {currentTodayCard.day}</span>
                          <span className="text-[10px] font-extrabold text-rose-700/80 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md">Reward: {currentTodayCard.points} {currentTodayCard.points === 1 ? "point" : "points"}</span>
                        </div>
                        <div className="my-6 text-center flex-1 flex items-center justify-center">
                          <p className="text-[16px] sm:text-[18px] font-black leading-relaxed text-slate-900 px-1 py-1">{currentTodayCard.title}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 pt-4 border-t border-rose-50/50">
                          <button onClick={acceptTodayTask} className="col-span-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-[10.5px] py-2 rounded-xl border border-emerald-400/20 flex flex-col items-center justify-center gap-1 shadow-sm transition-transform cursor-pointer"><Check size={14} className="stroke-[3]" /><span>Accept</span></button>
                          <button onClick={initiateJokerToday} disabled={currentJokerCount <= 0} className={`col-span-1 rounded-xl text-[10.5px] py-2 flex flex-col items-center justify-center gap-1 shadow-sm font-extrabold transition-all ${currentJokerCount > 0 ? "bg-amber-500 hover:bg-amber-600 active:scale-95 text-white cursor-pointer" : "bg-amber-50/20 text-amber-300 border border-amber-100/50 cursor-not-allowed"}`}><RefreshCw size={14} className="stroke-[2.5]" /><span>Swap ({currentJokerCount})</span></button>
                          <button onClick={initiateDeclineToday} className="col-span-1 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 font-extrabold text-[10.5px] py-2 rounded-xl border border-rose-200 flex flex-col items-center justify-center gap-1 transition-transform cursor-pointer"><X size={14} className="stroke-[2.5]" /><span>Pass</span></button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {flyingCard && (
                  <motion.div initial={{ position: "absolute", top: "45%", left: "50%", translateX: "-50%", translateY: "-50%", scale: 1, rotate: 0, opacity: 1, zIndex: 100 }} animate={{ top: "68%", left: "50%", translateX: "-50%", translateY: "-50%", scale: 0.42, rotate: 12, opacity: [1, 1, 0.9, 0] }} transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }} className="w-72 h-[190px] bg-white border-2 border-pink-300 rounded-3xl p-5 shadow-2xl flex flex-col justify-between text-slate-805 pointer-events-none">
                    <div className="flex items-center justify-between w-full">
                      <span className="bg-rose-500 text-white font-mono font-black text-[8.5px] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 uppercase">💖 Adding...</span>
                      <span className="text-[9px] font-mono font-black text-rose-600">{flyingCard.points} {flyingCard.points === 1 ? "point" : "points"}</span>
                    </div>
                    <p className="text-[12px] font-extrabold text-slate-705 leading-normal text-left line-clamp-4 flex-1 mt-3">{flyingCard.title}</p>
                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mt-1 uppercase"><span>Quest added to fan!</span><span className="text-rose-500 font-extrabold animate-pulse">⭐</span></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === "calendar" && (
            <div id="tab-calendar" className="flex-1 flex flex-col gap-3.5 animate-fadeIn">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-xs w-full text-center">
                <h3 className="text-xs font-black text-rose-950 flex items-center justify-center gap-1 tracking-wide uppercase"><Calendar size={13} className="text-rose-500" />Thirty-Day Calendar</h3>
              </div>
              <div id="calendar-tabs" className="w-full p-1 bg-rose-200/40 rounded-2xl flex border border-rose-200/20 backdrop-blur-md shrink-0">
                <button onClick={() => setCalendarTarget("me")} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${calendarTarget === "me" ? "bg-rose-500 text-white shadow-xs" : "text-rose-900 hover:bg-rose-100/30"}`}>My Progress (1-30)</button>
                <button onClick={() => setCalendarTarget("partner")} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${calendarTarget === "partner" ? "bg-rose-500 text-white shadow-xs" : "text-rose-900 hover:bg-rose-100/30"}`}>{partnerName}'s Progress</button>
              </div>
              <div className="w-full flex justify-between px-1 text-[10px] text-slate-600 font-bold uppercase">
                <span>Marathon (Day 1-30)</span>
                {calendarTarget === "partner" ? <span className="text-amber-700 font-extrabold">Future Days Hidden 🤫</span> : <span className="text-rose-700 font-extrabold">You are on Day {currentDay}</span>}
              </div>
              <div id="calendar-grid" className="w-[100%] grid grid-cols-5 gap-2.5 max-h-[550px] pr-0.5">
                {Array.from({ length: 30 }, (_, index) => {
                  const day = index + 1;
                  const status = getDayStatus(day, calendarTarget === "partner");
                  let buttonClass = "bg-white border-white/80 text-slate-705 hover:shadow-xs";
                  let borderClass = "border border-slate-200/60";
                  let badge = null;
                  if (status === "locked-future") { buttonClass = "bg-slate-100/40 text-slate-400 border-slate-200 cursor-not-allowed opacity-50"; badge = <Lock size={9} className="text-slate-400" />; }
                  else if (status === "locked-partner-today") { buttonClass = "bg-amber-50/60 border-amber-200 text-amber-500 cursor-not-allowed opacity-75"; badge = <Lock size={9} className="text-amber-500" />; }
                  else if (status === "confirmed") { buttonClass = "bg-emerald-50 border-emerald-250 text-emerald-800"; badge = <Check size={11} className="stroke-[3] text-emerald-600" />; }
                  else if (status === "missed") { buttonClass = "bg-rose-50 border-rose-200 text-rose-800"; badge = <X size={11} className="stroke-[3] text-rose-500" />; }
                  else if (status === "active-hand-quest" || status === "partner-in-progress") { buttonClass = "bg-purple-50/80 border-purple-250 text-purple-800 ring-1.5 ring-purple-300 ring-offset-0.5"; badge = <Hourglass size={10} className="text-purple-650 animate-pulse" />; }
                  else if (status === "pending-today-quest") { buttonClass = "bg-rose-100/60 border-rose-300 text-rose-750 font-black"; badge = <Sparkles size={10} className="text-rose-550 animate-bounce" />; }

                  return (
                    <button key={day} onClick={() => handleDayClick(day, status)} disabled={status === "locked-future" || status === "locked-partner-today"} className={`h-16 sm:h-20 rounded-2xl flex flex-col justify-center items-center gap-1.5 text-xs font-bold relative transition-all active:scale-95 duration-100 cursor-pointer ${buttonClass} ${borderClass}`}>
                      <span className="text-[9px] opacity-60 block font-bold uppercase tracking-wider">day</span>
                      <span className="text-[15px] sm:text-[18px] font-black leading-none">{day}</span>
                      {badge && <span className="absolute bottom-1.5 right-1.5 scale-110">{badge}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "store" && (
            <div id="tab-store" className="flex-1 flex flex-col justify-between gap-3 animate-fadeIn min-h-0">
              <div className="w-full flex-grow flex flex-col gap-3 min-h-0">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 p-3.5 shadow-xs w-full text-center shrink-0">
                  <h3 className="text-xs font-black text-rose-950 flex items-center justify-center gap-1.5 tracking-wide uppercase"><Gift size={13} className="text-rose-500" />The Reward Shop</h3>
                </div>
                <div id="store-catalogue" className="w-[100%] flex-1 flex flex-col gap-4 overflow-y-auto pr-0.5 min-h-[150px]">
                  {currentDay < 30 && <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white p-3 border border-rose-450 text-center rounded-2xl shadow-xs text-[10.5px] font-extrabold uppercase tracking-widest shrink-0 flex items-center justify-center gap-1.5 leading-normal"><span>🔒 Purchases unlock on Day 30</span></div>}
                  <div className="flex flex-col gap-2.5">
                    <div className="px-1 text-[11px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Rewards</div>
                    {storeItems
                      .filter(item => {
                        if (item.category === "legendary") {
                          if (currentUser === "Sven") return item.id === 33;
                          if (currentUser === "Tamilla") return item.id === 34;
                          return false;
                        }
                        return true;
                      })
                      .map(item => {
                        const canBuy = currentDay >= 30 && currentUserScore >= item.cost;
                        return (
                        <div key={item.id} className="bg-white/95 backdrop-blur-md border border-rose-150 hover:border-pink-300 p-3 rounded-2xl flex flex-col gap-2 transition-all duration-200">
                          <div className="flex items-center justify-between gap-2.5 w-full">
                            <div className="flex items-center gap-2.5 text-left min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-rose-50/80 border border-rose-100/50 text-lg flex items-center justify-center shrink-0">{item.icon}</div>
                              <div className="min-w-0"><h4 className="text-[11.5px] font-extrabold text-rose-950 leading-snug truncate">{item.title}</h4></div>
                            </div>
                            <div className="shrink-0"><span className="text-[10px] font-black text-rose-600 bg-rose-50/80 border border-rose-100/40 py-1 px-2.5 rounded-full font-mono">{item.cost} 💕</span></div>
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-2 border-t border-rose-100/30">
                            <p className="text-[10px] text-slate-500 leading-snug text-left flex-1 font-medium">{item.desc}</p>
                            <button onClick={() => handleBuyItem(item)} disabled={!canBuy} className={`font-black text-[9.5px] uppercase px-2.5 py-1.5 rounded-xl border flex items-center gap-1 shrink-0 transition-all ${canBuy ? "bg-rose-500 hover:bg-rose-600 border-rose-450 text-white hover:scale-103 active:scale-97 shadow-xs cursor-pointer" : "bg-rose-50/35 text-rose-300 border-rose-150 cursor-not-allowed opacity-75"}`}>{canBuy ? <>🛒 Buy</> : <><Lock size={9} /> {item.cost} 💗</>}</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <nav id="app-bottom-nav" className="bg-white/95 backdrop-blur-md border-t border-rose-200/50 px-6 py-4 flex justify-between items-center z-20 shadow-[0_-4px_16px_rgba(251,113,133,0.1)] w-full shrink-0">
          <button onClick={() => setActiveTab("task")} className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${activeTab === "task" ? "text-rose-600 font-black scale-102" : "text-slate-500 hover:text-rose-500 font-semibold"}`}><Sparkles size={19} /><span className="text-[9.5px] uppercase tracking-wider">Quests</span></button>
          <button onClick={() => setActiveTab("calendar")} className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${activeTab === "calendar" ? "text-rose-600 font-black scale-102" : "text-slate-500 hover:text-rose-500 font-semibold"}`}><Calendar size={19} /><span className="text-[9.5px] uppercase tracking-wider">Calendar</span></button>
          <button onClick={() => setActiveTab("store")} className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${activeTab === "store" ? "text-rose-600 font-black scale-102" : "text-slate-500 hover:text-rose-500 font-semibold"}`}><Gift size={19} /><span className="text-[9.5px] uppercase tracking-wider">Shop</span></button>
        </nav>

        {selectedDay !== null && (
          <div id="info-modal-overlay" className="absolute inset-0 bg-slate-950/44 backdrop-blur-xs z-50 flex items-center justify-center p-5 duration-200 animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 border-2 border-pink-100 shadow-2xl w-full max-w-[325px] text-slate-800 flex flex-col items-center gap-4 relative animate-scaleIn">
              <button onClick={() => setSelectedDay(null)} className="absolute top-3.5 right-3.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-1.5 transition-all cursor-pointer"><X size={13} className="stroke-[2.5]" /></button>
              <div className="w-11 h-11 rounded-full bg-rose-50 text-2xl flex items-center justify-center border border-rose-100/50">⭐</div>
              <div className="text-center w-full pb-1">
                <span className="text-[10px] text-rose-650 font-black uppercase tracking-widest block">Love Diary • Day {selectedDay}</span>
              </div>

              <div className="w-full flex flex-col gap-2.5 text-left max-h-[220px] overflow-y-auto">
                {(() => {
                  const svenCompleted = svenCompletedDays.includes(selectedDay);
                  const svenFailed = svenFailedDays.includes(selectedDay);
                  const svenHand = svenActiveHand.find(q => q.day === selectedDay);
                  const isSvenToday = selectedDay === currentDay;
                  let svenStatus: "confirmed" | "missed" | "in-progress" | "pending" | "locked" = "locked";
                  let svenTask = "";

                  if (svenCompleted) { svenStatus = "confirmed"; svenTask = svenMainTasks[svenOrder[selectedDay - 1]] || ""; } 
                  else if (svenFailed) { svenStatus = "missed"; svenTask = svenMainTasks[svenOrder[selectedDay - 1]] || ""; } 
                  else if (svenHand) { svenStatus = "in-progress"; svenTask = svenHand.title; } 
                  else if (isSvenToday && svenTodayCard) { svenStatus = "pending"; svenTask = svenTodayCard.title; } 

                  const tamillaCompleted = tamillaCompletedDays.includes(selectedDay);
                  const tamillaFailed = tamillaFailedDays.includes(selectedDay);
                  const tamillaHand = tamillaActiveHand.find(q => q.day === selectedDay);
                  const isTamillaToday = selectedDay === currentDay;
                  let tamillaStatus: "confirmed" | "missed" | "in-progress" | "pending" | "locked" = "locked";
                  let tamillaTask = "";

                  if (tamillaCompleted) { tamillaStatus = "confirmed"; tamillaTask = tamillaMainTasks[tamillaOrder[selectedDay - 1]] || ""; } 
                  else if (tamillaFailed) { tamillaStatus = "missed"; tamillaTask = tamillaMainTasks[tamillaOrder[selectedDay - 1]] || ""; } 
                  else if (tamillaHand) { tamillaStatus = "in-progress"; tamillaTask = tamillaHand.title; } 
                  else if (isTamillaToday && tamillaTodayCard) { tamillaStatus = "pending"; tamillaTask = tamillaTodayCard.title; } 

                  const isSvenProtected = currentUser === "Tamilla" && svenStatus !== "confirmed" && svenStatus !== "missed";
                  const isTamillaProtected = currentUser === "Sven" && tamillaStatus !== "confirmed" && tamillaStatus !== "missed";

                  if (selectedDay === currentDay && svenStatus === "pending" && tamillaStatus === "pending") {
                    return <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-center text-[11px] font-bold text-rose-800">Active Quest Mode! View today's cards on the "Quests" tab. 🥳</div>;
                  }

                  return (
                    <>
                      {!isSvenProtected ? (
                        svenTask ? (
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                            <div className="flex items-center justify-between text-[10px] font-bold text-rose-900 border-b border-rose-100/40 pb-1 mb-1.5">
                              <span>SVEN</span>
                              <span className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${svenStatus === "confirmed" ? "bg-emerald-100 text-emerald-800" : svenStatus === "in-progress" ? "bg-purple-100 text-purple-800" : svenStatus === "pending" ? "bg-slate-200 text-slate-800" : "bg-rose-100 text-rose-800"}`}>
                                {svenStatus === "confirmed" ? "Completed ✔️" : svenStatus === "in-progress" ? "In Progress ⏳" : svenStatus === "pending" ? "Not Started 💭" : "Missed ❌"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug font-medium">{svenTask}</p>
                          </div>
                        ) : null
                      ) : (<div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl text-center text-[10.5px] font-bold text-rose-800">🔒 Sven's task is hidden until completed! 🤫</div>)}

                      {!isTamillaProtected ? (
                        tamillaTask ? (
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                            <div className="flex items-center justify-between text-[10px] font-bold text-rose-900 border-b border-rose-100/40 pb-1 mb-1.5">
                              <span>TAMILLA</span>
                              <span className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${tamillaStatus === "confirmed" ? "bg-emerald-100 text-emerald-800" : tamillaStatus === "in-progress" ? "bg-purple-100 text-purple-800" : tamillaStatus === "pending" ? "bg-slate-200 text-slate-800" : "bg-rose-100 text-rose-800"}`}>
                                {tamillaStatus === "confirmed" ? "Completed ✔️" : tamillaStatus === "in-progress" ? "In Progress ⏳" : tamillaStatus === "pending" ? "Not Started 💭" : "Missed ❌"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug font-medium">{tamillaTask}</p>
                          </div>
                        ) : null
                      ) : (<div className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl text-center text-[10.5px] font-bold text-rose-800">🔒 Tamilla's task is hidden until completed! 🤫</div>)}
                    </>
                  );
                })()}
              </div>
              <button onClick={() => setSelectedDay(null)} className="w-full bg-rose-500 hover:bg-rose-600 transition-colors text-white text-xs font-black py-2.5 rounded-xl shadow-xs cursor-pointer">Back to Calendar</button>
            </div>
          </div>
        )}

        {completeConfirmModalCard && (
          <div id="complete-confirm-overlay" className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white rounded-[2.2rem] p-6 border-2 border-pink-100 shadow-2xl w-full max-w-[320px] text-slate-800 flex flex-col items-center gap-4 relative animate-scaleIn">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-2xl flex items-center justify-center border border-emerald-150 shadow-sm">✨</div>
              <div className="text-center w-full">
                <h4 className="text-[16px] font-sans font-black text-rose-950 uppercase tracking-wide">Confirm Completion</h4>
                <p className="text-[11.5px] text-slate-600 mt-2.5 leading-relaxed font-semibold">Have you really completed this quest? Your partner will be notified.</p>
                <div className="mt-3.5 bg-rose-50/50 border border-rose-100/45 p-3 rounded-xl text-left"><p className="text-[11.5px] font-extrabold text-slate-700 leading-normal">{completeConfirmModalCard.title}</p></div>
              </div>
              <div className="flex flex-col gap-1.5 w-full mt-2">
                <button onClick={() => completeActiveCard(completeConfirmModalCard)} className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer shadow-sm active:scale-97 transition-all leading-normal uppercase tracking-wider">Yes, I'm Done! 💖</button>
                <button onClick={() => setCompleteConfirmModalCard(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold py-2.5 rounded-xl cursor-pointer active:scale-97 transition-all leading-normal">Go Back</button>
              </div>
            </div>
          </div>
        )}

        {declineModal?.isOpen && (
          <div id="decline-confirm-overlay" className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 border-2 border-rose-100 shadow-2xl w-full max-w-[310px] text-slate-800 flex flex-col items-center gap-4 relative animate-scaleIn">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-2xl flex items-center justify-center border border-rose-105">💔</div>
              <div className="text-center w-full">
                <h4 className="text-[15px] font-serif font-black text-rose-950 uppercase tracking-wide">Are you sure? 🥺</h4>
                <p className="text-[11.5px] text-slate-600 mt-2.5 leading-relaxed font-semibold">You won't receive points for this quest, and its day will be <span className="text-rose-600 font-extrabold">permanently missed</span>.</p>
              </div>
              <div className="flex flex-col gap-1.5 w-full mt-2">
                <button onClick={confirmDecline} className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer shadow-sm active:scale-97 transition-all leading-normal">Yes, Decline</button>
                <button onClick={() => setDeclineModal(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold py-2.5 rounded-xl cursor-pointer active:scale-97 transition-all leading-normal">Oops, No</button>
              </div>
            </div>
          </div>
        )}

        {jokerReplaceModalOpen && (
          <div id="joker-confirm-modal" className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 border-2 border-rose-100 shadow-2xl w-full max-w-[310px] text-slate-800 flex flex-col items-center gap-4 relative animate-scaleIn">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-2xl flex items-center justify-center border border-amber-100">🪄</div>
              <div className="text-center w-full">
                <h4 className="text-[15px] font-serif font-black text-rose-950 leading-normal">Swap quest for an easy one?</h4>
                <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed font-semibold">Using a Joker replaces the task. Today's reward drops to <span className="text-rose-600 font-extrabold">1 point</span>.</p>
              </div>
              <div className="flex flex-col gap-1.5 w-full mt-2">
                <button onClick={applyJokerToday} className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer shadow-sm active:scale-97 transition-all leading-normal">Yes, Use Joker 🪄</button>
                <button onClick={() => setJokerReplaceModalOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold py-2.5 rounded-xl cursor-pointer active:scale-97 transition-all leading-normal">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {purchasedItemSuccess && (
          <div id="purchase-success-overlay" className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-2xl w-full max-w-[310px] text-slate-800 flex flex-col items-center gap-4 relative animate-scaleIn">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-3xl flex items-center justify-center border border-amber-200">{purchasedItemSuccess.icon}</div>
              <div className="text-center w-full">
                <span className="text-[10px] bg-amber-100 text-amber-800 uppercase tracking-widest font-black px-2.5 py-1 rounded-full inline-block mb-1">Purchase Successful! 🎉</span>
                <h4 className="text-[15px] font-sans font-black text-rose-950 leading-normal mt-1.5">Reward Unlocked!</h4>
                <p className="text-[11.5px] text-slate-600 mt-2.5 leading-relaxed font-semibold">Deducted <span className="text-rose-600 font-extrabold">{purchasedItemSuccess.cost} points</span> from your balance.</p>
              </div>
              <button onClick={() => setPurchasedItemSuccess(null)} className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-black py-2.5 mt-4 rounded-xl cursor-pointer shadow-sm active:scale-97 transition-all leading-normal uppercase tracking-wider">Awesome! Get Reward 🎁</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}