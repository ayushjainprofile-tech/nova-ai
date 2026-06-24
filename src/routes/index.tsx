import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  ImageIcon,
  Video,
  Bot,
  History,
  Star,
  Settings,
  Paperclip,
  Mic,
  ArrowUp,
  Sparkles,
  Plus,
  Upload,
  Wand2,
  AudioLines,
  Globe,
  Pin,
  Heart,
  Search,
  Bell,
  ChevronRight,
} from "lucide-react";
import mascot from "@/assets/mascot.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova — Your AI Workspace" },
      { name: "description", content: "A premium AI workspace for chats, agents, images and more." },
    ],
  }),
  component: Index,
});

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: MessageSquare, label: "AI Chats" },
  { icon: FileText, label: "Documents" },
  { icon: ImageIcon, label: "Images" },
  { icon: Video, label: "Videos" },
  { icon: Bot, label: "Agents" },
  { icon: History, label: "History" },
  { icon: Star, label: "Favorites" },
  { icon: Settings, label: "Settings" },
];

const categories = ["All", "Assistants", "Coding", "Writing", "Design", "Research", "Education"];

type Bot = {
  name: string;
  desc: string;
  category: string;
  rating: number;
  users: string;
  color: string;
  initial: string;
};

const bots: Bot[] = [
  { name: "Code Mentor", desc: "Pair-programs and reviews code in 40+ languages.", category: "Coding", rating: 4.9, users: "128k", color: "bg-brand-purple", initial: "C" },
  { name: "Design Copilot", desc: "Generates layouts, palettes and UI specs.", category: "Design", rating: 4.8, users: "92k", color: "bg-brand-pink", initial: "D" },
  { name: "Startup Advisor", desc: "From idea validation to GTM strategy.", category: "Assistants", rating: 4.9, users: "74k", color: "bg-brand-yellow", initial: "S" },
  { name: "Research Genius", desc: "Reads papers and summarizes findings.", category: "Research", rating: 4.7, users: "61k", color: "bg-brand-green", initial: "R" },
  { name: "Study Buddy", desc: "Personal tutor for any subject, any level.", category: "Education", rating: 4.8, users: "210k", color: "bg-brand-cream", initial: "B" },
  { name: "Copy Wizard", desc: "Writes ads, emails and landing copy that converts.", category: "Writing", rating: 4.6, users: "48k", color: "bg-brand-pink", initial: "W" },
  { name: "Data Analyst", desc: "Explores CSVs and creates instant charts.", category: "Research", rating: 4.8, users: "33k", color: "bg-brand-purple", initial: "A" },
  { name: "Brand Stylist", desc: "Crafts brand voice, moodboards and naming.", category: "Design", rating: 4.7, users: "27k", color: "bg-brand-yellow", initial: "B" },
];

const quickActions = [
  { icon: Plus, label: "Create Agent", color: "bg-brand-pink" },
  { icon: Upload, label: "Upload File", color: "bg-brand-yellow" },
  { icon: Wand2, label: "Generate Image", color: "bg-brand-purple" },
  { icon: AudioLines, label: "Voice Chat", color: "bg-brand-green" },
  { icon: Globe, label: "Web Search", color: "bg-brand-cream" },
];

const favoriteBots = [
  { name: "Code Mentor", desc: "Online · GPT-5", status: "online", color: "bg-brand-purple", initial: "C" },
  { name: "Design Copilot", desc: "Online · Claude 3.7", status: "online", color: "bg-brand-pink", initial: "D" },
  { name: "Research Genius", desc: "Idle · Gemini Pro", status: "idle", color: "bg-brand-green", initial: "R" },
];

const conversations = [
  { title: "Landing page hero copy", time: "2m ago", pinned: true, preview: "Try opening with a bold one-liner about…" },
  { title: "Refactor auth middleware", time: "1h ago", pinned: true, preview: "Here's a cleaner version using…" },
  { title: "Trip planner for Lisbon", time: "Yesterday", pinned: false, preview: "Day 1: Belém district, pastéis de…" },
  { title: "Q4 marketing brief", time: "2d ago", pinned: false, preview: "I'd structure the campaign around…" },
];

