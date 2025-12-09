import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Users,
  Trophy,
  Sword,
  Sparkles,
  Zap,
  Shield,
  Code2,
  Volume2,
  VolumeX,
  ChevronDown,
  Star,
  Gamepad2,
  Crown,
} from "lucide-react";
// Make sure this path is correct for your project
import audio from "/sound/battlesound.mp3"; 
import { useUser, UserButton, SignInButton, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

type GameMode = {
  id: string;
  name: string;
  icon: React.ReactNode;
  tag: string;
  description: string;
  details: string;
};

type PowerUp = {
  name: string;
  effect: string;
  label: string;
};

type Badge = {
  name: string;
  icon: React.ReactNode;
  description: string;
};

type FAQ = {
  question: string;
  answer: string;
};

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

const gameModes: GameMode[] = [
  {
    id: "solo",
    name: "Solo Training",
    icon: <Code2 className="w-6 h-6" />,
    tag: "Practice Mode",
    description: "Sharpen your SQL skills at your own pace.",
    details:
      "Time-bound challenges, instant feedback, and progressive difficulty to help you build confidence query by query.",
  },
  {
    id: "battle-royale",
    name: "Battle Royale",
    icon: <Sword className="w-6 h-6" />,
    tag: "Competitive",
    description: "Everyone gets the same SQL problem. Only the fastest survive.",
    details:
      "Compete against players in real time. Solve the challenge before the timer ends and climb the global ladder.",
  },
  {
    id: "team-battle",
    name: "Team Battles",
    icon: <Users className="w-6 h-6" />,
    tag: "Multiplayer",
    description: "Squad up, split tasks, and solve together.",
    details:
      "Invite friends, form teams, and tackle scenario-based SQL missions that mimic real-world data problems.",
  },
  {
    id: "daily",
    name: "Daily Missions",
    icon: <Zap className="w-6 h-6" />,
    tag: "Streak Mode",
    description: "One mission. Every day. Keep the streak alive.",
    details:
      "Solve one curated SQL mission daily, earn DS Coins, build streaks, and unlock exclusive cosmetic rewards.",
  },
];

const powerUps: PowerUp[] = [
  {
    name: "Time Freeze",
    effect: "+30 seconds",
    label: "Beat the timer when stakes are high.",
  },
  {
    name: "Double XP",
    effect: "2x XP",
    label: "Rank up faster in intense battle nights.",
  },
  {
    name: "Query Booster",
    effect: "Smart hints",
    label: "Context-aware tips on joins, filters, and groups.",
  },
  {
    name: "Auto-Format",
    effect: "Clean SQL",
    label: "Instantly beautify your query before execution.",
  },
];

const badges: Badge[] = [
  {
    name: "Query Master",
    icon: <Crown className="w-6 h-6" />,
    description: "Finish 100+ missions with 90%+ accuracy.",
  },
  {
    name: "Bug Slayer",
    icon: <Shield className="w-6 h-6" />,
    description: "Fix 50+ failing queries during battles.",
  },
  {
    name: "Speed Demon",
    icon: <Zap className="w-6 h-6" />,
    description: "Win 10 battles in under 30 seconds each.",
  },
  {
    name: "Data Guardian",
    icon: <Trophy className="w-6 h-6" />,
    description: "Top the weekly leaderboard at least once.",
  },
];

const faqs: FAQ[] = [
  {
    question: "What is DataSense Battleground?",
    answer:
      "DataSense Battleground is a multiplayer SQL gaming arena where you solve real SQL problems, fight coding battles, and compete with friends in real time.",
  },
  {
    question: "Do I need SQL experience to start?",
    answer:
      "No. You can start as a complete beginner in practice mode and gradually move into competitive battles as you get comfortable.",
  },
  {
    question: "Can I play with my friends and family?",
    answer:
      "Yes. Create private rooms, share invite links, and play SQL battles with friends, classmates, or teammates.",
  },
  {
    question: "Are the SQL challenges real-world based?",
    answer:
      "Yes. Most challenges are modeled after realistic analytics, reporting, and product data problems you’d see in real jobs.",
  },
  {
    question: "Is it free to play?",
    answer:
      "There will always be a free tier with regular missions. Premium tiers may include advanced missions, tournaments, and cosmetic rewards.",
  },
  {
    question: "How does XP and ranking work?",
    answer:
      "Every mission earns you XP based on accuracy, speed, and difficulty. XP unlocks levels, badges, and leaderboard ranking.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No installation required. Just log in from your browser, join a lobby, and you’re ready to play.",
  },
  {
    question: "Can this help in interviews?",
    answer:
      "Absolutely. Missions are designed around real SQL topics: joins, windows, aggregations, CTEs, subqueries, and more.",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Ramandeep",
    role: "Data Analyst",
    quote:
      "It feels like a battle royale game, but every fight makes my SQL better. This is exactly how I wish I had learned earlier.",
  },
  {
    name: "Prem Garg",
    role: "Product Data & Analytics",
    quote:
      "It feels like a battle royale game, but every fight makes my SQL better. This is exactly how I wish I had learned earlier.",
  },
  {
    name: "Shiwani Aggarwal",
    role: "Aspiring Data Engineer",
    quote:
      "We host weekly family SQL battles. I’m literally teaching my brother SQL through this game.",
  },
  {
    name: "Krishna B",
    role: "Working Professional",
    quote:
      "I use Battleground as my daily 15-minute SQL gym. It keeps me sharp without feeling like dry practice.",
  },
];

const leaderboardTabs = ["Global"] as const;
type LeaderboardTab = (typeof leaderboardTabs)[number];

const Home: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(gameModes[0]);
  const [soundOn, setSoundOn] = useState<boolean>(false);
  const [openFAQ, setOpenFAQ] = useState<string | null>(faqs[0]?.question ?? null);
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>("Global");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Auth & Navigation ---
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  // Initialize background sound
  useEffect(() => {
    const audioElement = new Audio(audio);
    audioElement.loop = true;
    audioElement.volume = 0.4;
    audioRef.current = audioElement;

    return () => {
      audioElement.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (soundOn) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [soundOn]);

  // --- Handlers ---
  const handleStartBattle = () => {
    if (isSignedIn) {
      navigate("/start");
    } else {
      // Force redirect to /start after login
      openSignIn({ forceRedirectUrl: "/start" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50 font-sans">
      {/* Glowing background elements */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-500/30 via-transparent to-transparent blur-3xl" />
        <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -right-32 top-80 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]" />
      </div>

      {/* Top navigation + sound toggle */}
      <header className="sticky top-0 z-20 border-b border-emerald-500/20 bg-black/60 backdrop-blur-xl">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-5 sm:px-4 py-3">
          <div className="flex items-center gap-3">
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-[0_0_30px_rgba(45,212,191,0.8)]">
              <Gamepad2 className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
                DataSense
              </div>
              <div className="text-sm font-semibold text-slate-50">
                Battleground
              </div> */}
            {/* </div> */}
              <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundOn((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-emerald-400/50 bg-black/70 px-3 py-1.5 text-xs font-medium text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.35)] transition hover:border-emerald-300 hover:bg-emerald-500/10"
            >
              {soundOn ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  Sound: On
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  Sound: Off
                </>
              )}
            </button>

            {/* --- Auth Button --- */}
            {isLoaded && (
              isSignedIn ? (
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8 rounded-full border border-emerald-500/50 shadow-lg"
                    }
                  }}
                />
              ) : (
                <SignInButton mode="modal" forceRedirectUrl="/start">
                  <button className="rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-400/60 hover:bg-emerald-500/10 transition-colors">
                    Log In
                  </button>
                </SignInButton>
              )
            )}
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1400px] mx-auto px-5 sm:px-4 space-y-12 pb-16 pt-6">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.6)]">
              <Sparkles className="h-3 w-3" />
              DataSense Multiplayer SQL Arena
            </div>

            <h1 className="text-balance text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl md:text-5xl">
              Turn SQL practice into an{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                epic battleground
              </span>{" "}
              with friends.
            </h1>

            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              DataSense Battleground is a live, multiplayer coding arena where you
              answer SQL challenges, fight bugs, and race against the clock with
              teammates and rivals across the globe.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={handleStartBattle}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_45px_rgba(34,197,94,0.9)] transition hover:shadow-[0_0_60px_rgba(34,197,94,1)] hover:scale-105 active:scale-95"
              >
                <Play className="h-4 w-4" />
                Start Battle
              </button>
              
              <button 
                onClick={handleStartBattle}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/60 px-5 py-2.5 text-sm font-medium text-emerald-100 hover:border-emerald-300 hover:bg-emerald-500/10 transition"
              >
                <Users className="h-4 w-4" />
                Play with Friends
              </button>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                Live SQL engine – real queries, real output
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-3 w-3 text-emerald-300" />
                Built for beginners to advanced players
              </div>
            </div>
          </div>

          {/* Hero visual – mock arena */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-400/40 bg-gradient-to-b from-slate-900/90 to-black/90 p-4 shadow-[0_0_45px_rgba(16,185,129,0.6)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),transparent_60%)] pointer-events-none" />
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 text-[10px] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/90 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                  LIVE ARENA
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
                    12 Players Online
                  </span>
                  <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                    Mode: Battle Royale
                  </span>
                </div>
              </div>

              {/* Editor + Result mock */}
              <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_minmax(0,1fr)]">
                <div className="relative rounded-xl border border-slate-800/80 bg-slate-950/90 p-3 text-xs text-emerald-100">
                  <div className="mb-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Code2 className="h-3 w-3 text-emerald-400" />
                      DataSense query.sql
                    </span>
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-emerald-200">
                      Difficulty: Intermediate
                    </span>
                  </div>
                  <pre className="font-mono leading-relaxed text-[11px] whitespace-pre-wrap text-emerald-100/90">
                    {`SELECT  u.username,
        COUNT(o.order_id) AS total_orders,
        SUM(o.order_amount) AS total_spent
FROM    users u
JOIN    orders o
  ON    u.id = o.user_id
WHERE   o.order_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.username
ORDER BY total_spent DESC
LIMIT   10;`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-400/30 bg-slate-950/90 p-3 text-xs">
                    <div className="mb-2 flex items-center justify-between text-[10px] text-slate-300">
                      <span>Leaderboard Snapshot</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
                        LIVE
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <Crown className="h-3 w-3 text-amber-400" />
                          Aarav_07
                        </span>
                        <span className="text-emerald-300">12,940 XP</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <Star className="h-3 w-3 text-slate-300" />
                          MeeraSQL
                        </span>
                        <span className="text-emerald-200">11,280 XP</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <Star className="h-3 w-3 text-slate-400" />
                          RohanOps
                        </span>
                        <span className="text-emerald-200">9,760 XP</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/90 p-3 text-xs text-slate-300">
                    <div className="mb-1 text-[10px] text-slate-400">
                      Battle Feed
                    </div>
                    <ul className="space-y-1.5 text-[11px]">
                      <li className="flex items-center justify-between gap-2">
                        <span className="text-emerald-200">
                          ✓ Aarav_07 completed query in 23s
                        </span>
                        <span className="text-emerald-300">+320 XP</span>
                      </li>
                      <li className="flex items-center justify-between gap-2">
                        <span className="text-slate-200">
                          ! MeeraSQL fixed JOIN condition
                        </span>
                        <span className="text-emerald-300">+150 XP</span>
                      </li>
                      <li className="flex items-center justify-between gap-2">
                        <span className="text-slate-200">
                          ✦ RohanOps activated Time Freeze
                        </span>
                        <span className="text-emerald-300">+30s</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Grid floor */}
              <div className="mt-4 h-20 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(to_top,rgba(148,163,184,0.25)_1px,transparent_1px)] bg-[size:28px_20px] opacity-60" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OVERVIEW + GAME MODES */}
        <section className="space-y-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] lg:items-start">
            {/* Overview */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-50">
                What is <span className="text-emerald-300">DataSense Battleground?</span>
              </h2>
              <p className="text-sm text-slate-300 sm:text-[15px]">
                It’s a cyber-style arena where SQL isn’t just practice—it’s a live
                battle. You write real queries, solve data missions, and win based on
                accuracy, speed, and creativity.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/30 bg-black/60 p-4 text-sm text-slate-200">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    <Sword className="h-4 w-4" />
                    Real SQL Battles
                  </div>
                  <p className="text-xs text-slate-300">
                    Every challenge runs against a real engine. You don’t just guess
                    answers—you experience actual SQL output.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-black/60 p-4 text-sm text-slate-200">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    <Users className="h-4 w-4" />
                    Built for People
                  </div>
                  <p className="text-xs text-slate-300">
                    Play with classmates, friends, colleagues, even family. Turn
                    evenings into friendly SQL wars.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  Why it works
                </div>
                <p>
                  Games keep you coming back. Battleground uses streaks, XP,
                  leaderboards, and cosmetics to make consistency feel natural—
                  without losing the seriousness of real-world SQL skills.
                </p>
              </div>
            </div>

            {/* Game modes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-50">
                  Choose your battle mode
                </h3>
                <span className="text-[11px] text-slate-400">
                  {gameModes.length} modes • more coming soon
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {gameModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode)}
                    className={`group flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition ${selectedMode.id === mode.id
                      ? "border-emerald-400/80 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.8)]"
                      : "border-slate-800/90 bg-slate-950/70 hover:border-emerald-400/60 hover:bg-emerald-500/5"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/80 to-cyan-400/80 text-slate-950 shadow-[0_0_18px_rgba(45,212,191,0.8)]">
                        {mode.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-50">
                          {mode.name}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-emerald-300">
                          {mode.tag}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300">{mode.description}</p>
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-emerald-400/40 bg-black/80 p-4 text-xs text-slate-200">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  Mode Spotlight: {selectedMode.name}
                </div>
                <p>{selectedMode.details}</p>
              </div>
            </div>
          </div>
        </section>

        {/* POWER UPS + PLAYER STATS */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
          {/* Power Ups */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-50">
              Power-ups to change the battle
            </h3>
            <p className="text-xs text-slate-300">
              Strategic boosts you can trigger during live matches to shift
              momentum, save streaks, and pull off last-second wins.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {powerUps.map((p) => (
                <div
                  key={p.name}
                  className="relative overflow-hidden rounded-2xl border border-emerald-400/40 bg-slate-950/80 p-3 text-xs text-slate-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 opacity-60" />
                  <div className="relative space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                        {p.name}
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-100">
                        {p.effect}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{p.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock Player Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-50">
              Your player card in the arena
            </h3>
            <div className="rounded-3xl border border-emerald-400/40 bg-slate-950/80 p-4 shadow-[0_0_35px_rgba(16,185,129,0.6)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-400 to-emerald-400 shadow-[0_0_35px_rgba(45,212,191,0.9)]">
                    <div className="absolute inset-[3px] flex items-center justify-center rounded-2xl bg-slate-950/90 text-emerald-300">
                      <Gamepad2 className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-50">
                      You (SQL_Warrior)
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      Level 12 • Rank: Platinum IV
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-500/15 px-3 py-1 text-[10px] text-emerald-100">
                  Streak: 7 days 🔥
                </div>
              </div>

              {/* XP bar */}
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>XP Progress</span>
                  <span className="text-emerald-200">8,240 / 10,000</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 w-[78%] rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 shadow-[0_0_18px_rgba(16,185,129,0.9)]" />
                </div>
              </div>

              {/* Stats grid */}
              <div className="mt-4 grid grid-cols-3 gap-3 text-[11px] text-slate-200">
                <div className="rounded-xl border border-slate-800 bg-black/70 p-2.5">
                  <div className="text-[10px] text-slate-400">Battles Won</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-300">
                    46
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-black/70 p-2.5">
                  <div className="text-[10px] text-slate-400">Accuracy</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-300">
                    92%
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-black/70 p-2.5">
                  <div className="text-[10px] text-slate-400">Avg. Solve Time</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-300">
                    31s
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
                <button 
                  onClick={handleStartBattle}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 font-semibold text-slate-950 shadow-[0_0_25px_rgba(34,197,94,0.9)] hover:brightness-110"
                >
                  <Play className="h-3.5 w-3.5" />
                  Resume Last Battle
                </button>
                <button 
                  onClick={handleStartBattle}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald-400/50 bg-black/80 px-3 py-1.5 font-medium text-emerald-100 hover:bg-emerald-500/10"
                >
                  <Users className="h-3.5 w-3.5" />
                  Create Private Room
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* LEADERBOARD + BADGES */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Leaderboard */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-50">
                Live leaderboard
              </h3>
              <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-black/70 p-1 text-[11px] text-slate-300">
                {leaderboardTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLeaderboardTab(tab)}
                    className={`rounded-full px-3 py-1 capitalize transition ${leaderboardTab === tab
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_18px_rgba(34,197,94,0.8)]"
                      : "text-slate-300 hover:text-emerald-200"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/80 p-4 text-xs text-slate-200">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-emerald-200">
                  <Trophy className="h-4 w-4" />
                  {leaderboardTab} Rankings
                </div>
                <div className="text-[10px] text-slate-400">
                  Updated every few seconds
                </div>
              </div>
              <div className="space-y-2">
                {/* Static sample rows - you can replace with real data */}
                <div className="flex items-center justify-between gap-2 rounded-xl bg-black/70 p-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950">
                      1
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-50">
                        Aarav_07
                      </div>
                      <div className="text-[10px] text-emerald-300">
                        Win streak: 9 • Accuracy: 95%
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-emerald-200">
                    12,940 XP
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-xl bg-black/50 p-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-slate-950">
                      2
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-50">
                        MeeraSQL
                      </div>
                      <div className="text-[10px] text-emerald-200">
                        Team battles specialist
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-emerald-200">
                    11,280 XP
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-xl bg-black/40 p-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-slate-50">
                      3
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-50">
                        RohanOps
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Fastest solve: 14s
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-emerald-200">
                    9,760 XP
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-slate-400">
                Tip: Consistency beats perfection. Your daily missions power your
                climb more than one-off wins.
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-50">
              Unlockable badges & titles
            </h3>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
              <div className="mb-3 text-[11px] text-slate-400">
                Earn badges by finishing missions, winning battles, and maintaining
                streaks. Your badge board becomes your SQL story.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {badges.map((badge) => (
                  <div
                    key={badge.name}
                    className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-black/70 p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/80 to-cyan-400/80 text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.9)]">
                      {badge.icon}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-50">
                        {badge.name}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS + FAQ */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
          {/* Testimonials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-50">
              What players are saying
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-50">
                        {t.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{t.role}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
                      <Star className="h-3 w-3" />
                      Verified Player
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300">“{t.quote}”</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-50">
              FAQs before you enter the arena
            </h3>
            <div className="space-y-2 text-xs text-slate-200">
              {faqs.map((f) => {
                const isOpen = openFAQ === f.question;
                return (
                  <div
                    key={f.question}
                    className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80"
                  >
                    <button
                      onClick={() =>
                        setOpenFAQ((prev) => (prev === f.question ? null : f.question))
                      }
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                    >
                      <span className="text-[11px] font-semibold text-slate-100">
                        {f.question}
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 transition ${isOpen ? "rotate-180 text-emerald-300" : ""
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-800 bg-black/80 px-3 py-2 text-[11px] text-slate-300">
                        {f.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-black p-6 text-center sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),transparent_55%)]" />
          <div className="relative space-y-4">
            <h3 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
              Ready to enter the{" "}
              <span className="text-emerald-300">DataSense Battleground?</span>
            </h3>
            <p className="mx-auto max-w-xl text-sm text-slate-200">
              Invite your friends, choose a mode, and let SQL decide the winner. Turn
              practice into play—and play into real data skills.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={handleStartBattle}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_45px_rgba(34,197,94,0.9)] hover:scale-105 active:scale-95 transition"
              >
                <Play className="h-4 w-4" />
                Start Your First Battle
              </button>
              <button 
                onClick={handleStartBattle}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-black/80 px-6 py-2.5 text-sm font-medium text-emerald-100 hover:bg-emerald-500/10"
              >
                <Users className="h-4 w-4" />
                Create a Friends Lobby
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              No installs • Browser-based • Designed for learners, teams, and curious
              families.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

// import React, { useEffect, useRef, useState } from "react";
// import {
//   Play,
//   Users,
//   Trophy,
//   Sword,
//   Sparkles,
//   Zap,
//   Shield,
//   Code2,
//   Volume2,
//   VolumeX,
//   ChevronDown,
//   Star,
//   Gamepad2,
//   Crown,
// } from "lucide-react";
// import audio from "../../public/sound/battlesound.mp3";

// type GameMode = {
//   id: string;
//   name: string;
//   icon: React.ReactNode;
//   tag: string;
//   description: string;
//   details: string;
// };

// type PowerUp = {
//   name: string;
//   effect: string;
//   label: string;
// };

// type Badge = {
//   name: string;
//   icon: React.ReactNode;
//   description: string;
// };

// type FAQ = {
//   question: string;
//   answer: string;
// };

// type Testimonial = {
//   name: string;
//   role: string;
//   quote: string;
// };

// const gameModes: GameMode[] = [
//   {
//     id: "solo",
//     name: "Solo Training",
//     icon: <Code2 className="w-6 h-6" />,
//     tag: "Practice Mode",
//     description: "Sharpen your SQL skills at your own pace.",
//     details:
//       "Time-bound challenges, instant feedback, and progressive difficulty to help you build confidence query by query.",
//   },
//   {
//     id: "battle-royale",
//     name: "Battle Royale",
//     icon: <Sword className="w-6 h-6" />,
//     tag: "Competitive",
//     description: "Everyone gets the same SQL problem. Only the fastest survive.",
//     details:
//       "Compete against players in real time. Solve the challenge before the timer ends and climb the global ladder.",
//   },
//   {
//     id: "team-battle",
//     name: "Team Battles",
//     icon: <Users className="w-6 h-6" />,
//     tag: "Multiplayer",
//     description: "Squad up, split tasks, and solve together.",
//     details:
//       "Invite friends, form teams, and tackle scenario-based SQL missions that mimic real-world data problems.",
//   },
//   {
//     id: "daily",
//     name: "Daily Missions",
//     icon: <Zap className="w-6 h-6" />,
//     tag: "Streak Mode",
//     description: "One mission. Every day. Keep the streak alive.",
//     details:
//       "Solve one curated SQL mission daily, earn DS Coins, build streaks, and unlock exclusive cosmetic rewards.",
//   },
// ];

// const powerUps: PowerUp[] = [
//   {
//     name: "Time Freeze",
//     effect: "+30 seconds",
//     label: "Beat the timer when stakes are high.",
//   },
//   {
//     name: "Double XP",
//     effect: "2x XP",
//     label: "Rank up faster in intense battle nights.",
//   },
//   {
//     name: "Query Booster",
//     effect: "Smart hints",
//     label: "Context-aware tips on joins, filters, and groups.",
//   },
//   {
//     name: "Auto-Format",
//     effect: "Clean SQL",
//     label: "Instantly beautify your query before execution.",
//   },
// ];

// const badges: Badge[] = [
//   {
//     name: "Query Master",
//     icon: <Crown className="w-6 h-6" />,
//     description: "Finish 100+ missions with 90%+ accuracy.",
//   },
//   {
//     name: "Bug Slayer",
//     icon: <Shield className="w-6 h-6" />,
//     description: "Fix 50+ failing queries during battles.",
//   },
//   {
//     name: "Speed Demon",
//     icon: <Zap className="w-6 h-6" />,
//     description: "Win 10 battles in under 30 seconds each.",
//   },
//   {
//     name: "Data Guardian",
//     icon: <Trophy className="w-6 h-6" />,
//     description: "Top the weekly leaderboard at least once.",
//   },
// ];

// const faqs: FAQ[] = [
//   {
//     question: "What is DataSense Battleground?",
//     answer:
//       "DataSense Battleground is a multiplayer SQL gaming arena where you solve real SQL problems, fight coding battles, and compete with friends in real time.",
//   },
//   {
//     question: "Do I need SQL experience to start?",
//     answer:
//       "No. You can start as a complete beginner in practice mode and gradually move into competitive battles as you get comfortable.",
//   },
//   {
//     question: "Can I play with my friends and family?",
//     answer:
//       "Yes. Create private rooms, share invite links, and play SQL battles with friends, classmates, or teammates.",
//   },
//   {
//     question: "Are the SQL challenges real-world based?",
//     answer:
//       "Yes. Most challenges are modeled after realistic analytics, reporting, and product data problems you’d see in real jobs.",
//   },
//   {
//     question: "Is it free to play?",
//     answer:
//       "There will always be a free tier with regular missions. Premium tiers may include advanced missions, tournaments, and cosmetic rewards.",
//   },
//   {
//     question: "How does XP and ranking work?",
//     answer:
//       "Every mission earns you XP based on accuracy, speed, and difficulty. XP unlocks levels, badges, and leaderboard ranking.",
//   },
//   {
//     question: "Do I need to install anything?",
//     answer:
//       "No installation required. Just log in from your browser, join a lobby, and you’re ready to play.",
//   },
//   {
//     question: "Can this help in interviews?",
//     answer:
//       "Absolutely. Missions are designed around real SQL topics: joins, windows, aggregations, CTEs, subqueries, and more.",
//   },
// ];

// const testimonials: Testimonial[] = [
//   {
//     name: "Ramandeep",
//     role: "Data Analyst",
//     quote:
//       "It feels like a battle royale game, but every fight makes my SQL better. This is exactly how I wish I had learned earlier.",
//   },
//   {
//     name: "Prem Garg",
//     role: "Product Data & Analytics",
//     quote:
//       "It feels like a battle royale game, but every fight makes my SQL better. This is exactly how I wish I had learned earlier.",
//   },
//   {
//     name: "Shiwani Aggarwal",
//     role: "Aspiring Data Engineer",
//     quote:
//       "We host weekly family SQL battles. I’m literally teaching my brother SQL through this game.",
//   },
//   {
//     name: "Krishna B",
//     role: "Working Professional",
//     quote:
//       "I use Battleground as my daily 15-minute SQL gym. It keeps me sharp without feeling like dry practice.",
//   },

// ];

// const leaderboardTabs = ["Global"] as const;
// type LeaderboardTab = (typeof leaderboardTabs)[number];

// const Home: React.FC = () => {
//   const [selectedMode, setSelectedMode] = useState<GameMode>(gameModes[0]);
//   const [soundOn, setSoundOn] = useState<boolean>(false);
//   const [openFAQ, setOpenFAQ] = useState<string | null>(faqs[0]?.question ?? null);
//   const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>("Global");
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Initialize background sound
//   useEffect(() => {
//     // Optional: place a battlesound file in /public/sound/battlesound.mp3
//     // const audio = new Audio("/sound/battlesound.mp3");
//     const audioElement = new Audio(audio);
//     audioElement.loop = true;
//     audioElement.volume = 0.4;
//     audioRef.current = audioElement;

//     return () => {
//       audioElement.pause();
//       audioRef.current = null;
//     };
//   }, []);

//   useEffect(() => {
//     if (!audioRef.current) return;
//     if (soundOn) {
//       audioRef.current
//         .play()
//         .catch(() => {
//           // Autoplay restrictions – ignore errors
//         });
//     } else {
//       audioRef.current.pause();
//     }
//   }, [soundOn]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50 font-sans">
//       {/* Glowing background elements */}
//       <div className="pointer-events-none fixed inset-0 -z-10">
//         <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-500/30 via-transparent to-transparent blur-3xl" />
//         <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute -right-32 top-80 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
//         <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]" />
//       </div>

//       {/* Top navigation + sound toggle */}
//       <header className="sticky top-0 z-20 border-b border-emerald-500/20 bg-black/60 backdrop-blur-xl">
//         {/* <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"> */}
//         <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-5 sm:px-4 py-3">

//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-[0_0_30px_rgba(45,212,191,0.8)]">
//               <Gamepad2 className="h-6 w-6 text-slate-950" />
//             </div>
//             <div>
//               <div className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
//                 DataSense
//               </div>
//               <div className="text-sm font-semibold text-slate-50">
//                 Battleground
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setSoundOn((prev) => !prev)}
//               className="flex items-center gap-2 rounded-full border border-emerald-400/50 bg-black/70 px-3 py-1.5 text-xs font-medium text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.35)] transition hover:border-emerald-300 hover:bg-emerald-500/10"
//             >
//               {soundOn ? (
//                 <>
//                   <Volume2 className="h-4 w-4" />
//                   Sound: On
//                 </>
//               ) : (
//                 <>
//                   <VolumeX className="h-4 w-4" />
//                   Sound: Off
//                 </>
//               )}
//             </button>

//             <button className="hidden rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-400/60 hover:bg-emerald-500/10 sm:inline-flex">
//               Log In
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 space-y-16"> */}
//       <main className="w-full max-w-[1400px] mx-auto px-5 sm:px-4 space-y-12 pb-16 pt-6">
//         {/* <main className="w-full px-0 space-y-8"> */}


//         {/* HERO */}
//         <section className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
//           <div className="space-y-6">
//             <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.6)]">
//               <Sparkles className="h-3 w-3" />
//               DataSense Multiplayer SQL Arena
//             </div>

//             <h1 className="text-balance text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl md:text-5xl">
//               Turn SQL practice into an{" "}
//               <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
//                 epic battleground
//               </span>{" "}
//               with friends.
//             </h1>

//             <p className="max-w-xl text-sm text-slate-300 sm:text-base">
//               DataSense Battleground is a live, multiplayer coding arena where you
//               answer SQL challenges, fight bugs, and race against the clock with
//               teammates and rivals across the globe.
//             </p>

//             <div className="flex flex-wrap items-center gap-4">
//               <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_45px_rgba(34,197,94,0.9)] transition hover:shadow-[0_0_60px_rgba(34,197,94,1)]">
//                 <Play className="h-4 w-4" />
//                 Start Battle
//               </button>
//               <button className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/60 px-5 py-2.5 text-sm font-medium text-emerald-100 hover:border-emerald-300 hover:bg-emerald-500/10">
//                 <Users className="h-4 w-4" />
//                 Play with Friends
//               </button>
//             </div>

//             <div className="flex flex-wrap gap-6 pt-2 text-xs text-slate-300">
//               <div className="flex items-center gap-2">
//                 <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
//                 Live SQL engine – real queries, real output
//               </div>
//               <div className="flex items-center gap-2">
//                 <Star className="h-3 w-3 text-emerald-300" />
//                 Built for beginners to advanced players
//               </div>
//             </div>
//           </div>

//           {/* Hero visual – mock arena */}
//           <div className="relative">
//             <div className="relative overflow-hidden rounded-3xl border border-emerald-400/40 bg-gradient-to-b from-slate-900/90 to-black/90 p-4 shadow-[0_0_45px_rgba(16,185,129,0.6)]">
//               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),transparent_60%)] pointer-events-none" />
//               {/* Top bar */}
//               <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 text-[10px] text-slate-300">
//                 <div className="flex items-center gap-2">
//                   <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/90 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
//                   LIVE ARENA
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
//                     12 Players Online
//                   </span>
//                   <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
//                     Mode: Battle Royale
//                   </span>
//                 </div>
//               </div>

//               {/* Editor + Result mock */}
//               <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_minmax(0,1fr)]">
//                 <div className="relative rounded-xl border border-slate-800/80 bg-slate-950/90 p-3 text-xs text-emerald-100">
//                   <div className="mb-2 flex items-center justify-between text-[10px] text-slate-400">
//                     <span className="inline-flex items-center gap-1">
//                       <Code2 className="h-3 w-3 text-emerald-400" />
//                       DataSense query.sql
//                     </span>
//                     <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-emerald-200">
//                       Difficulty: Intermediate
//                     </span>
//                   </div>
//                   <pre className="font-mono leading-relaxed text-[11px] whitespace-pre-wrap text-emerald-100/90">
//                     {`SELECT  u.username,
//         COUNT(o.order_id) AS total_orders,
//         SUM(o.order_amount) AS total_spent
// FROM    users u
// JOIN    orders o
//   ON    u.id = o.user_id
// WHERE   o.order_date >= CURRENT_DATE - INTERVAL '30 days'
// GROUP BY u.username
// ORDER BY total_spent DESC
// LIMIT   10;`}
//                   </pre>
//                 </div>

//                 <div className="space-y-3">
//                   <div className="rounded-xl border border-emerald-400/30 bg-slate-950/90 p-3 text-xs">
//                     <div className="mb-2 flex items-center justify-between text-[10px] text-slate-300">
//                       <span>Leaderboard Snapshot</span>
//                       <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
//                         LIVE
//                       </span>
//                     </div>
//                     <div className="space-y-1.5 text-[11px] text-slate-200">
//                       <div className="flex items-center justify-between gap-2">
//                         <span className="flex items-center gap-1.5">
//                           <Crown className="h-3 w-3 text-amber-400" />
//                           Aarav_07
//                         </span>
//                         <span className="text-emerald-300">12,940 XP</span>
//                       </div>
//                       <div className="flex items-center justify-between gap-2">
//                         <span className="flex items-center gap-1.5">
//                           <Star className="h-3 w-3 text-slate-300" />
//                           MeeraSQL
//                         </span>
//                         <span className="text-emerald-200">11,280 XP</span>
//                       </div>
//                       <div className="flex items-center justify-between gap-2">
//                         <span className="flex items-center gap-1.5">
//                           <Star className="h-3 w-3 text-slate-400" />
//                           RohanOps
//                         </span>
//                         <span className="text-emerald-200">9,760 XP</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="rounded-xl border border-slate-800/80 bg-slate-950/90 p-3 text-xs text-slate-300">
//                     <div className="mb-1 text-[10px] text-slate-400">
//                       Battle Feed
//                     </div>
//                     <ul className="space-y-1.5 text-[11px]">
//                       <li className="flex items-center justify-between gap-2">
//                         <span className="text-emerald-200">
//                           ✓ Aarav_07 completed query in 23s
//                         </span>
//                         <span className="text-emerald-300">+320 XP</span>
//                       </li>
//                       <li className="flex items-center justify-between gap-2">
//                         <span className="text-slate-200">
//                           ! MeeraSQL fixed JOIN condition
//                         </span>
//                         <span className="text-emerald-300">+150 XP</span>
//                       </li>
//                       <li className="flex items-center justify-between gap-2">
//                         <span className="text-slate-200">
//                           ✦ RohanOps activated Time Freeze
//                         </span>
//                         <span className="text-emerald-300">+30s</span>
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>

//               {/* Grid floor */}
//               <div className="mt-4 h-20 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
//                 <div className="relative h-full w-full">
//                   <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(to_top,rgba(148,163,184,0.25)_1px,transparent_1px)] bg-[size:28px_20px] opacity-60" />
//                   <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* OVERVIEW + GAME MODES */}
//         <section className="space-y-10">
//           <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] lg:items-start">
//             {/* Overview */}
//             <div className="space-y-4">
//               <h2 className="text-2xl font-semibold text-slate-50">
//                 What is <span className="text-emerald-300">DataSense Battleground?</span>
//               </h2>
//               <p className="text-sm text-slate-300 sm:text-[15px]">
//                 It’s a cyber-style arena where SQL isn’t just practice—it’s a live
//                 battle. You write real queries, solve data missions, and win based on
//                 accuracy, speed, and creativity.
//               </p>
//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div className="rounded-2xl border border-emerald-500/30 bg-black/60 p-4 text-sm text-slate-200">
//                   <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
//                     <Sword className="h-4 w-4" />
//                     Real SQL Battles
//                   </div>
//                   <p className="text-xs text-slate-300">
//                     Every challenge runs against a real engine. You don’t just guess
//                     answers—you experience actual SQL output.
//                   </p>
//                 </div>
//                 <div className="rounded-2xl border border-emerald-500/30 bg-black/60 p-4 text-sm text-slate-200">
//                   <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
//                     <Users className="h-4 w-4" />
//                     Built for People
//                   </div>
//                   <p className="text-xs text-slate-300">
//                     Play with classmates, friends, colleagues, even family. Turn
//                     evenings into friendly SQL wars.
//                   </p>
//                 </div>
//               </div>
//               <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
//                 <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
//                   Why it works
//                 </div>
//                 <p>
//                   Games keep you coming back. Battleground uses streaks, XP,
//                   leaderboards, and cosmetics to make consistency feel natural—
//                   without losing the seriousness of real-world SQL skills.
//                 </p>
//               </div>
//             </div>

//             {/* Game modes */}
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold text-slate-50">
//                   Choose your battle mode
//                 </h3>
//                 <span className="text-[11px] text-slate-400">
//                   {gameModes.length} modes • more coming soon
//                 </span>
//               </div>
//               <div className="grid gap-3 sm:grid-cols-2">
//                 {gameModes.map((mode) => (
//                   <button
//                     key={mode.id}
//                     onClick={() => setSelectedMode(mode)}
//                     className={`group flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition ${selectedMode.id === mode.id
//                       ? "border-emerald-400/80 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.8)]"
//                       : "border-slate-800/90 bg-slate-950/70 hover:border-emerald-400/60 hover:bg-emerald-500/5"
//                       }`}
//                   >
//                     <div className="flex items-center gap-2">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/80 to-cyan-400/80 text-slate-950 shadow-[0_0_18px_rgba(45,212,191,0.8)]">
//                         {mode.icon}
//                       </div>
//                       <div>
//                         <div className="text-xs font-semibold text-slate-50">
//                           {mode.name}
//                         </div>
//                         <div className="text-[10px] uppercase tracking-wide text-emerald-300">
//                           {mode.tag}
//                         </div>
//                       </div>
//                     </div>
//                     <p className="text-[11px] text-slate-300">{mode.description}</p>
//                   </button>
//                 ))}
//               </div>
//               <div className="rounded-2xl border border-emerald-400/40 bg-black/80 p-4 text-xs text-slate-200">
//                 <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
//                   Mode Spotlight: {selectedMode.name}
//                 </div>
//                 <p>{selectedMode.details}</p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* POWER UPS + PLAYER STATS */}
//         <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
//           {/* Power Ups */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-slate-50">
//               Power-ups to change the battle
//             </h3>
//             <p className="text-xs text-slate-300">
//               Strategic boosts you can trigger during live matches to shift
//               momentum, save streaks, and pull off last-second wins.
//             </p>
//             <div className="grid gap-3 sm:grid-cols-2">
//               {powerUps.map((p) => (
//                 <div
//                   key={p.name}
//                   className="relative overflow-hidden rounded-2xl border border-emerald-400/40 bg-slate-950/80 p-3 text-xs text-slate-200"
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 opacity-60" />
//                   <div className="relative space-y-1.5">
//                     <div className="flex items-center justify-between">
//                       <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
//                         {p.name}
//                       </div>
//                       <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-100">
//                         {p.effect}
//                       </span>
//                     </div>
//                     <p className="text-[11px] text-slate-300">{p.label}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Mock Player Stats */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-slate-50">
//               Your player card in the arena
//             </h3>
//             <div className="rounded-3xl border border-emerald-400/40 bg-slate-950/80 p-4 shadow-[0_0_35px_rgba(16,185,129,0.6)]">
//               <div className="flex items-center justify-between gap-3">
//                 <div className="flex items-center gap-3">
//                   <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-400 to-emerald-400 shadow-[0_0_35px_rgba(45,212,191,0.9)]">
//                     <div className="absolute inset-[3px] flex items-center justify-center rounded-2xl bg-slate-950/90 text-emerald-300">
//                       <Gamepad2 className="h-6 w-6" />
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold text-slate-50">
//                       You (SQL_Warrior)
//                     </div>
//                     <div className="text-[11px] text-emerald-300">
//                       Level 12 • Rank: Platinum IV
//                     </div>
//                   </div>
//                 </div>
//                 <div className="rounded-xl bg-emerald-500/15 px-3 py-1 text-[10px] text-emerald-100">
//                   Streak: 7 days 🔥
//                 </div>
//               </div>

//               {/* XP bar */}
//               <div className="mt-4 space-y-1">
//                 <div className="flex items-center justify-between text-[11px] text-slate-400">
//                   <span>XP Progress</span>
//                   <span className="text-emerald-200">8,240 / 10,000</span>
//                 </div>
//                 <div className="h-2 rounded-full bg-slate-800">
//                   <div className="h-2 w-[78%] rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 shadow-[0_0_18px_rgba(16,185,129,0.9)]" />
//                 </div>
//               </div>

//               {/* Stats grid */}
//               <div className="mt-4 grid grid-cols-3 gap-3 text-[11px] text-slate-200">
//                 <div className="rounded-xl border border-slate-800 bg-black/70 p-2.5">
//                   <div className="text-[10px] text-slate-400">Battles Won</div>
//                   <div className="mt-1 text-sm font-semibold text-emerald-300">
//                     46
//                   </div>
//                 </div>
//                 <div className="rounded-xl border border-slate-800 bg-black/70 p-2.5">
//                   <div className="text-[10px] text-slate-400">Accuracy</div>
//                   <div className="mt-1 text-sm font-semibold text-emerald-300">
//                     92%
//                   </div>
//                 </div>
//                 <div className="rounded-xl border border-slate-800 bg-black/70 p-2.5">
//                   <div className="text-[10px] text-slate-400">Avg. Solve Time</div>
//                   <div className="mt-1 text-sm font-semibold text-emerald-300">
//                     31s
//                   </div>
//                 </div>
//               </div>

//               {/* Quick actions */}
//               <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
//                 <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 font-semibold text-slate-950 shadow-[0_0_25px_rgba(34,197,94,0.9)]">
//                   <Play className="h-3.5 w-3.5" />
//                   Resume Last Battle
//                 </button>
//                 <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald-400/50 bg-black/80 px-3 py-1.5 font-medium text-emerald-100">
//                   <Users className="h-3.5 w-3.5" />
//                   Create Private Room
//                 </button>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* LEADERBOARD + BADGES */}
//         <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
//           {/* Leaderboard */}
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-slate-50">
//                 Live leaderboard
//               </h3>
//               <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-black/70 p-1 text-[11px] text-slate-300">
//                 {leaderboardTabs.map((tab) => (
//                   <button
//                     key={tab}
//                     onClick={() => setLeaderboardTab(tab)}
//                     className={`rounded-full px-3 py-1 capitalize transition ${leaderboardTab === tab
//                       ? "bg-emerald-500 text-slate-950 shadow-[0_0_18px_rgba(34,197,94,0.8)]"
//                       : "text-slate-300 hover:text-emerald-200"
//                       }`}
//                   >
//                     {tab}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/80 p-4 text-xs text-slate-200">
//               <div className="mb-3 flex items-center justify-between">
//                 <div className="flex items-center gap-2 text-[11px] text-emerald-200">
//                   <Trophy className="h-4 w-4" />
//                   {leaderboardTab} Rankings
//                 </div>
//                 <div className="text-[10px] text-slate-400">
//                   Updated every few seconds
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 {/* Static sample rows - you can replace with real data */}
//                 <div className="flex items-center justify-between gap-2 rounded-xl bg-black/70 p-2.5">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950">
//                       1
//                     </div>
//                     <div>
//                       <div className="text-[11px] font-semibold text-slate-50">
//                         Aarav_07
//                       </div>
//                       <div className="text-[10px] text-emerald-300">
//                         Win streak: 9 • Accuracy: 95%
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right text-[11px] text-emerald-200">
//                     12,940 XP
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between gap-2 rounded-xl bg-black/50 p-2.5">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-slate-950">
//                       2
//                     </div>
//                     <div>
//                       <div className="text-[11px] font-semibold text-slate-50">
//                         MeeraSQL
//                       </div>
//                       <div className="text-[10px] text-emerald-200">
//                         Team battles specialist
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right text-[11px] text-emerald-200">
//                     11,280 XP
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between gap-2 rounded-xl bg-black/40 p-2.5">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-slate-50">
//                       3
//                     </div>
//                     <div>
//                       <div className="text-[11px] font-semibold text-slate-50">
//                         RohanOps
//                       </div>
//                       <div className="text-[10px] text-slate-400">
//                         Fastest solve: 14s
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right text-[11px] text-emerald-200">
//                     9,760 XP
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-3 text-[10px] text-slate-400">
//                 Tip: Consistency beats perfection. Your daily missions power your
//                 climb more than one-off wins.
//               </div>
//             </div>
//           </div>

//           {/* Badges */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-slate-50">
//               Unlockable badges & titles
//             </h3>
//             <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
//               <div className="mb-3 text-[11px] text-slate-400">
//                 Earn badges by finishing missions, winning battles, and maintaining
//                 streaks. Your badge board becomes your SQL story.
//               </div>
//               <div className="grid gap-3 sm:grid-cols-2">
//                 {badges.map((badge) => (
//                   <div
//                     key={badge.name}
//                     className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-black/70 p-3"
//                   >
//                     <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/80 to-cyan-400/80 text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.9)]">
//                       {badge.icon}
//                     </div>
//                     <div>
//                       <div className="text-[11px] font-semibold text-slate-50">
//                         {badge.name}
//                       </div>
//                       <div className="text-[11px] text-slate-300">
//                         {badge.description}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* TESTIMONIALS + FAQ */}
//         <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
//           {/* Testimonials */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-slate-50">
//               What players are saying
//             </h3>
//             <div className="grid gap-3 sm:grid-cols-2">
//               {testimonials.map((t) => (
//                 <div
//                   key={t.name}
//                   className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200"
//                 >
//                   <div className="mb-2 flex items-center justify-between gap-2">
//                     <div>
//                       <div className="text-[11px] font-semibold text-slate-50">
//                         {t.name}
//                       </div>
//                       <div className="text-[10px] text-slate-400">{t.role}</div>
//                     </div>
//                     <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
//                       <Star className="h-3 w-3" />
//                       Verified Player
//                     </div>
//                   </div>
//                   <p className="text-[11px] text-slate-300">“{t.quote}”</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* FAQ */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-slate-50">
//               FAQs before you enter the arena
//             </h3>
//             <div className="space-y-2 text-xs text-slate-200">
//               {faqs.map((f) => {
//                 const isOpen = openFAQ === f.question;
//                 return (
//                   <div
//                     key={f.question}
//                     className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80"
//                   >
//                     <button
//                       onClick={() =>
//                         setOpenFAQ((prev) => (prev === f.question ? null : f.question))
//                       }
//                       className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
//                     >
//                       <span className="text-[11px] font-semibold text-slate-100">
//                         {f.question}
//                       </span>
//                       <ChevronDown
//                         className={`h-3.5 w-3.5 text-slate-400 transition ${isOpen ? "rotate-180 text-emerald-300" : ""
//                           }`}
//                       />
//                     </button>
//                     {isOpen && (
//                       <div className="border-t border-slate-800 bg-black/80 px-3 py-2 text-[11px] text-slate-300">
//                         {f.answer}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </section>

//         {/* FINAL CTA */}
//         <section className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-black p-6 text-center sm:p-8">
//           <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),transparent_55%)]" />
//           <div className="relative space-y-4">
//             <h3 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
//               Ready to enter the{" "}
//               <span className="text-emerald-300">DataSense Battleground?</span>
//             </h3>
//             <p className="mx-auto max-w-xl text-sm text-slate-200">
//               Invite your friends, choose a mode, and let SQL decide the winner. Turn
//               practice into play—and play into real data skills.
//             </p>
//             <div className="flex flex-wrap justify-center gap-4">
//               <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_45px_rgba(34,197,94,0.9)]">
//                 <Play className="h-4 w-4" />
//                 Start Your First Battle
//               </button>
//               <button className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-black/80 px-6 py-2.5 text-sm font-medium text-emerald-100">
//                 <Users className="h-4 w-4" />
//                 Create a Friends Lobby
//               </button>
//             </div>
//             <p className="text-[11px] text-slate-400">
//               No installs • Browser-based • Designed for learners, teams, and curious
//               families.
//             </p>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default Home;





// // TEST SCRIPT FOR POPUP 1 /////






// import React, { useEffect, useMemo, useRef, useState, MouseEvent } from "react";
// import {
//   Flame,
//   Medal,
//   Shield,
//   Star,
//   Target,
//   Trophy,
//   Users,
//   Sword,
//   X,
//   Volume2,
//   VolumeX,
// } from "lucide-react";
// import { motion } from "framer-motion";

// type ChallengeMode = "solo" | "team" | "daily";

// type Badge = {
//   id: string;
//   name: string;
//   description: string;
//   xp: number;
//   rarity: "Common" | "Rare" | "Epic" | "Legendary";
// };

// type DailyChallenge = {
//   id: string;
//   title: string;
//   description: string;
//   xp: number;
// };

// type Player = {
//   name: string;
//   avatar: string;
// };

// const BADGES: Badge[] = [
//   {
//     id: "b1",
//     name: "First Blood",
//     description: "Win your first SQL battle.",
//     xp: 50,
//     rarity: "Common",
//   },
//   {
//     id: "b2",
//     name: "Headshot",
//     description: "Solve a question in under 10 seconds.",
//     xp: 75,
//     rarity: "Rare",
//   },
//   {
//     id: "b3",
//     name: "Squad Leader",
//     description: "Host 3 team battles.",
//     xp: 80,
//     rarity: "Rare",
//   },
//   {
//     id: "b4",
//     name: "Survivor",
//     description: "Finish a 30-minute battle without quitting.",
//     xp: 120,
//     rarity: "Epic",
//   },
//   {
//     id: "b5",
//     name: "Trigger Happy",
//     description: "Attempt 50 SQL questions in a day.",
//     xp: 150,
//     rarity: "Epic",
//   },
//   {
//     id: "b6",
//     name: "Sharpshooter",
//     description: "Maintain 90% accuracy for 20 questions.",
//     xp: 130,
//     rarity: "Epic",
//   },
//   {
//     id: "b7",
//     name: "Night Ops",
//     description: "Play a battle after midnight.",
//     xp: 60,
//     rarity: "Common",
//   },
//   {
//     id: "b8",
//     name: "Tactician",
//     description: "Win a battle on Advanced difficulty.",
//     xp: 140,
//     rarity: "Epic",
//   },
//   {
//     id: "b9",
//     name: "Medic",
//     description: "Revive a teammate’s score in team mode.",
//     xp: 90,
//     rarity: "Rare",
//   },
//   {
//     id: "b10",
//     name: "Collector",
//     description: "Unlock 10 different badges.",
//     xp: 200,
//     rarity: "Legendary",
//   },
//   {
//     id: "b11",
//     name: "Sniper",
//     description: "Solve 5 window function questions correctly.",
//     xp: 110,
//     rarity: "Epic",
//   },
//   {
//     id: "b12",
//     name: "Demolition Expert",
//     description: "Clear all questions in a joins-only battle.",
//     xp: 100,
//     rarity: "Rare",
//   },
//   {
//     id: "b13",
//     name: "Marathon Runner",
//     description: "Play battles for 7 days in a row.",
//     xp: 180,
//     rarity: "Legendary",
//   },
//   {
//     id: "b14",
//     name: "Ghost",
//     description: "Win a battle without any wrong answers.",
//     xp: 160,
//     rarity: "Epic",
//   },
//   {
//     id: "b15",
//     name: "SQL Commander",
//     description: "Reach level 10 overall.",
//     xp: 250,
//     rarity: "Legendary",
//   },
// ];

// const DAILY_CHALLENGES: DailyChallenge[] = [
//   {
//     id: "d1",
//     title: "Hardcore Win",
//     description: "Win one round on Advanced difficulty.",
//     xp: 50,
//   },
//   {
//     id: "d2",
//     title: "Warm Up",
//     description: "Attempt at least 10 questions today.",
//     xp: 30,
//   },
//   {
//     id: "d3",
//     title: "Combo Master",
//     description: "Score 5 correct answers in a row.",
//     xp: 40,
//   },
//   {
//     id: "d4",
//     title: "Joins Specialist",
//     description: "Complete a battle focused only on joins.",
//     xp: 45,
//   },
//   {
//     id: "d5",
//     title: "Speed Runner",
//     description: "Finish a 10-question battle in under 8 minutes.",
//     xp: 60,
//   },
//   {
//     id: "d6",
//     title: "Squad Tactics",
//     description: "Play at least one team battle.",
//     xp: 35,
//   },
//   {
//     id: "d7",
//     title: "Perfect Aim",
//     description: "Finish any battle without a wrong answer.",
//     xp: 70,
//   },
//   {
//     id: "d8",
//     title: "Night Shift",
//     description: "Play any battle between 11 PM and 4 AM.",
//     xp: 40,
//   },
//   {
//     id: "d9",
//     title: "Support Role",
//     description: "Help a teammate win a team match.",
//     xp: 45,
//   },
//   {
//     id: "d10",
//     title: "XP Hunter",
//     description: "Earn 150 XP in a single day.",
//     xp: 80,
//   },
// ];

// // 40-player pool, using 20 avatar files cyclically
// const RANDOM_NAMES = [
//   "DataSense", "Diya6", "Zara", "Kian", "Riya",
//   "Ayaan21", "Mia", "Kabir", "Sana", "Joel3",
//   "Samira", "Vikram2", "Lia", "Kara", "Tanish",
//   "Amira", "Eshan8", "Arya", "Ray", "Siya",
//   "Noah", "Olivia", "Liam", "Emma", "Sophia",
//   "Jake", "Logan", "Leo", "Ethan", "Ada",
//   "Miles", "Nora", "Jade21", "Aiden", "Kai",
//   "Mila", "Ryan", "Jonas34", "Eva"
// ];

// const PLAYER_POOL: Player[] = RANDOM_NAMES.map((name, i) => ({
//   name,
//   avatar: `/players/p${(i % 20) + 1}.png`
// }));

// // Particle config type
// type ParticleConfig = {
//   id: number;
//   left: number;
//   delay: number;
//   duration: number;
// };

// const SqlBattlegroundLobby: React.FC = () => {
//   const [mode, setMode] = useState<ChallengeMode>("solo");
//   const [timeMinutes, setTimeMinutes] = useState<number>(10);
//   const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
//   const [numQuestions, setNumQuestions] = useState<number>(10);
//   const [showDailyPopup, setShowDailyPopup] = useState<boolean>(true);
//   const [soundOn, setSoundOn] = useState<boolean>(true);
//   const [matchmakingActive, setMatchmakingActive] = useState<boolean>(true);

//   const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   const todayChallenge = useMemo(() => {
//     const today = new Date();
//     const index = today.getDate() % DAILY_CHALLENGES.length;
//     return DAILY_CHALLENGES[index];
//   }, []);

//   const difficultyColor =
//     difficulty === "Beginner"
//       ? "from-emerald-400 to-emerald-500"
//       : difficulty === "Intermediate"
//         ? "from-amber-400 to-amber-500"
//         : "from-rose-400 to-rose-500";

//   // Random selection of online players
//   const onlinePlayers = useMemo(() => {
//     const shuffled = [...PLAYER_POOL].sort(() => Math.random() - 0.5);
//     return shuffled.slice(0, 8);
//   }, []);

//   // Background sound
//   useEffect(() => {
//     if (!audioRef.current) return;
//     if (soundOn) {
//       audioRef.current.volume = 0.35;
//       audioRef.current.play().catch(() => {
//         // autoplay might be blocked; ignore
//       });
//     } else {
//       audioRef.current.pause();
//     }
//   }, [soundOn]);

//   // Particle configs
//   const particles: ParticleConfig[] = useMemo(
//     () =>
//       Array.from({ length: 25 }).map((_, i) => ({
//         id: i,
//         left: Math.random() * 100,
//         delay: Math.random() * 5,
//         duration: 8 + Math.random() * 4,
//       })),
//     []
//   );

//   // Parallax tilt handler (medium intensity)
//   const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = (e.clientX - rect.left) / rect.width; // 0 to 1
//     const y = (e.clientY - rect.top) / rect.height; // 0 to 1

//     const maxTilt = 6; // degrees, medium
//     const tiltX = (x - 0.5) * maxTilt * -1;
//     const tiltY = (y - 0.5) * maxTilt;

//     setTilt({ x: tiltX, y: tiltY });
//   };

//   const handleMouseLeave = () => {
//     setTilt({ x: 0, y: 0 });
//   };

//   return (
//     <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-white">
//       {/* Background image */}
//       {/* Cyber Rain Overlay */}
//       <div className="pointer-events-none absolute inset-0 overflow-hidden z-[2]">
//         <div className="cyber-rain"></div>
//       </div>
//       <div
//         className="absolute inset-0 bg-cover bg-center opacity-40"
//         style={{ backgroundImage: "url('/image/battle1')" }}
//       />
//       {/* Dark overlay */}
//       <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950" />

//       {/* Animated HUD lines */}
//       <motion.div
//         className="pointer-events-none absolute inset-0"
//         initial={{ opacity: 0.4 }}
//         animate={{ opacity: [0.2, 0.5, 0.2] }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//       >
//         <div className="absolute left-0 top-1/3 h-px w-full bg-cyan-500/10" />
//         <div className="absolute left-0 top-2/3 h-px w-full bg-cyan-500/10" />
//       </motion.div>

//       {/* Floating particles */}
//       <motion.div
//         className="pointer-events-none absolute inset-0"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 0.5 }}
//         transition={{ duration: 2 }}
//       >
//         {particles.map((p) => (
//           <motion.div
//             key={p.id}
//             className="absolute h-1 w-1 rounded-full bg-cyan-400"
//             style={{ left: `${p.left}%` }}
//             initial={{ y: "110%", opacity: 0 }}
//             animate={{ y: "-10%", opacity: [0.1, 0.7, 0.1] }}
//             transition={{
//               duration: p.duration,
//               delay: p.delay,
//               repeat: Infinity,
//               ease: "linear",
//             }}
//           />
//         ))}
//       </motion.div>

//       {/* Soft moving glow / fog */}
//       <motion.div
//         className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%)]"
//         animate={{ x: ["0%", "4%", "0%"], y: ["0%", "-3%", "0%"] }}
//         transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Ambient sound */}
//       <audio ref={audioRef} src="/sound/battle_bg.mp3" loop />

//       {/* MAIN CONTENT WITH PARALLAX */}
//       <motion.div
//         // className="relative z-10 mx-auto flex h-full max-w-6xl flex-col px-5 py-3"
//         className="relative z-10 w-full max-w-[1400px] mx-auto flex h-full flex-col px-8 py-3"

//         style={{ transformStyle: "preserve-3d" }}
//         animate={{ rotateX: tilt.y, rotateY: tilt.x }}
//         transition={{ type: "spring", stiffness: 80, damping: 15, mass: 0.5 }}
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//       >
//         {/* HEADER BAR */}
//         <div className="mb-2 flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-extrabold tracking-wide">
//               <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
//                 SQL Battleground
//               </span>
//             </h1>
//             <p className="text-[11px] text-slate-300/80">
//               Configure your mission, squad up, and drop into the arena.
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             {/* Sound toggle */}
//             <button
//               onClick={() => setSoundOn((prev) => !prev)}
//               className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/60 bg-slate-900/80 text-xs shadow-[0_0_12px_rgba(34,211,238,0.5)] hover:bg-slate-800 transition"
//             >
//               {soundOn ? (
//                 <Volume2 className="h-4 w-4 text-cyan-300" />
//               ) : (
//                 <VolumeX className="h-4 w-4 text-cyan-300" />
//               )}
//             </button>

//             {/* Player snapshot */}
//             <div className="rounded-xl border border-cyan-400/40 bg-slate-900/80 px-4 py-2 text-[10px]">
//               <div className="flex items-center gap-2">
//                 <Shield className="h-4 w-4 text-cyan-400" />
//                 <span className="font-semibold">Level 9 &mdash; Query Ranger</span>
//               </div>
//               <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-slate-800">
//                 <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300" />
//               </div>
//               <div className="mt-0.5 flex justify-between text-[9px] text-slate-300">
//                 <span>XP: 1,380 / 1,800</span>
//                 <span>Win Streak: 3 🔥</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* MAIN GRID */}
//         <div className="grid flex-1 grid-cols-[2fr,1fr] gap-4">
//           {/* LEFT SIDE */}
//           <div className="flex flex-col gap-3 overflow-hidden">
//             {/* Choose Challenge */}
//             <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-3 shadow-lg shadow-black/40">
//               <div className="mb-2 flex items-center justify-between">
//                 <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide">
//                   <Sword className="h-4 w-4 text-cyan-400" />
//                   Choose Your Challenge
//                 </h2>
//                 <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">
//                   Lobby · Mission Setup
//                 </span>
//               </div>
//               <div className="mb-3 grid grid-cols-3 rounded-full bg-slate-800/80 p-1 text-[11px] font-semibold">
//                 <ModePill
//                   label="Solo Training"
//                   active={mode === "solo"}
//                   onClick={() => setMode("solo")}
//                 />
//                 <ModePill
//                   label="Team Battle"
//                   active={mode === "team"}
//                   onClick={() => setMode("team")}
//                 />
//                 <ModePill
//                   label="Daily Challenge"
//                   active={mode === "daily"}
//                   onClick={() => setMode("daily")}
//                 />
//               </div>
//               <SliderRow
//                 label="Time"
//                 display={`${timeMinutes} Min`}
//                 min={5}
//                 max={30}
//                 step={5}
//                 value={timeMinutes}
//                 onChange={setTimeMinutes}
//               />
//             </div>

//             {/* Difficulty */}
//             <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-3 shadow-lg shadow-black/40">
//               <div className="mb-2 flex items-center justify-between">
//                 <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide">
//                   <Target className="h-4 w-4 text-emerald-400" />
//                   Difficulty
//                 </h2>
//               </div>
//               <div className="mb-3 grid grid-cols-3 rounded-full bg-slate-800/80 p-1 text-[11px] font-semibold">
//                 <DifficultyPill
//                   label="Beginner"
//                   active={difficulty === "Beginner"}
//                   onClick={() => setDifficulty("Beginner")}
//                 />
//                 <DifficultyPill
//                   label="Intermediate"
//                   active={difficulty === "Intermediate"}
//                   onClick={() => setDifficulty("Intermediate")}
//                 />
//                 <DifficultyPill
//                   label="Advanced"
//                   active={difficulty === "Advanced"}
//                   onClick={() => setDifficulty("Advanced")}
//                 />
//               </div>
//               <SliderRow
//                 label="Number of Questions"
//                 display={`${numQuestions} Questions`}
//                 min={5}
//                 max={25}
//                 step={5}
//                 value={numQuestions}
//                 onChange={setNumQuestions}
//               />
//             </div>

//             {/* Focus + preview row */}
//             <div className="grid flex-1 grid-cols-[1.5fr,1fr] gap-3">
//               {/* Focus Areas */}
//               <div className="flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900/80 p-3 shadow-lg shadow-black/40">
//                 <div className="mb-2 flex items-center justify-between">
//                   <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide">
//                     <Flame className="h-4 w-4 text-orange-400" />
//                     Focus Areas
//                   </h2>
//                   <span className="text-[9px] text-slate-400">Pick 3–4</span>
//                 </div>
//                 <div className="flex flex-wrap gap-1.5 text-[10px]">
//                   {[
//                     "Selection",
//                     "Filtering",
//                     "Sorting",
//                     "Aggregation",
//                     "Group By",
//                     "Having",
//                     "Joins",
//                     "Self Join",
//                     "Window Fn",
//                     "CTE",
//                     "Subqueries",
//                     "Ranking",
//                     "Regex",
//                     "Time Fn",
//                     "Case When",
//                   ].map((topic) => (
//                     <button
//                       key={topic}
//                       className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 hover:border-cyan-400 hover:bg-cyan-500/10 transition-colors"
//                     >
//                       {topic}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Challenge preview + stats + Start button */}
//               <div className="flex flex-col rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-900/95 to-slate-950 p-3 shadow-lg shadow-black/60">
//                 <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-wide">
//                   <Trophy className="h-4 w-4 text-amber-300" />
//                   Challenge Preview
//                 </h3>
//                 <div className="space-y-1 text-[10px] text-slate-200">
//                   <PreviewRow
//                     label="Type"
//                     value={
//                       mode === "solo"
//                         ? "Bullet Surge"
//                         : mode === "team"
//                           ? "Squad Clash"
//                           : "Daily Ops"
//                     }
//                   />
//                   <PreviewRow label="Time" value={`${timeMinutes} min`} />
//                   <PreviewRow label="Difficulty" value={difficulty} />
//                   <PreviewRow label="Questions" value={`${numQuestions}`} />
//                   <PreviewRow label="XP Reward" value={`${numQuestions * 5} XP`} />
//                 </div>

//                 {/* Small stats row */}
//                 <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[9px]">
//                   <MiniStat label="Total Wins" value="12" />
//                   <MiniStat label="Best Streak" value="5" />
//                   <MiniStat label="Accuracy" value="87%" />
//                 </div>

//                 {/* Start Challenge button with pulse */}
//                 <motion.button
//                   className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${difficultyColor} px-3 py-2 text-xs font-bold text-slate-900 shadow-[0_0_18px_rgba(34,211,238,0.6)]`}
//                   animate={{ scale: [1, 1.04, 1] }}
//                   transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
//                 >
//                   <PlayIcon />
//                   Start Challenge
//                 </motion.button>
//               </div>
//             </div>

//             {/* Bottom battle stats + matchmaking */}
//             <div className="grid grid-cols-[2fr,1fr] gap-3">
//               {/* Stats mini-panel */}
//               <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-3 text-center text-[10px] shadow-lg shadow-black/40">
//                 <div className="grid grid-cols-3 gap-3">
//                   <MiniStat label="Matches Today" value="3" />
//                   <MiniStat label="Daily XP Boost" value="+20%" />
//                   <MiniStat label="Queue Status" value="Squad Ready" />
//                 </div>
//               </div>

//               {/* Matchmaking animation */}
//               <div className="flex items-center justify-center rounded-2xl border border-cyan-500/50 bg-slate-900/90 p-3 text-[10px] shadow-lg shadow-cyan-500/30">
//                 {matchmakingActive ? (
//                   <div className="flex items-center gap-2 text-cyan-300">
//                     <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
//                     <span className="font-semibold">
//                       Searching for squadmates
//                       <AnimatedDots />
//                     </span>
//                   </div>
//                 ) : (
//                   <span className="text-slate-300">Queue Paused</span>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* RIGHT SIDE */}
//           <div className="flex flex-col gap-3 overflow-hidden">
//             {/* Player Level Snapshot */}
//             <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900/95 via-slate-900 to-slate-950 p-3 shadow-lg shadow-black/60">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-[10px] font-semibold text-cyan-300/90">
//                     Player Level
//                   </p>
//                   <p className="text-sm font-bold">Level 9 · JOIN Table Pro</p>
//                 </div>
//                 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 border border-cyan-400/70 text-[10px] font-bold shadow-[0_0_16px_rgba(34,211,238,0.6)]">
//                   XP
//                 </div>
//               </div>
//               <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
//                 <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300" />
//               </div>
//               <div className="mt-1 flex justify-between text-[9px] text-slate-300">
//                 <span>Total XP: 1,380</span>
//                 <span>Next Level in 420 XP</span>
//               </div>
//             </div>

//             {/* Missions & Badges - scrollable */}
//             <div className="flex-1 rounded-2xl border border-slate-700/70 bg-slate-900/85 p-3 shadow-md shadow-black/50">
//               <div className="mb-2 flex items-center justify-between">
//                 <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide">
//                   <Medal className="h-4 w-4 text-amber-300" />
//                   Missions, Achievements & Badges
//                 </h2>
//                 <span className="text-[9px] text-slate-400">
//                   {BADGES.length} unlocked targets
//                 </span>
//               </div>
//               <div className="h-[120px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
//                 {BADGES.map((badge) => (
//                   <div
//                     key={badge.id}
//                     className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-900/90 px-2 py-1.5"
//                   >
//                     <div className="flex items-center gap-2">
//                       <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800">
//                         <Star className="h-3 w-3 text-amber-300" />
//                       </span>
//                       <div>
//                         <p className="font-semibold">{badge.name}</p>
//                         <p className="text-[9px] text-slate-400">
//                           {badge.description}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right text-[9px]">
//                       <p className="text-xs font-semibold text-emerald-300">
//                         +{badge.xp} XP
//                       </p>
//                       <p className="text-[9px] text-slate-400">{badge.rarity}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Daily Challenges + Leaderboard row */}
//             <div className="grid grid-cols-2 gap-3">
//               {/* Daily Challenges (3 shown) */}
//               <div className="rounded-2xl border border-amber-400/40 bg-slate-900/90 p-3 text-[10px] shadow-md shadow-black/50">
//                 <div className="mb-1.5 flex items-center justify-between">
//                   <h2 className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide">
//                     <Flame className="h-4 w-4 text-amber-400" />
//                     Daily Challenges
//                   </h2>
//                   <span className="text-[9px] text-amber-300">+Bonus XP</span>
//                 </div>
//                 <div className="space-y-1.5">
//                   {DAILY_CHALLENGES.slice(0, 3).map((ch) => (
//                     <div
//                       key={ch.id}
//                       className="rounded-lg border border-slate-700 bg-slate-900/90 px-2 py-1.5"
//                     >
//                       <p className="font-semibold">{ch.title}</p>
//                       <p className="text-[9px] text-slate-400">
//                         {ch.description}
//                       </p>
//                       <p className="mt-0.5 text-[9px] font-semibold text-emerald-300">
//                         Reward: +{ch.xp} XP
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Leaderboard (5 shown) */}
//               <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-3 text-[10px] shadow-md shadow-black/50">
//                 <div className="mb-1.5 flex items-center justify-between">
//                   <h2 className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide">
//                     <Trophy className="h-4 w-4 text-yellow-300" />
//                     Leaderboard
//                   </h2>
//                 </div>
//                 <div className="space-y-1">
//                   {[
//                     { name: "Riya", xp: 260 },
//                     { name: "Arjun", xp: 198 },
//                     { name: "You", xp: 188 },
//                     { name: "Neha", xp: 120 },
//                     { name: "Karan", xp: 88 },
//                   ].map((item, index) => (
//                     <div
//                       key={item.name}
//                       className="flex items-center justify-between rounded-lg bg-slate-900/95 px-2 py-1"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[9px]">
//                           #{index + 1}
//                         </span>
//                         <span>{item.name}</span>
//                       </div>
//                       <span className="text-[10px] font-semibold text-emerald-300">
//                         {item.xp} XP
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Online Players - horizontal squad strip */}
//             <div className="mt-1 flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-[10px] shadow-[0_-4px_12px_rgba(15,23,42,0.9)]">
//               <p className="flex items-center gap-1.5 font-semibold">
//                 <Users className="h-4 w-4 text-emerald-400" />
//                 Players Online
//               </p>
//               <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
//                 {onlinePlayers.map((p) => (
//                   <div
//                     key={p.name}
//                     className="flex flex-col items-center rounded-full bg-slate-800/80 px-2 py-1 border border-slate-700/90"
//                   >
//                     <div className="h-7 w-7 overflow-hidden rounded-full border border-cyan-400/70 bg-slate-900">
//                       <img
//                         src={p.avatar}
//                         alt={p.name}
//                         className="h-full w-full object-cover"
//                         onError={(e) => {
//                           (e.target as HTMLImageElement).style.display = "none";
//                         }}
//                       />
//                     </div>
//                     <span className="mt-0.5 text-[9px]">{p.name}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* DAILY CHALLENGE POPUP */}
//         {showDailyPopup && (
//           <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
//             <div className="w-full max-w-md rounded-2xl border border-amber-400/60 bg-slate-950/95 p-5 shadow-[0_0_40px_rgba(251,191,36,0.45)]">
//               <div className="mb-3 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Flame className="h-5 w-5 text-amber-300" />
//                   <h2 className="text-sm font-bold tracking-wide">
//                     Today&apos;s Operation
//                   </h2>
//                 </div>
//                 <button
//                   onClick={() => setShowDailyPopup(false)}
//                   className="rounded-full bg-slate-800/80 p-1 hover:bg-slate-700"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//               <p className="mb-3 text-[11px] text-slate-300">
//                 Complete this daily challenge for a bonus XP boost.
//               </p>
//               <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-[12px]">
//                 <p className="mb-1 text-xs font-semibold text-amber-300">
//                   {todayChallenge.title}
//                 </p>
//                 <p className="mb-2 text-[11px] text-slate-200">
//                   {todayChallenge.description}
//                 </p>
//                 <p className="text-[11px] font-semibold text-emerald-300">
//                   Reward: +{todayChallenge.xp} XP
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowDailyPopup(false)}
//                 className="mt-4 w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2 text-xs font-semibold text-slate-900 hover:brightness-110 transition"
//               >
//                 Accept Mission
//               </button>
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// /* ------------------- small components ------------------- */

// const ModePill: React.FC<{
//   label: string;
//   active: boolean;
//   onClick: () => void;
// }> = ({ label, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`rounded-full px-3 py-1.5 text-center transition-all ${active
//       ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-900 shadow-[0_0_16px_rgba(34,211,238,0.7)]"
//       : "text-slate-300 hover:bg-slate-700/80"
//       }`}
//   >
//     {label}
//   </button>
// );

// const DifficultyPill: React.FC<{
//   label: string;
//   active: boolean;
//   onClick: () => void;
// }> = ({ label, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`rounded-full px-3 py-1.5 text-center transition-all ${active
//       ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 shadow-[0_0_14px_rgba(52,211,153,0.7)]"
//       : "text-slate-300 hover:bg-slate-700/80"
//       }`}
//   >
//     {label}
//   </button>
// );

// const SliderRow: React.FC<{
//   label: string;
//   display: string;
//   min: number;
//   max: number;
//   step: number;
//   value: number;
//   onChange: (v: number) => void;
// }> = ({ label, display, min, max, step, value, onChange }) => (
//   <div className="space-y-1">
//     <div className="flex items-center justify-between text-[10px] text-slate-200">
//       <span>{label}</span>
//       <span className="font-semibold text-cyan-300">{display}</span>
//     </div>
//     <input
//       type="range"
//       min={min}
//       max={max}
//       step={step}
//       value={value}
//       onChange={(e) => onChange(Number(e.target.value))}
//       className="w-full accent-cyan-400"
//     />
//     <div className="flex justify-between text-[9px] text-slate-500">
//       <span>{min}</span>
//       <span>{max}</span>
//     </div>
//   </div>
// );

// const PreviewRow: React.FC<{ label: string; value: string }> = ({
//   label,
//   value,
// }) => (
//   <div className="flex justify-between">
//     <span className="text-slate-400">{label}</span>
//     <span className="font-semibold text-slate-50">{value}</span>
//   </div>
// );

// const MiniStat: React.FC<{ label: string; value: string }> = ({
//   label,
//   value,
// }) => (
//   <div>
//     <p className="text-[9px] text-slate-400">{label}</p>
//     <p className="text-xs font-semibold text-cyan-300">{value}</p>
//   </div>
// );

// const PlayIcon: React.FC = () => (
//   <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80">
//     <svg
//       className="h-3 w-3"
//       viewBox="0 0 16 16"
//       fill="currentColor"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path d="M4 3.5v9l8-4.5-8-4.5z" />
//     </svg>
//   </span>
// );

// const AnimatedDots: React.FC = () => {
//   return (
//     <span className="inline-flex">
//       <motion.span
//         className="mx-0.5"
//         animate={{ opacity: [0.2, 1, 0.2] }}
//         transition={{ duration: 0.9, repeat: Infinity }}
//       >
//         .
//       </motion.span>
//       <motion.span
//         className="mx-0.5"
//         animate={{ opacity: [0.2, 1, 0.2] }}
//         transition={{ duration: 0.9, repeat: Infinity, delay: 0.3 }}
//       >
//         .
//       </motion.span>
//       <motion.span
//         className="mx-0.5"
//         animate={{ opacity: [0.2, 1, 0.2] }}
//         transition={{ duration: 0.9, repeat: Infinity, delay: 0.6 }}
//       >
//         .
//       </motion.span>
//     </span>
//   );
// };

// export default SqlBattlegroundLobby;








// // //// Test Script for popup 2 ////







// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   MouseEvent,
// } from "react";
// import {
//   Flame,
//   Medal,
//   Shield,
//   Star,
//   Target,
//   Trophy,
//   Users,
//   Sword,
//   X,
//   Volume2,
//   VolumeX,
// } from "lucide-react";
// import { motion } from "framer-motion";

// type ChallengeMode = "solo" | "team" | "daily";

// type Badge = {
//   id: string;
//   name: string;
//   description: string;
//   xp: number;
//   rarity: "Common" | "Rare" | "Epic" | "Legendary";
// };

// type DailyChallenge = {
//   id: string;
//   title: string;
//   description: string;
//   xp: number;
// };

// type Player = {
//   name: string;
//   avatar: string;
// };

// const BADGES: Badge[] = [
//   {
//     id: "b1",
//     name: "First Blood",
//     description: "Win your first SQL battle.",
//     xp: 50,
//     rarity: "Common",
//   },
//   {
//     id: "b2",
//     name: "Headshot",
//     description: "Solve a question in under 10 seconds.",
//     xp: 75,
//     rarity: "Rare",
//   },
//   {
//     id: "b3",
//     name: "Squad Leader",
//     description: "Host 3 team battles.",
//     xp: 80,
//     rarity: "Rare",
//   },
//   {
//     id: "b4",
//     name: "Survivor",
//     description: "Finish a 30-minute battle without quitting.",
//     xp: 120,
//     rarity: "Epic",
//   },
//   {
//     id: "b5",
//     name: "Trigger Happy",
//     description: "Attempt 50 SQL questions in a day.",
//     xp: 150,
//     rarity: "Epic",
//   },
//   {
//     id: "b6",
//     name: "Sharpshooter",
//     description: "Maintain 90% accuracy for 20 questions.",
//     xp: 130,
//     rarity: "Epic",
//   },
//   {
//     id: "b7",
//     name: "Night Ops",
//     description: "Play a battle after midnight.",
//     xp: 60,
//     rarity: "Common",
//   },
//   {
//     id: "b8",
//     name: "Tactician",
//     description: "Win a battle on Advanced difficulty.",
//     xp: 140,
//     rarity: "Epic",
//   },
//   {
//     id: "b9",
//     name: "Medic",
//     description: "Revive a teammate’s score in team mode.",
//     xp: 90,
//     rarity: "Rare",
//   },
//   {
//     id: "b10",
//     name: "Collector",
//     description: "Unlock 10 different badges.",
//     xp: 200,
//     rarity: "Legendary",
//   },
//   {
//     id: "b11",
//     name: "Sniper",
//     description: "Solve 5 window function questions correctly.",
//     xp: 110,
//     rarity: "Epic",
//   },
//   {
//     id: "b12",
//     name: "Demolition Expert",
//     description: "Clear all questions in a joins-only battle.",
//     xp: 100,
//     rarity: "Rare",
//   },
//   {
//     id: "b13",
//     name: "Marathon Runner",
//     description: "Play battles for 7 days in a row.",
//     xp: 180,
//     rarity: "Legendary",
//   },
//   {
//     id: "b14",
//     name: "Ghost",
//     description: "Win a battle without any wrong answers.",
//     xp: 160,
//     rarity: "Epic",
//   },
//   {
//     id: "b15",
//     name: "SQL Commander",
//     description: "Reach level 10 overall.",
//     xp: 250,
//     rarity: "Legendary",
//   },
// ];

// const DAILY_CHALLENGES: DailyChallenge[] = [
//   {
//     id: "d1",
//     title: "Hardcore Win",
//     description: "Win one round on Advanced difficulty.",
//     xp: 50,
//   },
//   {
//     id: "d2",
//     title: "Warm Up",
//     description: "Attempt at least 10 questions today.",
//     xp: 30,
//   },
//   {
//     id: "d3",
//     title: "Combo Master",
//     description: "Score 5 correct answers in a row.",
//     xp: 40,
//   },
//   {
//     id: "d4",
//     title: "Joins Specialist",
//     description: "Complete a battle focused only on joins.",
//     xp: 45,
//   },
//   {
//     id: "d5",
//     title: "Speed Runner",
//     description: "Finish a 10-question battle in under 8 minutes.",
//     xp: 60,
//   },
//   {
//     id: "d6",
//     title: "Squad Tactics",
//     description: "Play at least one team battle.",
//     xp: 35,
//   },
//   {
//     id: "d7",
//     title: "Perfect Aim",
//     description: "Finish any battle without a wrong answer.",
//     xp: 70,
//   },
//   {
//     id: "d8",
//     title: "Night Shift",
//     description: "Play any battle between 11 PM and 4 AM.",
//     xp: 40,
//   },
//   {
//     id: "d9",
//     title: "Support Role",
//     description: "Help a teammate win a team match.",
//     xp: 45,
//   },
//   {
//     id: "d10",
//     title: "XP Hunter",
//     description: "Earn 150 XP in a single day.",
//     xp: 80,
//   },
// ];

// // 40-player pool, using 20 avatar files cyclically
// const RANDOM_NAMES = [
//   "DataSense",
//   "Diya6",
//   "Zara",
//   "Kian",
//   "Riya",
//   "Ayaan21",
//   "Mia",
//   "Kabir",
//   "Sana",
//   "Joel3",
//   "Samira",
//   "Vikram2",
//   "Lia",
//   "Kara",
//   "Tanish",
//   "Amira",
//   "Eshan8",
//   "Arya",
//   "Ray",
//   "Siya",
//   "Noah",
//   "Olivia",
//   "Liam",
//   "Emma",
//   "Sophia",
//   "Jake",
//   "Logan",
//   "Leo",
//   "Ethan",
//   "Ada",
//   "Miles",
//   "Nora",
//   "Jade21",
//   "Aiden",
//   "Kai",
//   "Mila",
//   "Ryan",
//   "Jonas34",
//   "Eva",
// ];

// const PLAYER_POOL: Player[] = RANDOM_NAMES.map((name, i) => ({
//   name,
//   avatar: `/players/p${(i % 20) + 1}.png`,
// }));

// type ParticleConfig = {
//   id: number;
//   left: number;
//   delay: number;
//   duration: number;
// };

// const SqlBattlegroundLobby: React.FC = () => {
//   const [mode, setMode] = useState<ChallengeMode>("solo");
//   const [timeMinutes, setTimeMinutes] = useState<number>(10);
//   const [difficulty, setDifficulty] = useState<
//     "Beginner" | "Intermediate" | "Advanced"
//   >("Beginner");
//   const [numQuestions, setNumQuestions] = useState<number>(10);
//   const [showDailyPopup, setShowDailyPopup] = useState<boolean>(true);
//   const [soundOn, setSoundOn] = useState<boolean>(true);
//   const [matchmakingActive, setMatchmakingActive] = useState<boolean>(true);
//   const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   const todayChallenge = useMemo(() => {
//     const today = new Date();
//     const index = today.getDate() % DAILY_CHALLENGES.length;
//     return DAILY_CHALLENGES[index];
//   }, []);

//   const difficultyColor =
//     difficulty === "Beginner"
//       ? "from-cyan-300 via-cyan-400 to-emerald-300"
//       : difficulty === "Intermediate"
//       ? "from-amber-300 via-amber-400 to-orange-300"
//       : "from-fuchsia-400 via-rose-500 to-amber-300";

//   const onlinePlayers = useMemo(() => {
//     const shuffled = [...PLAYER_POOL].sort(() => Math.random() - 0.5);
//     return shuffled.slice(0, 8);
//   }, []);

//   // Background sound
//   useEffect(() => {
//     if (!audioRef.current) return;
//     if (soundOn) {
//       audioRef.current.volume = 0.35;
//       audioRef.current.play().catch(() => {});
//     } else {
//       audioRef.current.pause();
//     }
//   }, [soundOn]);

//   // Particle configs
//   const particles: ParticleConfig[] = useMemo(
//     () =>
//       Array.from({ length: 30 }).map((_, i) => ({
//         id: i,
//         left: Math.random() * 100,
//         delay: Math.random() * 5,
//         duration: 8 + Math.random() * 4,
//       })),
//     []
//   );

//   // Parallax tilt handler
//   const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = (e.clientX - rect.left) / rect.width;
//     const y = (e.clientY - rect.top) / rect.height;

//     const maxTilt = 7;
//     const tiltX = (x - 0.5) * maxTilt * -1;
//     const tiltY = (y - 0.5) * maxTilt;

//     setTilt({ x: tiltX, y: tiltY });
//   };

//   const handleMouseLeave = () => {
//     setTilt({ x: 0, y: 0 });
//   };

//   return (
//     <div className="relative h-screen w-full overflow-hidden bg-[#05070b] text-white">
//       {/* BACKGROUND LAYERS */}
//       {/* Base battleground image */}
//       {/* Cyber Rain Overlay */}
// {/* Cyber Rain Overlay */}
// <div className="pointer-events-none absolute inset-0 overflow-hidden z-[2]">
//   <div className="cyber-rain"></div>
// </div>
//       <div
//         className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
//         style={{ backgroundImage: "url('/image/battle1')" }}
//       />
//       {/* Dark multi-gradient wash */}
//       <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(234,179,8,0.18),_transparent_55%),linear-gradient(to_bottom,_#020617_0%,_#020617_18%,_#020617_45%,_#020617_65%,_black_100%)] mix-blend-soft-light" />
//       {/* Diagonal cyber stripes */}
//       <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.2)_1px,transparent_1px)] bg-[length:140px_140px] opacity-[0.18]" />

//       {/* Horizontal HUD scan lines */}
//       <motion.div
//         className="pointer-events-none absolute inset-0"
//         initial={{ opacity: 0.25 }}
//         animate={{ opacity: [0.18, 0.4, 0.22] }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//       >
//         <div className="absolute left-0 top-1/4 h-px w-full bg-cyan-400/15" />
//         <div className="absolute left-0 top-1/2 h-px w-full bg-amber-400/15" />
//         <div className="absolute left-0 top-3/4 h-px w-full bg-cyan-400/15" />
//       </motion.div>

//       {/* Floating neon particles */}
//       <motion.div
//         className="pointer-events-none absolute inset-0"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 0.75 }}
//         transition={{ duration: 2 }}
//       >
//         {particles.map((p) => (
//           <motion.div
//             key={p.id}
//             className="absolute h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.8)]"
//             style={{ left: `${p.left}%` }}
//             initial={{ y: "110%", opacity: 0 }}
//             animate={{ y: "-10%", opacity: [0.1, 1, 0.2] }}
//             transition={{
//               duration: p.duration,
//               delay: p.delay,
//               repeat: Infinity,
//               ease: "linear",
//             }}
//           />
//         ))}
//       </motion.div>

//       {/* Holographic moving fog */}
//       <motion.div
//         className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(234,179,8,0.16),_transparent_60%)] mix-blend-screen"
//         animate={{ x: ["0%", "4%", "0%"], y: ["0%", "-3%", "0%"] }}
//         transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Ambient sound */}
//       <audio ref={audioRef} src="/sound/battle_bg.mp3" loop />

//       {/* MAIN CONTENT WITH TILT */}
//       <motion.div
//         // className="relative z-10 mx-auto flex h-full max-w-6xl flex-col px-5 py-4"
//         className="relative z-10 w-full max-w-[1400px] mx-auto flex h-full flex-col px-8 py-4"

//         style={{ transformStyle: "preserve-3d" }}
//         animate={{ rotateX: tilt.y, rotateY: tilt.x }}
//         transition={{ type: "spring", stiffness: 80, damping: 15, mass: 0.5 }}
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//       >
//         {/* TOP HUD BAR */}
//         <div className="mb-3 flex items-center justify-between">
//           <div className="space-y-1">
//             <h1 className="text-[22px] font-extrabold tracking-[0.28em] text-xs sm:text-sm leading-5">
//               <span className="rounded-sm bg-gradient-to-r from-cyan-400 via-amber-300 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(56,189,248,0.65)]">
//                 SQL BATTLEGROUND
//               </span>
//             </h1>
//             <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300/80">
//               FUTURISTIC RANKED ARENA · DATA OPS
//             </p>
//           </div>

//           <div className="flex items-stretch gap-3">
//             {/* Server metrics */}
//             <div className="hidden sm:flex items-center gap-3 rounded-xl border border-slate-700/80 bg-[#050814]/90 px-3 py-2 text-[10px] shadow-[0_0_20px_rgba(15,23,42,0.85)]">
//               <div className="space-y-0.5">
//                 <p className="text-[9px] text-slate-400">SERVER</p>
//                 <p className="text-xs font-semibold text-amber-300">
//                   ASIA-SOUTH · DS-ARENA-01
//                 </p>
//               </div>
//               <div className="h-8 w-px bg-slate-700/60" />
//               <div className="space-y-0.5">
//                 <p className="text-[9px] text-slate-400">MATCH PING</p>
//                 <p className="text-xs font-semibold text-cyan-300">
//                   38 ms <span className="text-[8px] text-slate-400">STABLE</span>
//                 </p>
//               </div>
//             </div>

//             {/* Sound toggle */}
//             <button
//               onClick={() => setSoundOn((prev) => !prev)}
//               className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-[#050814]/90 text-xs shadow-[0_0_20px_rgba(34,211,238,0.7)] hover:bg-slate-900 transition"
//             >
//               {soundOn ? (
//                 <Volume2 className="h-4 w-4 text-cyan-300" />
//               ) : (
//                 <VolumeX className="h-4 w-4 text-cyan-300" />
//               )}
//             </button>

//             {/* Player snapshot */}
//             <div className="hidden sm:block rounded-xl border border-slate-600/80 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%),linear-gradient(to_bottom,#020617,#020617)] px-4 py-2 text-[10px] shadow-[0_0_26px_rgba(15,23,42,0.95)]">
//               <div className="flex items-center justify-between gap-4">
//                 <div className="flex items-center gap-2">
//                   <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/70 bg-slate-950/90 shadow-[0_0_18px_rgba(234,179,8,0.6)]">
//                     <Shield className="h-4 w-4 text-amber-300" />
//                   </div>
//                   <div>
//                     <p className="text-[9px] text-slate-400">SQUAD ROLE</p>
//                     <p className="text-xs font-semibold uppercase tracking-wide">
//                       Level 9 · Query Ranger
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-[9px] text-amber-300/90">
//                   STREAK: <span className="font-semibold text-amber-200">3🔥</span>
//                 </div>
//               </div>
//               <div className="mt-2 h-1.5 w-56 overflow-hidden rounded-full bg-slate-800/80">
//                 <div className="relative h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300">
//                   <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.15)_20%,transparent_20%,transparent_40%,rgba(15,23,42,0.15)_40%,rgba(15,23,42,0.15)_60%,transparent_60%,transparent_80%,rgba(15,23,42,0.15)_80%)] bg-[length:14px_14px] opacity-70" />
//                 </div>
//               </div>
//               <div className="mt-0.5 flex justify-between text-[9px] text-slate-300">
//                 <span>XP: 1,380 / 1,800</span>
//                 <span>BOOST: +10% RANKED XP</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* MAIN GRID */}
//         <div className="grid flex-1 grid-cols-[2fr,1fr] gap-4">
//           {/* LEFT SIDE */}
//           <div className="flex flex-col gap-3 overflow-hidden">
//             {/* CHALLENGE SETUP */}
//             <div className="rounded-2xl border border-slate-700/80 bg-[#050812]/95 p-3 shadow-[0_0_24px_rgba(15,23,42,0.9)]">
//               <div className="mb-2 flex items-center justify-between">
//                 <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-200">
//                   <Sword className="h-4 w-4 text-amber-400" />
//                   Mission Configuration
//                 </h2>
//                 <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500">
//                   LOBBY · PREP
//                 </span>
//               </div>

//               <div className="mb-3 grid grid-cols-3 rounded-full bg-gradient-to-r from-[#020617] via-[#050814] to-[#020617] p-1 text-[11px] font-semibold border border-slate-700/80">
//                 <ModePill
//                   label="Solo Training"
//                   active={mode === "solo"}
//                   onClick={() => setMode("solo")}
//                 />
//                 <ModePill
//                   label="Team Battle"
//                   active={mode === "team"}
//                   onClick={() => setMode("team")}
//                 />
//                 <ModePill
//                   label="Daily Ops"
//                   active={mode === "daily"}
//                   onClick={() => setMode("daily")}
//                 />
//               </div>

//               <SliderRow
//                 label="ROUND DURATION"
//                 display={`${timeMinutes} Min`}
//                 min={5}
//                 max={30}
//                 step={5}
//                 value={timeMinutes}
//                 onChange={setTimeMinutes}
//               />
//             </div>

//             {/* DIFFICULTY */}
//             <div className="rounded-2xl border border-slate-700/80 bg-[#050812]/95 p-3 shadow-[0_0_24px_rgba(15,23,42,0.9)]">
//               <div className="mb-2 flex items-center justify-between">
//                 <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-200">
//                   <Target className="h-4 w-4 text-cyan-300" />
//                   Difficulty Tier
//                 </h2>
//                 <span className="text-[9px] text-slate-500">
//                   SCALE: BEGINNER · INT · ADV
//                 </span>
//               </div>
//               <div className="mb-3 grid grid-cols-3 rounded-full bg-gradient-to-r from-[#020617] via-[#050814] to-[#020617] p-1 text-[11px] font-semibold border border-slate-700/80">
//                 <DifficultyPill
//                   label="Beginner"
//                   active={difficulty === "Beginner"}
//                   onClick={() => setDifficulty("Beginner")}
//                 />
//                 <DifficultyPill
//                   label="Intermediate"
//                   active={difficulty === "Intermediate"}
//                   onClick={() => setDifficulty("Intermediate")}
//                 />
//                 <DifficultyPill
//                   label="Advanced"
//                   active={difficulty === "Advanced"}
//                   onClick={() => setDifficulty("Advanced")}
//                 />
//               </div>
//               <SliderRow
//                 label="QUESTION COUNT"
//                 display={`${numQuestions} Questions`}
//                 min={5}
//                 max={25}
//                 step={5}
//                 value={numQuestions}
//                 onChange={setNumQuestions}
//               />
//             </div>

//             {/* FOCUS + PREVIEW */}
//             <div className="grid flex-1 grid-cols-[1.5fr,1fr] gap-3">
//               {/* Focus Areas */}
//               <div className="flex flex-col rounded-2xl border border-slate-700/80 bg-gradient-to-b from-[#050814]/95 via-[#020617]/95 to-black p-3 shadow-[0_0_24px_rgba(15,23,42,0.95)]">
//                 <div className="mb-2 flex items-center justify-between">
//                   <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-200">
//                     <Flame className="h-4 w-4 text-amber-400" />
//                     Tactical Focus
//                   </h2>
//                   <span className="text-[9px] text-slate-400">PICK 3–4</span>
//                 </div>
//                 <div className="flex flex-wrap gap-1.5 text-[10px]">
//                   {[
//                     "Selection",
//                     "Filtering",
//                     "Sorting",
//                     "Aggregation",
//                     "Group By",
//                     "Having",
//                     "Joins",
//                     "Self Join",
//                     "Window Fn",
//                     "CTE",
//                     "Subqueries",
//                     "Ranking",
//                     "Regex",
//                     "Time Fn",
//                     "Case When",
//                   ].map((topic) => (
//                     <button
//                       key={topic}
//                       className="rounded-full border border-slate-700/90 bg-[#050814]/90 px-2.5 py-1 text-slate-200 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-100 transition-colors"
//                     >
//                       {topic}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Challenge preview */}
//               <div className="flex flex-col rounded-2xl border border-slate-700/90 bg-gradient-to-b from-[#050814]/98 via-[#020617]/95 to-black p-3 shadow-[0_0_26px_rgba(15,23,42,1)]">
//                 <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-200">
//                   <Trophy className="h-4 w-4 text-amber-300" />
//                   Mission Snapshot
//                 </h3>
//                 <div className="space-y-1 text-[10px] text-slate-200">
//                   <PreviewRow
//                     label="PLAYLIST"
//                     value={
//                       mode === "solo"
//                         ? "Bullet Surge · Solo"
//                         : mode === "team"
//                         ? "Squad Clash · 4v4"
//                         : "Daily Ops · Ranked"
//                     }
//                   />
//                   <PreviewRow label="DURATION" value={`${timeMinutes} min`} />
//                   <PreviewRow label="DIFFICULTY" value={difficulty} />
//                   <PreviewRow label="QUESTIONS" value={`${numQuestions}`} />
//                   <PreviewRow
//                     label="XP REWARD"
//                     value={`${numQuestions * 5} XP + BONUS`}
//                   />
//                 </div>

//                 {/* Small stats row */}
//                 <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[9px]">
//                   <MiniStat label="Total Wins" value="12" />
//                   <MiniStat label="Best Streak" value="5" />
//                   <MiniStat label="Accuracy" value="87%" />
//                 </div>

//                 {/* Start button */}
//                 <motion.button
//                   className={`relative mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300/80 bg-gradient-to-r ${difficultyColor} px-3 py-2 text-xs font-bold text-slate-900 shadow-[0_0_30px_rgba(234,179,8,0.75)] ring-1 ring-amber-200/70`}
//                   animate={{ scale: [1, 1.04, 1] }}
//                   transition={{
//                     duration: 1.4,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                 >
//                   <div className="pointer-events-none absolute inset-0 rounded-lg bg-[linear-gradient(120deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0)_55%,rgba(255,255,255,0.25)_100%)] opacity-0 hover:opacity-100 transition-opacity" />
//                   <PlayIcon />
//                   START MISSION
//                 </motion.button>
//               </div>
//             </div>

//             {/* Bottom stats + matchmaking */}
//             <div className="grid grid-cols-[2fr,1fr] gap-3">
//               {/* Stats panel */}
//               <div className="rounded-2xl border border-slate-700/80 bg-[#050814]/95 p-3 text-center text-[10px] shadow-[0_0_22px_rgba(15,23,42,0.9)]">
//                 <div className="grid grid-cols-3 gap-3">
//                   <MiniStat label="Matches Today" value="3" />
//                   <MiniStat label="Daily XP Boost" value="+20%" />
//                   <MiniStat label="Queue Status" value="Squad Ready" />
//                 </div>
//               </div>

//               {/* Matchmaking radar */}
//               <div className="flex items-center justify-center rounded-2xl border border-cyan-500/60 bg-[#020816]/95 p-3 text-[10px] shadow-[0_0_26px_rgba(56,189,248,0.9)]">
//                 {matchmakingActive ? (
//                   <div className="flex items-center gap-3 text-cyan-200">
//                     <RadarPulse />
//                     <div className="space-y-0.5">
//                       <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em]">
//                         Matchmaking
//                       </p>
//                       <p className="font-semibold">
//                         Searching for squadmates
//                         <AnimatedDots />
//                       </p>
//                       <p className="text-[9px] text-slate-400">
//                         Estimated time &lt; 0:15
//                       </p>
//                     </div>
//                   </div>
//                 ) : (
//                   <span className="text-slate-300">Queue Paused</span>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* RIGHT SIDE */}
//           <div className="flex flex-col gap-3 overflow-hidden">
//             {/* Player Level Snapshot */}
//             <div className="rounded-2xl border border-cyan-400/50 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%),linear-gradient(to_bottom,#020617,#020617,#000)] p-3 shadow-[0_0_30px_rgba(56,189,248,0.95)]">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-[9px] font-semibold text-cyan-200/90">
//                     PLAYER PROGRESSION
//                   </p>
//                   <p className="text-sm font-bold uppercase tracking-wide">
//                     Level 9 · Join Table Pro
//                   </p>
//                 </div>
//                 <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/80 bg-[#020617]/95 text-[10px] font-bold shadow-[0_0_22px_rgba(56,189,248,0.9)]">
//                   XP
//                 </div>
//               </div>
//               <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/90">
//                 <div className="relative h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300">
//                   <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.3)_25%,transparent_25%,transparent_50%,rgba(15,23,42,0.3)_50%,rgba(15,23,42,0.3)_75%,transparent_75%,transparent_100%)] bg-[length:16px_16px] opacity-70" />
//                 </div>
//               </div>
//               <div className="mt-1 flex justify-between text-[9px] text-slate-300">
//                 <span>Total XP: 1,380</span>
//                 <span>Next Level in 420 XP</span>
//               </div>
//             </div>

//             {/* Missions & Badges */}
//             <div className="flex-1 rounded-2xl border border-slate-700/80 bg-gradient-to-b from-[#050814]/96 via-[#020617]/96 to-black p-3 shadow-[0_0_26px_rgba(15,23,42,1)]">
//               <div className="mb-2 flex items-center justify-between">
//                 <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-200">
//                   <Medal className="h-4 w-4 text-amber-300" />
//                   Missions & Badges
//                 </h2>
//                 <span className="text-[9px] text-slate-400">
//                   {BADGES.length} unlocked targets
//                 </span>
//               </div>
//               <div className="h-[120px] space-y-1.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
//                 {BADGES.map((badge) => (
//                   <div
//                     key={badge.id}
//                     className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-[#020617]/95 px-2 py-1.5 hover:border-amber-300/70 hover:bg-amber-500/5 transition-colors"
//                   >
//                     <div className="flex items-center gap-2">
//                       <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/90 border border-amber-300/70 shadow-[0_0_14px_rgba(234,179,8,0.7)]">
//                         <Star className="h-3 w-3 text-amber-300" />
//                       </span>
//                       <div>
//                         <p className="text-[11px] font-semibold">{badge.name}</p>
//                         <p className="text-[9px] text-slate-400">
//                           {badge.description}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right text-[9px]">
//                       <p className="text-xs font-semibold text-emerald-300">
//                         +{badge.xp} XP
//                       </p>
//                       <p className="text-[9px] text-amber-300/90">
//                         {badge.rarity}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Daily + Leaderboard */}
//             <div className="grid grid-cols-2 gap-3">
//               {/* Daily Challenges */}
//               <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-b from-[#12090a]/95 via-[#020617]/96 to-black p-3 text-[10px] shadow-[0_0_24px_rgba(234,179,8,0.75)]">
//                 <div className="mb-1.5 flex items-center justify-between">
//                   <h2 className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-100">
//                     <Flame className="h-4 w-4 text-amber-400" />
//                     Daily Contracts
//                   </h2>
//                   <span className="text-[9px] text-amber-300">+Bonus XP</span>
//                 </div>
//                 <div className="space-y-1.5">
//                   {DAILY_CHALLENGES.slice(0, 3).map((ch) => (
//                     <div
//                       key={ch.id}
//                       className="rounded-lg border border-slate-700/80 bg-[#020617]/95 px-2 py-1.5"
//                     >
//                       <p className="text-[11px] font-semibold text-slate-100">
//                         {ch.title}
//                       </p>
//                       <p className="text-[9px] text-slate-400">
//                         {ch.description}
//                       </p>
//                       <p className="mt-0.5 text-[9px] font-semibold text-emerald-300">
//                         Reward: +{ch.xp} XP
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Leaderboard */}
//               <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-b from-[#050814]/96 via-[#020617]/96 to-black p-3 text-[10px] shadow-[0_0_24px_rgba(15,23,42,0.95)]">
//                 <div className="mb-1.5 flex items-center justify-between">
//                   <h2 className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-200">
//                     <Trophy className="h-4 w-4 text-yellow-300" />
//                     Global Board
//                   </h2>
//                 </div>
//                 <div className="space-y-1">
//                   {[
//                     { name: "Riya", xp: 260 },
//                     { name: "Arjun", xp: 198 },
//                     { name: "You", xp: 188 },
//                     { name: "Neha", xp: 120 },
//                     { name: "Karan", xp: 88 },
//                   ].map((item, index) => (
//                     <div
//                       key={item.name}
//                       className={`flex items-center justify-between rounded-lg px-2 py-1 ${
//                         item.name === "You"
//                           ? "bg-gradient-to-r from-cyan-500/15 via-emerald-400/10 to-transparent border border-cyan-400/70"
//                           : "bg-slate-950/95 border border-slate-700/90"
//                       }`}
//                     >
//                       <div className="flex items-center gap-2">
//                         <span
//                           className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${
//                             index === 0
//                               ? "bg-amber-400/80 text-slate-950 shadow-[0_0_14px_rgba(234,179,8,0.8)]"
//                               : "bg-slate-800 text-slate-100"
//                           }`}
//                         >
//                           #{index + 1}
//                         </span>
//                         <span>{item.name}</span>
//                       </div>
//                       <span className="text-[10px] font-semibold text-emerald-300">
//                         {item.xp} XP
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Online Players */}
//             <div className="mt-1 flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-gradient-to-r from-[#020617]/96 via-[#050814]/96 to-black px-3 py-2 text-[10px] shadow-[0_-4px_18px_rgba(15,23,42,0.95)]">
//               <p className="flex items-center gap-1.5 font-semibold text-slate-100 uppercase tracking-[0.18em] text-[9px]">
//                 <Users className="h-4 w-4 text-emerald-400" />
//                 Live Players
//               </p>
//               <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
//                 {onlinePlayers.map((p) => (
//                   <div
//                     key={p.name}
//                     className="flex flex-col items-center rounded-full bg-[#020617]/95 px-2 py-1 border border-slate-700/90 shadow-[0_0_16px_rgba(15,23,42,0.9)]"
//                   >
//                     <div className="h-7 w-7 overflow-hidden rounded-full border border-cyan-400/80 bg-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.85)]">
//                       <img
//                         src={p.avatar}
//                         alt={p.name}
//                         className="h-full w-full object-cover"
//                         onError={(e) => {
//                           (e.target as HTMLImageElement).style.display = "none";
//                         }}
//                       />
//                     </div>
//                     <span className="mt-0.5 text-[9px] text-slate-200">
//                       {p.name}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* DAILY CHALLENGE POPUP */}
//         {showDailyPopup && (
//           <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md">
//             <div className="w-full max-w-md rounded-2xl border border-amber-400/70 bg-gradient-to-b from-[#1a1006]/98 via-[#020617]/98 to-black p-5 shadow-[0_0_40px_rgba(251,191,36,0.6)]">
//               <div className="mb-3 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Flame className="h-5 w-5 text-amber-300" />
//                   <h2 className="text-sm font-bold tracking-[0.22em] uppercase">
//                     Today&apos;s Operation
//                   </h2>
//                 </div>
//                 <button
//                   onClick={() => setShowDailyPopup(false)}
//                   className="rounded-full bg-slate-900/90 p-1 hover:bg-slate-800"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//               <p className="mb-3 text-[11px] text-slate-300">
//                 Complete this daily contract to unlock a bonus XP multiplier for
//                 ranked missions.
//               </p>
//               <div className="rounded-xl border border-slate-700/90 bg-[#020617]/95 p-3 text-[12px] shadow-[0_0_18px_rgba(15,23,42,0.9)]">
//                 <p className="mb-1 text-xs font-semibold text-amber-300 uppercase tracking-[0.12em]">
//                   {todayChallenge.title}
//                 </p>
//                 <p className="mb-2 text-[11px] text-slate-200">
//                   {todayChallenge.description}
//                 </p>
//                 <p className="text-[11px] font-semibold text-emerald-300">
//                   Reward: +{todayChallenge.xp} XP + Bonus
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowDailyPopup(false)}
//                 className="mt-4 w-full rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 py-2 text-xs font-semibold text-slate-900 shadow-[0_0_22px_rgba(234,179,8,0.85)] hover:brightness-110 transition"
//               >
//                 Accept Mission
//               </button>
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// /* ------------------- small components ------------------- */

// const ModePill: React.FC<{
//   label: string;
//   active: boolean;
//   onClick: () => void;
// }> = ({ label, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`rounded-full px-3 py-1.5 text-center transition-all ${
//       active
//         ? "bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300 text-slate-900 shadow-[0_0_20px_rgba(56,189,248,0.9)]"
//         : "text-slate-300 hover:bg-slate-800/80"
//     }`}
//   >
//     {label}
//   </button>
// );

// const DifficultyPill: React.FC<{
//   label: string;
//   active: boolean;
//   onClick: () => void;
// }> = ({ label, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`rounded-full px-3 py-1.5 text-center transition-all ${
//       active
//         ? "bg-gradient-to-r from-emerald-400 via-amber-300 to-fuchsia-400 text-slate-900 shadow-[0_0_20px_rgba(52,211,153,0.9)]"
//         : "text-slate-300 hover:bg-slate-800/80"
//     }`}
//   >
//     {label}
//   </button>
// );

// const SliderRow: React.FC<{
//   label: string;
//   display: string;
//   min: number;
//   max: number;
//   step: number;
//   value: number;
//   onChange: (v: number) => void;
// }> = ({ label, display, min, max, step, value, onChange }) => (
//   <div className="space-y-1">
//     <div className="flex items-center justify-between text-[10px] text-slate-200">
//       <span className="tracking-[0.16em] text-[9px] text-slate-400 uppercase">
//         {label}
//       </span>
//       <span className="font-semibold text-cyan-300">{display}</span>
//     </div>
//     <input
//       type="range"
//       min={min}
//       max={max}
//       step={step}
//       value={value}
//       onChange={(e) => onChange(Number(e.target.value))}
//       className="w-full accent-cyan-400"
//     />
//     <div className="flex justify-between text-[9px] text-slate-500">
//       <span>{min}</span>
//       <span>{max}</span>
//     </div>
//   </div>
// );

// const PreviewRow: React.FC<{ label: string; value: string }> = ({
//   label,
//   value,
// }) => (
//   <div className="flex justify-between">
//     <span className="text-[9px] text-slate-400 tracking-[0.16em] uppercase">
//       {label}
//     </span>
//     <span className="text-[11px] font-semibold text-slate-50">{value}</span>
//   </div>
// );

// const MiniStat: React.FC<{ label: string; value: string }> = ({
//   label,
//   value,
// }) => (
//   <div>
//     <p className="text-[9px] text-slate-500 tracking-[0.16em] uppercase">
//       {label}
//     </p>
//     <p className="text-xs font-semibold text-cyan-300">{value}</p>
//   </div>
// );

// const PlayIcon: React.FC = () => (
//   <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 border border-slate-800 shadow-[0_0_12px_rgba(15,23,42,0.8)]">
//     <svg
//       className="h-3 w-3"
//       viewBox="0 0 16 16"
//       fill="currentColor"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path d="M4 3.5v9l8-4.5-8-4.5z" />
//     </svg>
//   </span>
// );

// const AnimatedDots: React.FC = () => {
//   return (
//     <span className="inline-flex">
//       <motion.span
//         className="mx-0.5"
//         animate={{ opacity: [0.2, 1, 0.2] }}
//         transition={{ duration: 0.9, repeat: Infinity }}
//       >
//         .
//       </motion.span>
//       <motion.span
//         className="mx-0.5"
//         animate={{ opacity: [0.2, 1, 0.2] }}
//         transition={{ duration: 0.9, repeat: Infinity, delay: 0.3 }}
//       >
//         .
//       </motion.span>
//       <motion.span
//         className="mx-0.5"
//         animate={{ opacity: [0.2, 1, 0.2] }}
//         transition={{ duration: 0.9, repeat: Infinity, delay: 0.6 }}
//       >
//         .
//       </motion.span>
//     </span>
//   );
// };

// const RadarPulse: React.FC = () => (
//   <div className="relative h-10 w-10">
//     <div className="absolute inset-0 rounded-full border border-cyan-400/60 bg-cyan-500/5" />
//     <motion.div
//       className="absolute inset-1 rounded-full border border-cyan-300/60"
//       animate={{ rotate: 360 }}
//       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
//     />
//     <motion.div
//       className="absolute inset-0.5 rounded-full border-t-2 border-t-cyan-300/80 border-l-transparent border-r-transparent border-b-transparent"
//       animate={{ rotate: 360 }}
//       transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
//     />
//     <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
//   </div>
// );

// export default SqlBattlegroundLobby;
