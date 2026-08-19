import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  Battery,
  Bell,
  Building2,
  Check,
  ChevronDown,
  Lock,
  Plus,
  Shield,
  TrendingUp,
  Upload,
  Wifi,
} from 'lucide-react';

export default function Hero() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] pt-8 pb-20 md:pt-12 md:pb-28 lg:pt-14 lg:pb-36">
      {/* Background Financial Ledger Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(13,23,32,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(13,23,32,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Soft warm ambient background glow */}
      <div
        className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-40 blur-[140px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,176,116,0.2) 0%, rgba(254,243,199,0.25) 50%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Floating Background Financial Glyphs */}
      <motion.div
        animate={prefersReduced ? {} : { y: [0, -8, 0], rotate: [0, 3, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-[7%] top-20 hidden lg:flex items-center gap-2 rounded-2xl border border-[#00b074]/20 bg-white/75 px-3.5 py-2 backdrop-blur-md shadow-[0_8px_24px_rgba(0,176,116,0.08)] select-none"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E2F8ED] text-[#00b074] font-bold text-sm">
          ₹
        </div>
        <div className="text-left">
          <p className="text-[10px] font-semibold text-[#6E7D87] uppercase leading-none">Net Inflow</p>
          <p className="text-[12px] font-bold text-[#00b074] leading-tight mt-0.5">+₹4.2L</p>
        </div>
      </motion.div>

      <motion.div
        animate={prefersReduced ? {} : { y: [0, 8, 0], rotate: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 6.5, delay: 0.5, ease: 'easeInOut' }}
        className="pointer-events-none absolute right-[8%] top-24 hidden lg:flex items-center gap-2 rounded-2xl border border-[#F59E0B]/20 bg-white/75 px-3.5 py-2 backdrop-blur-md shadow-[0_8px_24px_rgba(245,158,11,0.08)] select-none"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706]">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-semibold text-[#6E7D87] uppercase leading-none">Runway Buffer</p>
          <p className="text-[12px] font-bold text-[#0D1720] leading-tight mt-0.5">84 Days</p>
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Top Centered Section: Headline */}
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0.01 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          {/* Main Headline */}
          <h1 className="font-display text-[42px] sm:text-[58px] lg:text-[72px] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0D1720]">
            Know your <br />
            cash crunch <br />
            <span className="text-[#00b074]">before it happens.</span>
          </h1>
        </motion.div>

        {/* Central Visual Stage: Phone Mockup + Floating 3D Asset + Interactive Cards */}
        <div className="relative mx-auto mt-12 sm:mt-16 max-w-5xl flex justify-center items-center">
          {/* Background Orbital Radar Rings (Behind bottom-right) */}
          <div className="pointer-events-none absolute right-4 lg:right-16 bottom-6 lg:bottom-10 h-72 w-72 lg:h-96 lg:w-96 -z-0">
            {/* Outer Orbit */}
            <div className="absolute inset-0 rounded-full border border-[#0D1720]/[0.06]" />
            {/* Middle Orbit */}
            <div className="absolute inset-8 rounded-full border border-[#0D1720]/[0.08]" />
            {/* Inner Orbit */}
            <div className="absolute inset-16 rounded-full border border-[#0D1720]/[0.1]" />

            {/* Orbiting Icons */}
            <div className="absolute top-8 left-12 flex h-8 w-8 items-center justify-center rounded-full bg-[#4C7DFF]/15 border border-[#4C7DFF]/30 text-[#4C7DFF] shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="absolute top-28 left-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <div className="absolute bottom-20 right-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#00b074]/15 border border-[#00b074]/30 text-[#00b074] font-bold text-xs shadow-sm">
              ₹
            </div>
            <div className="absolute bottom-2 left-28 flex h-8 w-8 items-center justify-center rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] shadow-sm">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* 1. Top-Left 3D Floating Graphic */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.2 },
              x: { duration: 0.6, delay: 0.2 },
              y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
            }}
            className="absolute left-0 lg:-left-6 top-0 lg:top-4 z-20 hidden md:block w-36 sm:w-44 lg:w-52 pointer-events-none"
          >
            <div className="relative group">
              <img
                src="/hero-3d-shield.jpg"
                alt="3D Financial Health & Security Shield"
                className="w-full h-auto object-contain rounded-2xl drop-shadow-[0_20px_35px_rgba(0,176,116,0.15)] mix-blend-multiply"
              />
            </div>
          </motion.div>

          {/* 2. Top-Right Floating Forecast Card */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: [0, 6, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.25 },
              x: { duration: 0.6, delay: 0.25 },
              y: { repeat: Infinity, duration: 4.5, ease: 'easeInOut' },
            }}
            className="absolute right-0 lg:-right-4 top-2 lg:top-6 z-20 hidden sm:block w-44 sm:w-48 lg:w-52 rounded-2xl bg-white p-4 shadow-[0_14px_35px_rgba(13,23,32,0.07)] border border-[#F0ECE3] rotate-[3deg] transition-transform hover:rotate-0"
          >
            <p className="text-[12px] font-semibold text-[#0D1720]">Cash flow forecast</p>

            {/* Green Forecast Chart */}
            <div className="mt-2 h-14 w-full">
              <svg viewBox="0 0 160 50" className="h-full w-full overflow-visible" fill="none">
                <defs>
                  <linearGradient id="forecastGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00b074" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00b074" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,42 Q30,38 50,26 T100,28 T155,10 L155,50 L0,50 Z"
                  fill="url(#forecastGlow)"
                />
                <path
                  d="M0,42 Q30,38 50,26 T100,28 T155,10"
                  stroke="#00b074"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="155" cy="10" r="3.5" fill="#00b074" />
              </svg>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-[#00b074]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#00b074]">
                Healthy
              </span>
              <span className="text-[10px] text-[#6E7D87]">Next 30 days</span>
            </div>
          </motion.div>

          {/* 3. Central Smartphone Mockup (iPhone 15 Pro style) */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReduced ? 0.01 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[325px] sm:max-w-[345px]"
          >
            {/* Phone Outer Metallic Shell */}
            <div className="relative rounded-[48px] border-[5px] border-[#CBD5E1] bg-[#0D1720] shadow-[0_25px_80px_rgba(13,23,32,0.14)] p-[2.5px]">
              {/* Phone Inner Frame */}
              <div className="relative rounded-[44px] border-[5px] border-[#0D1720] bg-white overflow-hidden flex flex-col min-h-[590px]">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[#0D1720]">
                  <span className="font-semibold tracking-tight text-[12px]">9:41</span>
                  {/* Dynamic Island */}
                  <div className="flex items-center justify-center h-5 w-24 rounded-full bg-[#0D1720] shadow-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1A2530]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" />
                    <Battery className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* App Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 bg-[#FAF7F2]/40">
                  {/* User Profile Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2F8ED] border border-[#00b074]/30 text-[#00b074] font-bold text-xs">
                        MH
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6E7D87] leading-none">Welcome back,</p>
                        <p className="font-display text-[14px] font-semibold text-[#0D1720] leading-tight mt-0.5">
                          Mark Hussain
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E2DED4] bg-white text-[#0D1720] shadow-sm hover:bg-[#F3EFE6]"
                    >
                      <Bell className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Total Cash Balance Card */}
                  <div className="rounded-2xl border border-[#E2DED4] bg-white p-4 shadow-[0_2px_12px_rgba(13,23,32,0.04)]">
                    <p className="text-[11px] text-[#6E7D87]">Total Cash Balance</p>
                    <p className="font-display text-[24px] font-extrabold text-[#0D1720] tracking-tight mt-0.5">
                      ₹3,64,540<span className="text-[16px] text-[#6E7D87]">.00</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#00b074]">
                      <span>↑ 8.7%</span>
                      <span className="text-[#6E7D87]">vs last month</span>
                    </p>
                  </div>

                  {/* Two Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-1.5 rounded-full bg-[#E2F8ED] py-2 px-3 text-[11px] font-semibold text-[#00b074] transition-colors hover:bg-[#cbf2df]"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Transaction
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-1.5 rounded-full border border-[#E2DED4] bg-white py-2 px-3 text-[11px] font-medium text-[#0D1720] shadow-sm hover:bg-[#FAF7F2]"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#6E7D87]" /> Upload Statement
                    </button>
                  </div>

                  {/* Cash In / Out Mini Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Cash In */}
                    <div className="rounded-xl border border-[#E2DED4] bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-[15px] font-bold text-[#0D1720]">₹3.6L</span>
                        <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                          <path d="M1 9L7 5L14 8L21 2L27 6" stroke="#00b074" strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="mt-1 text-[10px] text-[#6E7D87] leading-tight">Cash In</p>
                      <p className="text-[9px] text-[#94A3B8]">This Month</p>
                    </div>

                    {/* Cash Out */}
                    <div className="rounded-xl border border-[#E2DED4] bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-[15px] font-bold text-[#0D1720]">₹2.1L</span>
                        <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
                          <path d="M1 4L7 8L14 3L21 9L27 5" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="mt-1 text-[10px] text-[#6E7D87] leading-tight">Cash Out</p>
                      <p className="text-[9px] text-[#94A3B8]">This Month</p>
                    </div>
                  </div>

                  {/* Cash Flow Health Status */}
                  <div className="rounded-xl border border-[#E2DED4] bg-white p-3 flex items-center justify-between shadow-sm">
                    <span className="text-[12px] font-medium text-[#0D1720]">Cash Flow Health</span>
                    <span className="inline-flex items-center rounded-full bg-[#E2F8ED] px-2.5 py-0.5 text-[10px] font-semibold text-[#00b074]">
                      Healthy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. Bottom-Left Mint Green Floating Savings Card */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -20, y: 15 }}
            animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.3 },
              x: { duration: 0.6, delay: 0.3 },
              y: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
            }}
            className="absolute -left-4 lg:-left-20 bottom-28 lg:bottom-32 z-20 hidden md:block w-56 sm:w-64 rounded-2xl bg-[#E2F8ED] border border-[#BDE8D3] p-4 shadow-[0_14px_35px_rgba(0,176,116,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#0D1720]">Simulate your savings</span>
              <TrendingUp className="h-4 w-4 text-[#00b074]" />
            </div>
            <p className="font-display text-[22px] font-extrabold text-[#0D1720] tracking-tight mt-2">
              ₹5,25,000<span className="text-[14px] text-[#0D1720]/70">.87</span>
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#0D1720]">
              <span>₹4.32L projected in</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-[#BDE8D3] px-2.5 py-0.5 text-[10px] font-bold text-[#0D1720] shadow-xs"
              >
                2 YEARS <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </motion.div>

          {/* 5. Bottom-Left Social Proof / Trust Avatars */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="absolute -left-4 lg:-left-20 bottom-4 z-20 hidden md:block"
          >
            <p className="text-[12px] font-medium text-[#0D1720]">
              Secure. Trusted. Built for MSMEs.
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              {/* Overlapping Avatars */}
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-[#CBD5E1]">
                  <img
                    src="/msme-avatars.jpg"
                    alt="Founder 1"
                    className="h-full w-full object-cover scale-[2.2] object-top"
                  />
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-[#CBD5E1]">
                  <img
                    src="/msme-avatars.jpg"
                    alt="Founder 2"
                    className="h-full w-full object-cover scale-[2.2] object-right-top"
                  />
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-[#CBD5E1]">
                  <img
                    src="/msme-avatars.jpg"
                    alt="Founder 3"
                    className="h-full w-full object-cover scale-[2.2] object-bottom-left"
                  />
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-[#CBD5E1]">
                  <img
                    src="/msme-avatars.jpg"
                    alt="Founder 4"
                    className="h-full w-full object-cover scale-[2.2] object-bottom-right"
                  />
                </div>
              </div>

              {/* Secure by Design Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E2DED4] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#0D1720] shadow-sm">
                <Lock className="h-3 w-3 text-[#0D1720]" />
                <span>Secure by Design</span>
              </div>
            </div>
          </motion.div>

          {/* 6. Bottom-Right Amber Low Cash Alert Card */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 20, y: 15 }}
            animate={{ opacity: 1, x: 0, y: [0, 5, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.35 },
              x: { duration: 0.6, delay: 0.35 },
              y: { repeat: Infinity, duration: 4.8, ease: 'easeInOut' },
            }}
            className="absolute -right-4 lg:-right-16 bottom-20 lg:bottom-24 z-20 hidden sm:block w-56 sm:w-64 lg:w-72 rounded-2xl bg-[#FEF9C3] border border-[#FEF08A] p-4 shadow-[0_14px_35px_rgba(234,179,8,0.12)] rotate-[-2deg] transition-transform hover:rotate-0"
          >
            <p className="text-[11px] font-bold tracking-wider text-[#78350F] uppercase">
              LOW CASH ALERT
            </p>
            <p className="font-display text-[22px] font-extrabold text-[#0D1720] tracking-tight mt-1">
              ₹1,25,000<span className="text-[14px] text-[#0D1720]/70">.40</span>
            </p>

            {/* Amber Progress Bar */}
            <div className="mt-2.5 h-2.5 w-full rounded-full bg-[#FDE68A]/60 overflow-hidden">
              <div className="h-full w-[65%] rounded-full bg-[#F59E0B]" />
            </div>

            <div className="mt-3 text-[11px] text-[#92400E] leading-relaxed">
              <p className="font-medium">Est. low balance in 12 days</p>
              <p className="text-[#A16207]">Plan ahead to stay stress-free.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