function Index() {
  const [activeCat, setActiveCat] = useState("All");
  const visibleBots = activeCat === "All" ? bots : bots.filter((b) => b.category === activeCat);

  return (
    <div className="min-h-screen w-full bg-canvas p-3 text-ink">
      <div className="flex gap-3 h-[calc(100vh-1.5rem)]">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-[18%] min-w-[220px] flex-col rounded-[28px] bg-sidebar p-5 text-sidebar-foreground">
          <div className="flex items-center gap-2.5 px-2 pb-6">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-brand-yellow text-ink">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="text-[17px] font-bold tracking-tight">Nova</div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  item.active
                    ? "bg-white/[0.08] text-white glow-dark"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-pink text-ink font-bold">A</div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-white">Alex Rivera</div>
                <div className="truncate text-xs text-white/50">Free plan</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 overflow-y-auto scrollbar-none rounded-[28px]">
          <div className="flex flex-col gap-6 pb-6">
            {/* Search bar */}
            <div className="flex items-center gap-3">
              <div className="flex h-[60px] flex-1 items-center gap-3 rounded-full bg-sidebar px-5 text-white">
                <Search className="h-[18px] w-[18px] text-white/50" />
                <input
                  className="flex-1 bg-transparent text-[15px] font-medium text-white placeholder:text-white/40 outline-none"
                  placeholder="Ask anything..."
                />
                <button className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition">
                  <Paperclip className="h-[17px] w-[17px]" />
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition">
                  <Mic className="h-[17px] w-[17px]" />
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="grid h-10 w-10 place-items-center rounded-full bg-brand-yellow text-ink"
                >
                  <ArrowUp className="h-[17px] w-[17px]" strokeWidth={2.5} />
                </motion.button>
              </div>
              <button className="grid h-[60px] w-[60px] place-items-center rounded-full bg-white shadow-soft">
                <Bell className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Hero */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-[30px] bg-white p-8 shadow-soft"
            >
              <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full bg-brand-cream/60 blur-3xl" />
              <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-brand-pink/40 blur-3xl" />

              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6 items-center">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-1.5 text-xs font-semibold text-ink-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                    New · Nova 2.0 is here
                  </div>
                  <h1 className="mt-4 text-[44px] leading-[1.05] tracking-tight">
                    Build Without<br />Limits
                  </h1>
                  <p className="mt-3 max-w-md text-[15px] font-medium text-ink-soft">
                    Access powerful AI models, custom agents and multimodal tools — all from one elegant workspace.
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-[14px] font-semibold text-ink shadow-soft"
                    >
                      Upgrade to Pro
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </motion.button>
                    <button className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold text-ink-soft hover:text-ink transition">
                      See what's new
                    </button>
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative justify-self-center md:justify-self-end"
                >
                  <div className="absolute inset-0 rounded-full bg-brand-yellow/40 blur-2xl" />
                  <img src={mascot} alt="Nova mascot" className="relative h-[220px] w-[220px] object-contain" width={440} height={440} />
                </motion.div>
              </div>
            </motion.section>

            {/* Category Pills */}
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold tracking-tight">Explore agents</h2>
              <button className="text-sm font-semibold text-ink-soft hover:text-ink">View all</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveCat(c)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                    activeCat === c
                      ? "bg-sidebar text-white"
                      : "bg-white text-ink-soft hover:text-ink shadow-soft"
                  }`}
                >
                  {c}
                </motion.button>
              ))}
            </div>

            {/* Bot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {visibleBots.map((b, i) => (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.03 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group cursor-pointer rounded-[24px] bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
                >
                  <div className="flex items-start justify-between">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${b.color} text-ink font-bold text-lg`}>
                      {b.initial}
                    </div>
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-ink-soft hover:text-brand-pink transition">
                      <Heart className="h-[15px] w-[15px]" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-bold tracking-tight">{b.name}</h3>
                    </div>
                    <p className="mt-1 text-[13px] font-medium text-ink-soft line-clamp-2">{b.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                      {b.category}
                    </span>
                    <div className="flex items-center gap-3 text-[12px] font-semibold text-ink-soft">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
                        {b.rating}
                      </span>
                      <span>{b.users}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Conversations */}
            <div className="mt-2 flex items-center justify-between">
              <h2 className="text-[20px] font-bold tracking-tight">Recent conversations</h2>
              <button className="text-sm font-semibold text-ink-soft hover:text-ink">See all</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {conversations.map((c) => (
                <motion.div
                  key={c.title}
                  whileHover={{ y: -2 }}
                  className="cursor-pointer rounded-[24px] bg-white p-5 shadow-soft hover:shadow-card transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {c.pinned && <Pin className="h-3.5 w-3.5 fill-ink text-ink" />}
                        <h4 className="truncate text-[14.5px] font-bold">{c.title}</h4>
                      </div>
                      <p className="mt-1 truncate text-[13px] font-medium text-ink-soft">{c.preview}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold text-ink-soft">{c.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside className="hidden xl:flex w-[27%] min-w-[320px] flex-col rounded-[36px] bg-sidebar p-6 text-sidebar-foreground overflow-y-auto scrollbar-none">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold tracking-tight text-white">Quick actions</h3>
            <button className="text-xs font-semibold text-white/50 hover:text-white">Edit</button>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {quickActions.map((a) => (
              <motion.button
                key={a.label}
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-full ${a.color} text-ink shadow-soft`}>
                  <a.icon className="h-[18px] w-[18px]" strokeWidth={2.3} />
                </div>
                <span className="text-[10.5px] font-semibold text-white/70 text-center leading-tight">{a.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Favorites */}
          <div className="mt-8 flex items-center justify-between">
            <h3 className="text-[15px] font-bold tracking-tight text-white">Favorite bots</h3>
            <button className="text-xs font-semibold text-white/50 hover:text-white">View all</button>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {favoriteBots.map((f) => (
              <motion.div
                key={f.name}
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 hover:bg-white/[0.08] transition"
              >
                <div className="relative">
                  <div className={`grid h-10 w-10 place-items-center rounded-full ${f.color} text-ink font-bold`}>
                    {f.initial}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar ${
                    f.status === "online" ? "bg-brand-green" : "bg-brand-yellow"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-[13px] font-semibold text-white">{f.name}</div>
                  <div className="truncate text-[11px] font-medium text-white/50">{f.desc}</div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-white px-3.5 py-1.5 text-[11.5px] font-bold text-ink"
                >
                  Launch
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Usage card */}
          <div className="mt-8 rounded-[28px] bg-gradient-to-br from-brand-purple/30 to-brand-pink/20 p-5">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4" />
              <span className="text-[12px] font-bold uppercase tracking-wider">Pro plan</span>
            </div>
            <p className="mt-3 text-[15px] font-semibold leading-snug text-white">
              Unlock unlimited messages, GPT-5 and Claude 3.7.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 w-full rounded-full bg-white py-2.5 text-[13px] font-bold text-ink"
            >
              Upgrade now
            </motion.button>
          </div>
        </aside>
      </div>
    </div>
  );
}
