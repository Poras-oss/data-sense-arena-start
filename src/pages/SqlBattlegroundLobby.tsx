import React, { useEffect, useMemo, useRef, useState, MouseEvent } from "react";
import {
  Flame,
  Medal,
  Shield,
  Star,
  Target,
  Trophy,
  Users,
  Sword,
  X,
  Volume2,
  VolumeX,
  Play,
  Loader2,
  Copy,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useWebSocketContext } from "@/util/WebsocketProvider";
import { useNotification } from "@/hooks/NotificationProvider";
// Ensure this path matches your file structure
import audio from "/sound/battlesound.mp3";

// --- Types ---
type ChallengeMode = "bullet_surge" | "rapid_sprint" | "daily_dash";
type Difficulty = "beginner" | "intermediate" | "advanced";

type Badge = {
  id: string;
  name: string;
  description: string;
  xp: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
};

type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  xp: number;
};

// --- Static Data ---
const BADGES: Badge[] = [
  { id: "b1", name: "First Blood", description: "Win your first SQL battle.", xp: 50, rarity: "Common" },
  { id: "b2", name: "Headshot", description: "Solve a question in under 10 seconds.", xp: 75, rarity: "Rare" },
  { id: "b3", name: "Squad Leader", description: "Host 3 team battles.", xp: 80, rarity: "Rare" },
  { id: "b4", name: "Survivor", description: "Finish a 30-minute battle without quitting.", xp: 120, rarity: "Epic" },
  { id: "b10", name: "Collector", description: "Unlock 10 different badges.", xp: 200, rarity: "Legendary" },
  { id: "b15", name: "SQL Commander", description: "Reach level 10 overall.", xp: 250, rarity: "Legendary" },
];

const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: "d1", title: "Hardcore Win", description: "Win one round on Advanced difficulty.", xp: 50 },
  { id: "d2", title: "Warm Up", description: "Attempt at least 10 questions today.", xp: 30 },
  { id: "d3", title: "Combo Master", description: "Score 5 correct answers in a row.", xp: 40 },
];

const RANDOM_NAMES = [
  "DataSense", "Diya6", "Zara", "Kian", "Riya", "Ayaan21", "Mia", "Kabir", "Sana", "Joel3",
  "DevOps_Kai", "Frontend_Mia", "Backend_Leo", "FullStack_Z", "GitPush",
  "SudoUser", "Admin123", "PixelNinja", "CodeWarrior", "BugHunter"
];

// Generate avatars using DiceBear
const PLAYER_POOL = RANDOM_NAMES.map((name) => ({
  name,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}));

// Particle config type
type ParticleConfig = {
  id: number;
  left: number;
  delay: number;
  duration: number;
};

