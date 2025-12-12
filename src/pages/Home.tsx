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
      audioRef.current.play().catch(() => { });
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
            <img src="/images/logo.png" alt="Logo" className="h-10 w-auto cursor-pointer" onClick={() => window.location.href = "https://practice.datasenseai.com/"} />
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