const SqlBattlegroundLobby: React.FC = () => {
  // --- 1. Hooks & Context ---
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { socket, isConnected } = useWebSocketContext();
  const { showSuccess, showError, showInfo } = useNotification();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- 2. Visual State ---
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showDailyPopup, setShowDailyPopup] = useState<boolean>(false);

  // Randomize online players on mount (LIMIT 5)
  const onlinePlayers = useMemo(() => {
    return [...PLAYER_POOL].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, []);

  const todayChallenge = useMemo(() => {
    return DAILY_CHALLENGES[new Date().getDate() % DAILY_CHALLENGES.length];
  }, []);

  // --- 3. Logic State ---
  const [mode, setMode] = useState<ChallengeMode>(() => (localStorage.getItem("selectedChallengeType") as ChallengeMode) || "bullet_surge");
  const [timeMinutes, setTimeMinutes] = useState<number>(() => Number(localStorage.getItem("selectedTime")) || 10);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => (localStorage.getItem("selectedDifficulty") as Difficulty) || "beginner");
  const [numQuestions, setNumQuestions] = useState<number>(() => Number(localStorage.getItem("questionCount")) || 10);
  const [topic, setTopic] = useState<string>(() => localStorage.getItem("selectedTopic") || "sql");
  const [soundOn, setSoundOn] = useState<boolean>(() => localStorage.getItem("soundEnabled") === "true");

  // --- 4. Transient State ---
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [generatedGameId, setGeneratedGameId] = useState<string | null>(null);
  const [joinGameIdInput, setJoinGameIdInput] = useState("");

  // --- 5. Effects ---
  useEffect(() => { localStorage.removeItem("currentGame"); }, []);

  useEffect(() => {
    localStorage.setItem("selectedChallengeType", mode);
    localStorage.setItem("selectedTime", timeMinutes.toString());
    localStorage.setItem("selectedDifficulty", difficulty);
    localStorage.setItem("questionCount", numQuestions.toString());
    localStorage.setItem("selectedTopic", topic);
    localStorage.setItem("soundEnabled", String(soundOn));
  }, [mode, timeMinutes, difficulty, numQuestions, topic, soundOn]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching) {
      timer = setInterval(() => setSearchTime(p => p + 1), 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (soundOn) {
      audioRef.current.volume = 0.35;
      audioRef.current.play().catch(() => { });
    } else {
      audioRef.current.pause();
    }
  }, [soundOn]);

  const particles: ParticleConfig[] = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 5, duration: 8 + Math.random() * 4,
  })), []);

  // --- 6. Logic Helpers ---
  const getFormattedMode = () => {
    if (mode === 'bullet_surge') return "Bullet Surge";
    if (mode === 'rapid_sprint') return "Rapid Sprint";
    return "Bullet Surge";
  };

  const getDifficulty = () => {
    // UPDATED: Simplified logic as requested.
    // Direct mapping from UI state to Backend expected values.
    if (difficulty === 'beginner') return "easy";
    if (difficulty === 'intermediate') return "medium";
    if (difficulty === 'advanced') return "advanced";

    return "easy";
  };

  // --- 7. Socket Logic ---
  useEffect(() => {
    if (!socket) return;

    const handlePlayerFound = (data: any) => {
      setIsSearching(false);
      localStorage.setItem("gameData", JSON.stringify(data));
      const botParam = data.isBot ? '&isNexus=true' : '';
      navigate(
        `/challenge?gameId=${data.gameId}&challengeType=${data.challengeType}&selectedSubject=${data.subject}&customTime=${data.customTime}${botParam}`,
        { state: { data } }
      );
    };

    const handleRoomCreated = (data: any) => {
      setIsCreating(false);
      setGeneratedGameId(data.gameId);
      showSuccess("Squad Formed", "Share your frequency code!");
    };

    const handleGameStart = (data: any) => {
      setIsJoining(false);
      localStorage.setItem("gameData", JSON.stringify(data));
      const botParam = data.isBot ? '&isNexus=true' : '';
      navigate(
        `/challenge?gameId=${data.gameId}&challengeType=${data.challengeType || getFormattedMode()}&selectedSubject=${data.subject || topic}&customTime=${data.customTime || timeMinutes}${botParam}`,
        { state: { data } }
      );
    };

    const handleError = (data: any) => {
      if (data.message === "Game not found") {
        localStorage.removeItem("currentGame");
        return;
      }
      setIsSearching(false);
      setIsCreating(false);
      setIsJoining(false);
      showError("Mission Error", data.message || "Connection failed");
    };

    socket.on("playerFound", handlePlayerFound);
    socket.on("roomCreated", handleRoomCreated);
    socket.on("gameStart", handleGameStart);
    socket.on("error", handleError);

    return () => {
      socket.off("playerFound", handlePlayerFound);
      socket.off("roomCreated", handleRoomCreated);
      socket.off("gameStart", handleGameStart);
      socket.off("error", handleError);
    };
  }, [socket, navigate, mode, topic, timeMinutes]);

  // --- 8. Handlers ---
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (x - 0.5) * -4, y: (y - 0.5) * 4 });
  };

  const handleStart = () => {
    if (!isLoaded || !user) return;
    localStorage.removeItem("currentGame");

    if (!socket || !isConnected) {
      showError("Offline", "Socket disconnected.");
      return;
    }

    if (mode === "rapid_sprint") {
      setShowTeamModal(true);
      return;
    }

    setIsSearching(true);

    // Correct Payload
    const payload = {
      subject: "sql",
      difficulty: getDifficulty(),
      userId: user.id,
      playerName: user.fullName || user.username || "Agent",
      time: timeMinutes,
      questions: numQuestions, // Preferred by some backend handlers
      questionCount: numQuestions, // Fallback/Alternative name matching local storage key
      challengeType: getFormattedMode(),
    };

    console.log("Starting Game Payload:", payload);
    socket.emit("findPlayer", payload);
  };

  const handleCreateTeamGame = () => {
    if (!socket || !isConnected) return;
    setIsCreating(true);
    const newGameId = "GAME" + Math.random().toString(36).substr(2, 6).toUpperCase();

    const payload = {
      gameId: newGameId,
      clerkId: user?.id,
      subject: "sql",
      challengeType: getFormattedMode(),
      challengeDuration: timeMinutes,
      difficulty: getDifficulty(),
      questions: numQuestions,
      questionCount: numQuestions,
      playerName: user?.fullName
    };

    localStorage.setItem("currentGame", JSON.stringify({ ...payload, isHost: true }));
    socket.emit("createRoom", payload);
  };

  const handleJoinTeamGame = () => {
    if (!socket || !isConnected || !joinGameIdInput) return;
    setIsJoining(true);

    const payload = {
      gameId: joinGameIdInput,
      clerkId: user?.id,
      subject: "sql",
      difficulty: getDifficulty(),
      playerName: user?.fullName
    };

    localStorage.setItem("currentGame", JSON.stringify({ ...payload, isHost: false }));
    socket.emit("joinRoom", payload);
  };

  const difficultyColor =
    difficulty === "beginner" ? "from-emerald-400 to-emerald-500"
      : difficulty === "intermediate" ? "from-amber-400 to-amber-500"
        : "from-rose-400 to-rose-500";

  return (
    // FIX: h-screen + overflow-hidden removes page scrollbar
    <div className="relative h-screen w-full bg-slate-950 text-white font-sans overflow-hidden">

      {/* --- ISOLATED BACKGROUND LAYER (z-0) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('/image/battle1')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950" />
        <div className="absolute inset-0 overflow-hidden opacity-50"><div className="cyber-rain"></div></div>

        <motion.div className="absolute inset-0" initial={{ opacity: 0.4 }} animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
          <div className="absolute left-0 top-1/3 h-px w-full bg-cyan-500/10" />
          <div className="absolute left-0 top-2/3 h-px w-full bg-cyan-500/10" />
        </motion.div>

        {particles.map((p) => (
          <motion.div key={p.id} className="absolute h-1 w-1 rounded-full bg-cyan-400" style={{ left: `${p.left}%` }} initial={{ y: "110%", opacity: 0 }} animate={{ y: "-10%", opacity: [0.1, 0.7, 0.1] }} transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }} />
        ))}
      </div>

      <audio ref={audioRef} src={audio} loop />

      {/* --- CONTENT LAYER (z-50) --- */}
      <motion.div
        className="relative z-50 w-full max-w-[1400px] mx-auto flex h-full flex-col px-4 md:px-8 py-4"
        animate={{ rotateX: tilt.y, rotateY: tilt.x }}
        transition={{ type: "spring", stiffness: 80, damping: 15, mass: 0.5 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      >
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide">
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">SQL Battleground</span>
            </h1>
            <p className="text-[11px] text-slate-300/80 font-mono">CONFIGURE MISSION // SQUAD UP // DROP IN</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setSoundOn(!soundOn)} className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/60 bg-slate-900/80 text-xs shadow-[0_0_12px_rgba(34,211,238,0.5)] hover:bg-slate-800 transition z-20 cursor-pointer pointer-events-auto">
              {soundOn ? <Volume2 className="h-4 w-4 text-cyan-300" /> : <VolumeX className="h-4 w-4 text-cyan-300" />}
            </button>
            <div className="hidden md:block rounded-xl border border-cyan-400/40 bg-slate-900/80 px-4 py-2 text-[10px] backdrop-blur-md">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-cyan-400" /><span className="font-semibold">{user?.fullName || "Agent"} &mdash; Level 9</span></div>
              <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-slate-800"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300" /></div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        {/* FIX: overflow-hidden + flex-1 to prevent scrollbars */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 min-h-0 overflow-hidden pb-2">

          {/* LEFT SIDE (Config) - Scrollable if needed */}
          <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {/* Mode */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-lg shadow-black/40 backdrop-blur-sm relative z-20 shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-cyan-400"><Sword className="h-4 w-4" /> Choose Your Challenge</h2>
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Mission Setup</span>
              </div>
              <div className="mb-4 grid grid-cols-3 rounded-full bg-slate-950 p-1 text-[11px] font-semibold border border-slate-800">
                <ModePill label="Solo Training" active={mode === "bullet_surge"} onClick={() => setMode("bullet_surge")} />
                <ModePill label="Team Battle" active={mode === "rapid_sprint"} onClick={() => setMode("rapid_sprint")} />
                <ModePill
                  label={
                    <span className="flex items-center gap-1.5">
                      Royal Battle
                      <Lock className="h-3 w-3" />
                    </span>
                  }
                  active={mode === "daily_dash"}
                  onClick={() => { }}
                  disabled={true}
                />
              </div>
              <SliderRow label="Time" display={`${timeMinutes} Min`} min={5} max={30} step={5} value={timeMinutes} onChange={setTimeMinutes} />
            </div>

            {/* Difficulty */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-lg shadow-black/40 backdrop-blur-sm relative z-20 shrink-0">
              <div className="mb-2">
                <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-emerald-400"><Target className="h-4 w-4" /> Difficulty</h2>
              </div>
              <div className="mb-4 grid grid-cols-3 rounded-full bg-slate-950 p-1 text-[11px] font-semibold border border-slate-800">
                <DifficultyPill label="Beginner" active={difficulty === "beginner"} onClick={() => setDifficulty("beginner")} />
                <DifficultyPill label="Intermediate" active={difficulty === "intermediate"} onClick={() => setDifficulty("intermediate")} />
                <DifficultyPill label="Advanced" active={difficulty === "advanced"} onClick={() => setDifficulty("advanced")} />
              </div>
              <SliderRow label="Number of Questions" display={`${numQuestions} Questions`} min={5} max={25} step={5} value={numQuestions} onChange={setNumQuestions} />
            </div>

            {/* Focus & Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-3 shrink-0">
              <div className="flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-lg shadow-black/40 backdrop-blur-sm relative z-20">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-amber-400"><Flame className="h-4 w-4" /> Focus Areas</h2>
                  <span className="text-[9px] text-slate-400">Pick 3–4</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <button onClick={() => setTopic("sql")} className={`rounded-full border px-2.5 py-1 transition-all cursor-pointer ${topic === 'sql' ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:border-amber-500/30'}`}>All Topics</button>
                  {["Selection", "Filtering", "Joins", "Window Fn", "CTE", "Subqueries"].map((t) => (
                    <button key={t} onClick={() => setTopic(t)} className={`rounded-full border px-2.5 py-1 transition-all cursor-pointer ${topic === t ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:border-amber-500/30'}`}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Preview Card */}
              <div className="flex flex-col rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-900/95 to-slate-950 p-4 shadow-lg shadow-black/60 relative overflow-hidden z-20">
                <div className={`absolute inset-0 bg-gradient-to-br ${difficultyColor} opacity-5 pointer-events-none`} />
                <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-white"><Trophy className="h-4 w-4 text-cyan-400" /> Challenge Preview</h3>
                <div className="space-y-1 text-[10px] text-slate-300">
                  <PreviewRow label="Type" value={getFormattedMode()} />
                  <PreviewRow label="Time" value={`${timeMinutes} min`} />
                  <PreviewRow label="Difficulty" value={getDifficulty()} capitalize />
                  <PreviewRow label="Questions" value={`${numQuestions}`} />
                  <PreviewRow label="XP Reward" value={`${numQuestions * 10} XP`} highlight />
                </div>
                <motion.button
                  onClick={handleStart}
                  disabled={isSearching || !isConnected}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${difficultyColor} px-3 py-3 text-xs font-bold text-slate-900 shadow-[0_0_18px_rgba(34,211,238,0.4)] z-50 cursor-pointer relative hover:brightness-110 active:scale-95 transition-all`}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                  {isSearching ? <Loader2 className="animate-spin h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                  {isSearching ? "Searching..." : "Start Challenge"}
                </motion.button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-3 shrink-0">
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-3 text-center text-[10px] shadow-lg flex items-center justify-around relative z-20">
                <div className="flex flex-col"><span className="text-slate-500">Matches Today</span><span className="text-white font-bold">3</span></div>
                <div className="flex flex-col"><span className="text-slate-500">Daily XP Boost</span><span className="text-cyan-400 font-bold">+20%</span></div>
                <div className="flex flex-col"><span className="text-slate-500">Queue Status</span><span className="text-emerald-400 font-bold">Squad Ready</span></div>
              </div>
              <div className="flex items-center justify-center rounded-2xl border border-cyan-500/50 bg-slate-900/90 p-3 text-[10px] shadow-lg shadow-cyan-500/20 relative z-20">
                {isSearching ? (
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="font-semibold uppercase">Searching... {searchTime}s</span>
                  </div>
                ) : (
                  <div onClick={() => isSearching && socket?.emit("cancelSearch")} className="cursor-pointer text-slate-400 font-semibold uppercase tracking-wider">System Idle</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (Info) - Scrollable if needed */}
          <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 relative z-20">
            {/* Level Card */}
            <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900/95 via-slate-900 to-slate-950 p-4 shadow-lg shadow-black/60 shrink-0">
              <div className="flex justify-between items-center mb-2">
                <div><p className="text-[10px] font-semibold text-cyan-300/90">Player Level</p><p className="text-sm font-bold">Level 9 &middot; JOIN Table Pro</p></div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/50 bg-slate-900 font-bold text-[10px]">XP</div>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1"><div className="h-full w-3/4 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300" /></div>
              <div className="flex justify-between text-[9px] text-slate-400"><span>Total: 1,380</span><span>Next: 420 XP</span></div>
            </div>

            {/* Missions */}
            <div className="flex-1 rounded-2xl border border-slate-700/70 bg-slate-900/85 p-4 shadow-md flex flex-col min-h-[200px] shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-amber-300"><Medal className="h-4 w-4" /> Missions & Badges</h2>
                <span className="text-[9px] text-slate-500">{BADGES.length} Unlocked</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {BADGES.map(b => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-950/50 px-2 py-1.5">
                    <div><p className="text-[10px] font-bold text-slate-200">{b.name}</p><p className="text-[9px] text-slate-500">{b.description}</p></div>
                    <div className="text-right"><p className="text-[10px] font-bold text-emerald-400">+{b.xp} XP</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily + Leaderboard */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="rounded-2xl border border-amber-400/30 bg-slate-900/90 p-3 overflow-hidden">
                <div className="flex items-center gap-1.5 mb-2 text-amber-400 font-semibold text-[10px] uppercase"><Flame className="h-3 w-3" /> Daily Challenges</div>
                <div className="space-y-1.5">
                  {DAILY_CHALLENGES.slice(0, 2).map(ch => (
                    <div key={ch.id} className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <p className="text-[9px] font-bold text-white">{ch.title}</p>
                      <p className="text-[8px] text-emerald-400">Reward: +{ch.xp} XP</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-3 overflow-hidden">
                <div className="flex items-center gap-1.5 mb-2 text-yellow-300 font-semibold text-[10px] uppercase"><Trophy className="h-3 w-3" /> Leaderboard</div>
                <div className="space-y-1">
                  {[{ n: 'Riya', x: 260 }, { n: 'Arjun', x: 198 }, { n: 'You', x: 188 }, { n: 'Neha', x: 120 }].map((p, i) => (
                    <div key={i} className="flex justify-between text-[9px] bg-slate-950/50 p-1 rounded">
                      <span className="text-slate-300">#{i + 1} {p.n}</span>
                      <span className="text-emerald-400 font-bold">{p.x} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Player Strip - FIX: Only show 5 players */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 shadow-lg shrink-0">
              <p className="flex items-center gap-1.5 font-semibold text-[10px] text-emerald-400"><Users className="h-3 w-3" /> Online</p>
              <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-none">
                {onlinePlayers.map((p, i) => (
                  <div key={i} className="flex flex-col items-center min-w-[40px] opacity-70 hover:opacity-100 transition">
                    <img src={p.avatar} className="h-8 w-8 rounded-full border border-slate-700 bg-slate-800" alt={p.name} />
                    <span className="text-[7px] mt-0.5 text-slate-400 truncate max-w-[40px] text-center">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- TEAM MODAL --- */}
        <AnimatePresence>
          {showTeamModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative z-[101]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-cyan-400" /> Squad Operations
                  </h2>
                  <button onClick={() => setShowTeamModal(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={20} /></button>
                </div>

                {generatedGameId ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-slate-400 mb-2">Lobby Created Successfully</div>
                    <div className="flex items-center justify-center gap-2 bg-slate-950 p-4 rounded-xl border border-cyan-500/30 mb-4">
                      <span className="text-3xl font-mono font-bold text-cyan-400 tracking-widest select-all">{generatedGameId}</span>
                      <button onClick={() => navigator.clipboard.writeText(generatedGameId || "")} className="text-slate-500 hover:text-white cursor-pointer"><Copy size={16} /></button>
                    </div>
                    <p className="text-xs text-slate-500 animate-pulse">Waiting for squadmates...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <button
                      onClick={handleCreateTeamGame}
                      disabled={isCreating}
                      className="w-full p-4 bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl hover:border-cyan-500/50 hover:from-slate-800 hover:to-slate-700 transition flex items-center gap-4 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                        {isCreating ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white">Create Lobby</div>
                        <div className="text-xs text-slate-400">Host a match for friends</div>
                      </div>
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or Join</span></div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="GAME ID"
                        value={joinGameIdInput}
                        onChange={(e) => setJoinGameIdInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 text-center font-mono text-lg uppercase focus:outline-none focus:border-cyan-500 text-white placeholder:text-slate-700"
                      />
                      <button
                        onClick={handleJoinTeamGame}
                        disabled={!joinGameIdInput || isJoining}
                        className="bg-cyan-500 text-slate-900 font-bold px-6 rounded-xl hover:bg-cyan-400 disabled:opacity-50 min-w-[100px] cursor-pointer"
                      >
                        {isJoining ? <Loader2 className="animate-spin mx-auto" /> : "JOIN"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* DAILY CHALLENGE POPUP */}
        {showDailyPopup && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-amber-400/60 bg-slate-950/95 p-5 shadow-[0_0_40px_rgba(251,191,36,0.45)] relative z-[101]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-300" />
                  <h2 className="text-sm font-bold tracking-wide">Today&apos;s Operation</h2>
                </div>
                <button onClick={() => setShowDailyPopup(false)} className="rounded-full bg-slate-800/80 p-1 hover:bg-slate-700 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-3 text-[11px] text-slate-300">Complete this daily challenge for a bonus XP boost.</p>
              <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-[12px]">
                {/* Fix: Ensure variables exist before accessing */}
                <p className="mb-1 text-xs font-semibold text-amber-300">{todayChallenge?.title || "Daily Mission"}</p>
                <p className="mb-2 text-[11px] text-slate-200">{todayChallenge?.description || "Complete tasks to earn rewards."}</p>
                <p className="text-[11px] font-semibold text-emerald-300">Reward: +{todayChallenge?.xp || 50} XP</p>
              </div>
              <button onClick={() => setShowDailyPopup(false)} className="mt-4 w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2 text-xs font-semibold text-slate-900 hover:brightness-110 transition cursor-pointer">
                Accept Mission
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

// --- Small Visual Components ---
const ModePill: React.FC<{ label: React.ReactNode; active: boolean; onClick: () => void; disabled?: boolean }> = ({ label, active, onClick, disabled = false }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`rounded-full px-3 py-1.5 transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${active ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-900 shadow-[0_0_16px_rgba(34,211,238,0.7)]" : "text-slate-300 hover:bg-slate-700/80"}`}
  >
    {label}
  </button>
);

const DifficultyPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-center transition-all cursor-pointer ${active ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 shadow-[0_0_14px_rgba(52,211,153,0.7)]" : "text-slate-300 hover:bg-slate-700/80"}`}>{label}</button>
);

const SliderRow: React.FC<{ label: string; display: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }> = ({ label, display, min, max, step, value, onChange }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[10px] text-slate-200"><span>{label}</span><span className="font-semibold text-cyan-300">{display}</span></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer" />
    <div className="flex justify-between text-[9px] text-slate-500"><span>{min}</span><span>{max}</span></div>
  </div>
);

const PreviewRow: React.FC<{ label: string; value: string; capitalize?: boolean; highlight?: boolean }> = ({ label, value, capitalize, highlight }) => (
  <div className="flex justify-between">
    <span className="text-slate-400">{label}</span>
    <span className={`font-semibold ${highlight ? "text-emerald-400" : "text-slate-50"} ${capitalize ? "capitalize" : ""}`}>{value}</span>
  </div>
);

const MiniStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><p className="text-[9px] text-slate-400">{label}</p><p className="text-xs font-semibold text-cyan-300">{value}</p></div>
);

export default SqlBattlegroundLobby;