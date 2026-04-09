"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  BarChart3, TrendingUp, Shield, AlertTriangle, Globe, ArrowUpRight, ArrowDownRight,
  ChevronRight, Bell, Search, Settings, FileText, UserCog, Scale, Radio,
  X, Check, Info, Clock, Plus, Download, Filter, MapPin, Users, Cpu,
  Calendar, Mail, Lock, Palette, Monitor, BellRing, CreditCard, Languages, HelpCircle,
  LogOut, ChevronDown, Activity, Zap, Database, Target, Eye, Megaphone, Layers,
  Building2, Home, Vote, AlertCircle, CircleDot, Hash, TrendingDown,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts"

// ─── Design tokens ─────────────────────────────────────────────

const CARD_SHADOW =
  "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px"

const SECTION_MIN_H = "min-h-[calc(100vh-10.5rem)]"

// Colors as constants for recharts - Linen/Taupe editorial palette
const C = {
  charcoal: "oklch(0.25 0.015 60)",
  charcoalLight: "oklch(0.35 0.015 60)",
  taupe: "oklch(0.55 0.04 75)",
  taupeLight: "oklch(0.65 0.035 80)",
  stone: "oklch(0.45 0.025 60)",
  cream: "oklch(0.70 0.025 70)",
  gain: "oklch(0.50 0.10 155)",
  loss: "oklch(0.50 0.12 25)",
  grid: "oklch(0.68 0.025 75)",
  tick: "oklch(0.45 0.020 60)",
  surface: "oklch(0.78 0.025 75)",
  gold: "oklch(0.65 0.10 85)",
  warmGray: "oklch(0.58 0.02 70)",
}

const SPRING = { type: "spring" as const, stiffness: 400, damping: 32 }
const EASE_OUT = [0.16, 1, 0.3, 1] as const

// ─── Data ──────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "cases", label: "Case Detection", icon: Scale },
  { id: "anomalies", label: "Anomalies", icon: AlertTriangle },
  { id: "entities", label: "Entities", icon: Users },
  { id: "media", label: "Media Recs", icon: Megaphone },
  { id: "sources", label: "Data Sources", icon: Database },
  { id: "model", label: "Model Performance", icon: Cpu },
  { id: "settings", label: "Settings", icon: UserCog },
] as const

type SectionId = (typeof NAV_ITEMS)[number]["id"]

// Case type taxonomy from Limira spec
const caseTypes = [
  { id: 0, name: "Race Discrimination", count: 3245, trend: 12.4 },
  { id: 1, name: "Gender Discrimination", count: 2891, trend: 8.2 },
  { id: 2, name: "Age Discrimination", count: 1456, trend: -3.1 },
  { id: 3, name: "Disability Discrimination", count: 1289, trend: 15.7 },
  { id: 4, name: "Religious Discrimination", count: 567, trend: 4.8 },
  { id: 5, name: "Sexual Harassment", count: 2134, trend: -5.2 },
  { id: 6, name: "Housing Discrimination", count: 4521, trend: 22.3 },
  { id: 7, name: "Wage Theft", count: 6789, trend: 18.9 },
  { id: 8, name: "Wrongful Termination", count: 3456, trend: 7.1 },
  { id: 9, name: "Police Misconduct", count: 892, trend: 11.3 },
  { id: 10, name: "Immigration Violations", count: 1123, trend: 9.4 },
  { id: 11, name: "ADA Accessibility", count: 2345, trend: 14.2 },
  { id: 12, name: "Consumer Fraud", count: 5678, trend: 25.1 },
  { id: 13, name: "Environmental Justice", count: 432, trend: 32.8 },
]

const documentVolumeData = [
  { month: "Sep", documents: 142000 }, { month: "Oct", documents: 158000 }, { month: "Nov", documents: 165000 },
  { month: "Dec", documents: 148000 }, { month: "Jan", documents: 172000 }, { month: "Feb", documents: 189000 },
]

const caseDistribution = [
  { name: "Wage Theft", value: 22, color: C.charcoal },
  { name: "Consumer Fraud", value: 18, color: C.taupe },
  { name: "Housing", value: 14, color: C.stone },
  { name: "Employment", value: 28, color: C.charcoalLight },
  { name: "Civil Rights", value: 12, color: C.taupeLight },
  { name: "Other", value: 6, color: C.cream },
]

const anomalyAlerts = [
  { id: 1, type: "spike" as const, category: "Housing Discrimination", location: "11237 — Bushwick", severity: "high" as const, count: 47, baseline: 12, date: "2026-02-20", time: "08:15" },
  { id: 2, type: "cluster" as const, category: "Wage Theft", location: "10001 — Chelsea", severity: "high" as const, count: 38, baseline: 8, date: "2026-02-19", time: "14:22" },
  { id: 3, type: "spike" as const, category: "ADA Accessibility", location: "11201 — Brooklyn Heights", severity: "medium" as const, count: 23, baseline: 9, date: "2026-02-19", time: "11:45" },
  { id: 4, type: "cluster" as const, category: "Consumer Fraud", location: "10019 — Midtown", severity: "medium" as const, count: 31, baseline: 14, date: "2026-02-18", time: "16:30" },
  { id: 5, type: "spike" as const, category: "Gender Discrimination", location: "10013 — Tribeca", severity: "low" as const, count: 18, baseline: 11, date: "2026-02-18", time: "09:12" },
  { id: 6, type: "emerging" as const, category: "Environmental Justice", location: "11385 — Ridgewood", severity: "high" as const, count: 15, baseline: 2, date: "2026-02-17", time: "13:55" },
]

const entityClusters = [
  { id: 1, entity: "Apex Property Management", type: "ORG", cases: 34, categories: ["Housing Discrimination", "ADA Accessibility"], locations: ["11237", "11211", "11206"], confidence: 0.94 },
  { id: 2, entity: "Metro Staffing Solutions", type: "ORG", cases: 28, categories: ["Wage Theft", "Gender Discrimination"], locations: ["10001", "10018"], confidence: 0.89 },
  { id: 3, entity: "Quick Eats Restaurant Group", type: "ORG", cases: 45, categories: ["Wage Theft", "Wrongful Termination"], locations: ["10019", "10036", "10022"], confidence: 0.92 },
  { id: 4, entity: "NYPD 77th Precinct", type: "ORG", cases: 12, categories: ["Police Misconduct"], locations: ["11238"], confidence: 0.87 },
  { id: 5, entity: "Downtown Retail Holdings", type: "ORG", cases: 21, categories: ["Consumer Fraud", "ADA Accessibility"], locations: ["10007", "10038"], confidence: 0.85 },
]

const mediaRecommendations = [
  { id: 1, channel: "Facebook Ads", audience: "Bushwick residents 25-54", reach: "42,000", cpm: "$8.50", relevance: 94, caseType: "Housing Discrimination" },
  { id: 2, channel: "Google Display", audience: "Restaurant workers NYC", reach: "85,000", cpm: "$6.20", relevance: 91, caseType: "Wage Theft" },
  { id: 3, channel: "Local Radio", audience: "WNYC Morning Drive", reach: "125,000", cpm: "$12.00", relevance: 88, caseType: "Consumer Fraud" },
  { id: 4, channel: "Reddit r/nyc", audience: "NYC subreddit users", reach: "340,000", cpm: "$4.50", relevance: 86, caseType: "Housing Discrimination" },
  { id: 5, channel: "Instagram Stories", audience: "Brooklyn millennials", reach: "68,000", cpm: "$7.80", relevance: 82, caseType: "Wage Theft" },
]

const dataSources = [
  { name: "NYC Open Data", status: "active" as const, lastSync: "2026-02-20 08:00", documents: 245000, refresh: "Weekly" },
  { name: "PACER", status: "active" as const, lastSync: "2026-02-20 06:00", documents: 189000, refresh: "Daily" },
  { name: "NYSCEF", status: "active" as const, lastSync: "2026-02-20 06:00", documents: 312000, refresh: "Daily" },
  { name: "EEOC", status: "active" as const, lastSync: "2026-02-01 00:00", documents: 45000, refresh: "Monthly" },
  { name: "Reddit (PRAW)", status: "active" as const, lastSync: "2026-02-20 07:30", documents: 890000, refresh: "6 hours" },
  { name: "Avvo / Glassdoor", status: "syncing" as const, lastSync: "2026-02-20 07:45", documents: 156000, refresh: "6 hours" },
]

const modelMetrics = [
  { category: "Race Discrimination", precision: 0.87, recall: 0.84, f1: 0.85, samples: 2450 },
  { category: "Gender Discrimination", precision: 0.89, recall: 0.86, f1: 0.87, samples: 2180 },
  { category: "Housing Discrimination", precision: 0.91, recall: 0.88, f1: 0.89, samples: 3200 },
  { category: "Wage Theft", precision: 0.93, recall: 0.91, f1: 0.92, samples: 4500 },
  { category: "Consumer Fraud", precision: 0.85, recall: 0.82, f1: 0.83, samples: 3800 },
  { category: "Environmental Justice", precision: 0.78, recall: 0.74, f1: 0.76, samples: 320 },
]

const timeSeriesAnomaly = [
  { week: "W1", actual: 12, expected: 11, threshold: 18 },
  { week: "W2", actual: 14, expected: 12, threshold: 19 },
  { week: "W3", actual: 11, expected: 12, threshold: 19 },
  { week: "W4", actual: 15, expected: 13, threshold: 20 },
  { week: "W5", actual: 13, expected: 12, threshold: 19 },
  { week: "W6", actual: 18, expected: 13, threshold: 20 },
  { week: "W7", actual: 16, expected: 13, threshold: 20 },
  { week: "W8", actual: 14, expected: 13, threshold: 20 },
  { week: "W9", actual: 42, expected: 14, threshold: 21 },
  { week: "W10", actual: 38, expected: 15, threshold: 22 },
  { week: "W11", actual: 47, expected: 16, threshold: 23 },
  { week: "W12", actual: 45, expected: 17, threshold: 24 },
]

const notifications = [
  { id: 1, type: "warning" as const, title: "Anomaly Detected", message: "Housing complaints in Bushwick exceeded 2σ threshold", time: "12 min ago", read: false },
  { id: 2, type: "success" as const, title: "Model Updated", message: "Classification model retrained with 2,500 new samples", time: "2h ago", read: false },
  { id: 3, type: "info" as const, title: "New Cluster Found", message: "Entity cluster detected: Quick Eats Restaurant Group", time: "4h ago", read: false },
  { id: 4, type: "warning" as const, title: "Emerging Topic", message: "Environmental justice mentions increased 650% in Ridgewood", time: "6h ago", read: true },
  { id: 5, type: "success" as const, title: "Data Sync Complete", message: "PACER daily sync completed — 1,247 new documents", time: "8h ago", read: true },
]

const verticalTabs = [
  { id: "legal", label: "Legal Intelligence", icon: Scale, active: true },
  { id: "political", label: "Political Campaigns", icon: Vote, active: false },
  { id: "homeservices", label: "Home Services", icon: Home, active: false },
]

// ─── Sub-Components ─────────────────────────────────────────────

function GlowOrb({ className }: { className?: string }) {
  // Minimal accent - almost invisible for editorial look
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none opacity-10 ${className}`} />
  )
}

function KpiCard({
  label, value, change, prefix = "", suffix = "", delay = 0, icon: Icon,
}: {
  label: string; value: string; change?: number; prefix?: string; suffix?: string; delay?: number; icon?: React.ElementType
}) {
  const isPositive = (change ?? 0) >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE_OUT }}
      className="relative overflow-hidden rounded bg-card border border-border p-4 lg:p-5 shadow-linen"
    >
      <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-3 font-sans">
        {label}
      </p>
      <p className="text-2xl lg:text-3xl font-semibold text-foreground font-display tracking-tight leading-none">
        {prefix}{value}{suffix}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <div className={`flex items-center gap-0.5 text-xs font-medium font-mono ${
            isPositive ? "text-fin-gain" : "text-fin-loss"
          }`}>
            {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {isPositive ? "+" : ""}{change}%
          </div>
          <span className="text-[10px] text-muted-foreground font-sans">vs last month</span>
        </div>
      )}
    </motion.div>
  )
}

function MiniSparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80 - 10}`).join(" ")
  const fillPoints = `0,100 ${points} 100,100`
  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-fill-${color.replace(/[^a-z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#spark-fill-${color.replace(/[^a-z0-9]/g, '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded bg-card border border-border p-3 text-xs shadow-linen">
      <p className="text-muted-foreground mb-2 font-medium text-[10px] uppercase tracking-widest font-sans">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="size-2 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize font-sans">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">{typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function SectionPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
      className={`rounded bg-card border border-border p-5 lg:p-6 shadow-linen ${className}`}
    >
      {children}
    </motion.div>
  )
}

function SectionHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
      <div>
        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase font-sans">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1.5 font-sans">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function NotificationIcon({ type }: { type: "success" | "warning" | "info" }) {
  if (type === "success") return <Check className="size-3.5" />
  if (type === "warning") return <AlertTriangle className="size-3.5" />
  return <Info className="size-3.5" />
}

function NotificationPanel({ isOpen, onClose, items, onMarkRead, onMarkAllRead }: {
  isOpen: boolean; onClose: () => void; items: typeof notifications; onMarkRead: (id: number) => void; onMarkAllRead: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const unreadCount = items.filter((n) => !n.read).length
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="absolute top-full right-0 mt-2 w-[380px] max-h-[28rem] rounded bg-card border border-border overflow-hidden z-50 shadow-linen"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-foreground font-sans tracking-wide uppercase">Alerts</h3>
              {unreadCount > 0 && (
                <span className="text-[9px] font-medium bg-foreground text-background px-1.5 py-0.5 rounded">{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={onMarkAllRead} className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 transition-colors tracking-wide">Mark all read</button>
              )}
              <button onClick={onClose} className="p-1.5 rounded hover:bg-accent transition-colors" aria-label="Close notifications"><X className="size-3.5 text-muted-foreground" /></button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[22rem]">
            {items.map((notif, i) => (
              <motion.button
                key={notif.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                onClick={() => onMarkRead(notif.id)}
                className={`w-full flex items-start gap-3 p-4 text-left border-b border-border hover:bg-accent/50 transition-colors ${!notif.read ? "bg-muted/30" : ""}`}
              >
                <div className={`size-7 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.type === "success" ? "bg-fin-gain/10 text-fin-gain" : notif.type === "warning" ? "bg-gold/10 text-gold" : "bg-muted text-muted-foreground"
                }`}>
                  <NotificationIcon type={notif.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground truncate font-sans">{notif.title}</p>
                    {!notif.read && <div className="size-1.5 rounded-full bg-foreground shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-sans">{notif.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1 font-mono"><Clock className="size-2.5" />{notif.time}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-fin-loss/12 text-fin-loss border border-fin-loss/15",
    medium: "bg-gold/12 text-gold border border-gold/15",
    low: "bg-fin-gain/12 text-fin-gain border border-fin-gain/15",
  }
  return (
    <span className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded ${styles[severity]}`}>
      {severity}
    </span>
  )
}
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${styles[severity]}`}>
      {severity}
    </span>
  )
}

// ─── Section: Overview ─────────────────────────────────────────

function OverviewSection() {
  return (
    <div className={`flex flex-col gap-5 ${SECTION_MIN_H}`}>
      {/* Hero KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Documents Processed" value="1.87M" change={14.2} delay={0} icon={FileText} />
        <KpiCard label="Cases Classified" value="36,818" change={18.9} delay={0.06} icon={Scale} />
        <KpiCard label="Active Anomalies" value="47" change={32.1} delay={0.12} icon={AlertTriangle} />
        <KpiCard label="Model F1 Score" value="0.86" suffix=" avg" delay={0.18} icon={Cpu} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main chart */}
        <SectionPanel className="lg:col-span-2 relative overflow-hidden">
          <GlowOrb className="w-64 h-64 -top-32 -right-32 bg-primary/10" />
          <SectionHeader title="Document Ingestion Volume" subtitle="Monthly document processing">
            <div className="flex items-center gap-1.5 rounded bg-fin-gain/8 px-3 py-1.5 shadow-linen">
              <ArrowUpRight className="size-3.5 text-fin-gain" />
              <span className="text-xs font-bold text-fin-gain font-mono">+14.2%</span>
            </div>
          </SectionHeader>
          <div className="h-56 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={documentVolumeData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.charcoal} stopOpacity={0.25} />
                    <stop offset="50%" stopColor={C.charcoal} stopOpacity={0.08} />
                    <stop offset="100%" stopColor={C.charcoal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.tick }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.tick }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="documents" stroke={C.charcoal} strokeWidth={2.5} fill="url(#volumeGrad)" name="documents" animationDuration={1400} animationEasing="ease-out" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionPanel>

        {/* Case Distribution donut */}
        <SectionPanel>
          <SectionHeader title="Case Distribution" subtitle="By primary category" />
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={caseDistribution} cx="50%" cy="50%" innerRadius="58%" outerRadius="82%" paddingAngle={4} dataKey="value" animationDuration={1200} animationEasing="ease-out" stroke="none">
                  {caseDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2.5 mt-3">
            {caseDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground font-sans">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>

      {/* Recent Anomaly Alerts */}
      <SectionPanel>
        <SectionHeader title="Recent Anomaly Alerts" subtitle="Spikes and clusters requiring attention">
          <button className="flex items-center gap-1.5 text-xs font-medium text-background hover:opacity-80 transition-all px-3.5 py-2 rounded bg-foreground font-sans tracking-wide">
            View All <ChevronRight className="size-3.5" />
          </button>
        </SectionHeader>
        <div className="flex flex-col gap-2.5">
          {anomalyAlerts.slice(0, 4).map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3.5">
                <div className={`size-10 rounded-lg flex items-center justify-center border ${
                  alert.severity === "high" ? "bg-fin-loss/10 text-fin-loss border-fin-loss/20" : alert.severity === "medium" ? "bg-gold/10 text-gold border-gold/20" : "bg-fin-gain/10 text-fin-gain border-fin-gain/20"
                }`}>
                  {alert.type === "spike" ? <TrendingUp className="size-4" /> : alert.type === "cluster" ? <Layers className="size-4" /> : <Radio className="size-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground font-sans">{alert.category}</p>
                  <p className="text-[11px] text-muted-foreground font-sans flex items-center gap-1.5">
                    <MapPin className="size-3" />{alert.location}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-sm font-mono font-bold text-foreground">{alert.count} <span className="text-muted-foreground text-xs font-normal">/ {alert.baseline} baseline</span></p>
                  <p className="text-[10px] text-muted-foreground font-mono">{alert.date}</p>
                </div>
                <SeverityBadge severity={alert.severity} />
              </div>
            </motion.div>
          ))}
        </div>
      </SectionPanel>
    </div>
  )
}

// ─── Section: Case Detection ───────────────────────────────────

function CasesSection() {
  return (
    <div className={`flex flex-col gap-5 ${SECTION_MIN_H}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Total Cases" value="36,818" change={18.9} delay={0} icon={Scale} />
        <KpiCard label="This Week" value="2,847" change={12.3} delay={0.06} icon={Calendar} />
        <KpiCard label="Categories" value="14" delay={0.12} icon={Layers} />
        <KpiCard label="Avg Confidence" value="87.2" suffix="%" delay={0.18} icon={Target} />
      </div>

      <SectionPanel className="!p-0 overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight font-display">Case Type Classifications</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-sans">14 social justice categories from Legal-BERT classifier</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all px-3 py-2 rounded bg-muted hover:bg-accent border border-border font-sans tracking-wide">
              <Filter className="size-3.5" />Filter
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-background hover:opacity-80 transition-all px-3.5 py-2 rounded bg-foreground font-sans tracking-wide">
              <Download className="size-3.5" />Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Category</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Count</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Trend</th>
                <th className="text-center p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans hidden sm:table-cell w-32">Volume</th>
              </tr>
            </thead>
            <tbody>
              {caseTypes.map((caseType, i) => (
                <motion.tr
                  key={caseType.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 + i * 0.03 }}
                  className="border-b border-border/50 hover:bg-muted/50 transition-all duration-200"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary font-mono">{caseType.id}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-foreground font-sans">{caseType.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-foreground">{caseType.count.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md ${caseType.trend >= 0 ? "text-fin-gain bg-fin-gain/8" : "text-fin-loss bg-fin-loss/8"}`}>
                      {caseType.trend >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {caseType.trend > 0 ? "+" : ""}{caseType.trend}%
                    </span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="h-2 rounded-full bg-muted overflow-hidden border border-border/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(caseType.count / 6789) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.05, ease: EASE_OUT }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </div>
  )
}

// ─── Section: Anomalies ────────────────────────────────────────

function AnomaliesSection() {
  return (
    <div className={`flex flex-col gap-5 ${SECTION_MIN_H}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Active Alerts" value="47" change={32.1} delay={0} icon={AlertTriangle} />
        <KpiCard label="High Severity" value="12" delay={0.06} icon={AlertCircle} />
        <KpiCard label="Clusters Found" value="8" delay={0.12} icon={Layers} />
        <KpiCard label="Emerging Topics" value="3" delay={0.18} icon={Radio} />
      </div>

      <SectionPanel className="relative overflow-hidden">
        <GlowOrb className="w-48 h-48 -top-24 -left-24 bg-fin-loss/6" />
        <SectionHeader title="Time Series Anomaly Detection" subtitle="Housing Discrimination — ZIP 11237 (Bushwick)">
          <div className="flex items-center gap-5 text-[11px]">
            <div className="flex items-center gap-2"><div className="size-2.5 rounded-full" style={{ background: C.charcoal }} /><span className="text-muted-foreground font-sans">Actual</span></div>
            <div className="flex items-center gap-2"><div className="size-2.5 rounded-full" style={{ background: C.slate }} /><span className="text-muted-foreground font-sans">Expected</span></div>
            <div className="flex items-center gap-2"><div className="size-2.5 rounded-full" style={{ background: C.stone }} /><span className="text-muted-foreground font-sans">Threshold (μ+2σ)</span></div>
          </div>
        </SectionHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesAnomaly} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: C.tick }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.tick }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="expected" name="expected" stroke={C.slate} strokeWidth={2} dot={false} strokeDasharray="6 3" animationDuration={1100} />
              <Line type="monotone" dataKey="threshold" name="threshold" stroke={C.stone} strokeWidth={1.5} dot={false} strokeDasharray="4 4" animationDuration={1100} />
              <Line type="monotone" dataKey="actual" name="actual" stroke={C.charcoal} strokeWidth={2.5} dot={{ fill: C.charcoal, r: 3 }} animationDuration={1100} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-fin-loss/5 border border-fin-loss/20 shadow-linen">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-fin-loss shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground font-sans">Anomaly Detected: Week 9-12</p>
              <p className="text-xs text-muted-foreground mt-1 font-sans leading-relaxed">
                Complaint volume exceeded 2σ threshold for 4 consecutive weeks. Pattern suggests systemic issue with entity: <span className="font-semibold text-foreground">Apex Property Management</span>. 
                Recommend media placement in Bushwick targeting housing discrimination awareness.
              </p>
            </div>
          </div>
        </div>
      </SectionPanel>

      <SectionPanel className="!p-0 overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-border/50">
          <SectionHeader title="All Anomaly Alerts" subtitle="Sorted by severity and recency" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Type</th>
                <th className="text-left p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Category</th>
                <th className="text-left p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans hidden md:table-cell">Location</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Count</th>
                <th className="text-center p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Severity</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {anomalyAlerts.map((alert, i) => (
                <motion.tr
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 + i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/50 transition-all duration-200"
                >
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize ${
                      alert.type === "spike" ? "bg-chart-3/10 text-chart-3" : alert.type === "cluster" ? "bg-chart-2/10 text-chart-2" : "bg-primary/10 text-primary"
                    }`}>
                      {alert.type === "spike" ? <TrendingUp className="size-3" /> : alert.type === "cluster" ? <Layers className="size-3" /> : <Radio className="size-3" />}
                      {alert.type}
                    </span>
                  </td>
                  <td className="p-4"><span className="font-semibold text-foreground font-sans">{alert.category}</span></td>
                  <td className="p-4 text-muted-foreground font-mono text-xs hidden md:table-cell">{alert.location}</td>
                  <td className="p-4 text-right">
                    <span className="font-mono font-bold text-foreground">{alert.count}</span>
                    <span className="text-muted-foreground text-xs font-normal"> / {alert.baseline}</span>
                  </td>
                  <td className="p-4 text-center"><SeverityBadge severity={alert.severity} /></td>
                  <td className="p-4 text-right text-xs text-muted-foreground hidden lg:table-cell font-mono">{alert.date} <span className="text-muted-foreground/50">{alert.time}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </div>
  )
}

// ─── Section: Entities ─────────────────────────────────────────

function EntitiesSection() {
  return (
    <div className={`flex flex-col gap-5 ${SECTION_MIN_H}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Entities Extracted" value="24,891" change={22.4} delay={0} icon={Users} />
        <KpiCard label="Organizations" value="3,456" delay={0.06} icon={Building2} />
        <KpiCard label="Active Clusters" value="42" change={15.8} delay={0.12} icon={Layers} />
        <KpiCard label="Avg Cluster Size" value="18.4" suffix=" docs" delay={0.18} icon={Hash} />
      </div>

      <SectionPanel>
        <SectionHeader title="Entity Type Distribution" subtitle="Named entities extracted via SpaCy NER" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { type: "LOC", label: "Location", count: 8945, example: "Bushwick, 11237", color: C.charcoal },
            { type: "ORG", label: "Organization", count: 3456, example: "Apex Property Mgmt", color: C.taupe },
            { type: "DEM", label: "Demographic", count: 5621, example: "as a Black woman", color: C.coral },
            { type: "MON", label: "Monetary", count: 4123, example: "$4,200 unpaid", color: C.gold },
            { type: "TIME", label: "Temporal", count: 2746, example: "since Jan 2025", color: C.indigo },
          ].map((entity, i) => (
            <motion.div
              key={entity.type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="p-4 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded-lg flex items-center justify-center" style={{ background: `${entity.color}20` }}>
                  <span className="text-[9px] font-bold font-mono" style={{ color: entity.color }}>{entity.type}</span>
                </div>
                <span className="text-xs font-semibold text-foreground font-sans">{entity.label}</span>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{entity.count.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate">{entity.example}</p>
            </motion.div>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel className="!p-0 overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight font-display">Entity Clusters (DBSCAN)</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-sans">Organizations with 5+ related complaints — potential class action targets</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-background hover:opacity-80 transition-all px-3.5 py-2 rounded bg-foreground font-sans tracking-wide">
            <Target className="size-3.5" />Generate Report
          </button>
        </div>
        <div className="divide-y divide-border/30">
          {entityClusters.map((cluster, i) => (
            <motion.div
              key={cluster.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.05 }}
              className="p-5 hover:bg-accent/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="size-9 rounded bg-primary/10 flex items-center justify-center">
                      <Building2 className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground font-sans">{cluster.entity}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{cluster.type} — {cluster.cases} related documents</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {cluster.categories.map((cat, j) => (
                      <span key={j} className="text-[10px] font-medium bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-md font-sans">{cat}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground font-sans">
                    <MapPin className="size-3" />
                    <span>ZIP codes: {cluster.locations.join(", ")}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs text-muted-foreground font-sans">Confidence</span>
                    <span className="text-sm font-bold font-mono text-fin-gain">{(cluster.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-20 rounded-full bg-muted/60 overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-fin-gain" style={{ width: `${cluster.confidence * 100}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionPanel>
    </div>
  )
}

// ─── Section: Media Recommendations ────────────────────────────

function MediaSection() {
  return (
    <div className={`flex flex-col gap-5 ${SECTION_MIN_H}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Recommendations" value="156" change={28.4} delay={0} icon={Megaphone} />
        <KpiCard label="Est. Total Reach" value="2.4M" delay={0.06} icon={Globe} />
        <KpiCard label="Avg CPM" value="$7.80" delay={0.12} icon={Target} />
        <KpiCard label="Relevance Score" value="87" suffix="%" delay={0.18} icon={Zap} />
      </div>

      {/* Vertical selector */}
      <SectionPanel>
        <SectionHeader title="Industry Vertical" subtitle="Select target market for recommendations" />
        <div className="flex gap-3">
          {verticalTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-2.5 px-4 py-3 rounded text-sm font-semibold transition-all duration-200 font-sans ${
                  tab.active ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
                {!tab.active && <span className="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded font-mono">Soon</span>}
              </button>
            )
          })}
        </div>
      </SectionPanel>

      <SectionPanel className="!p-0 overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight font-display">Media Placement Recommendations</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-sans">AI-generated media buy suggestions based on detected patterns</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all px-3 py-2 rounded bg-muted hover:bg-accent border border-border font-sans tracking-wide">
              <Filter className="size-3.5" />Filter
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-background hover:opacity-80 transition-all px-3.5 py-2 rounded bg-foreground font-sans tracking-wide">
              <Download className="size-3.5" />Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Channel</th>
                <th className="text-left p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Target Audience</th>
                <th className="text-left p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans hidden md:table-cell">Case Type</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Reach</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans hidden lg:table-cell">CPM</th>
                <th className="text-center p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Relevance</th>
              </tr>
            </thead>
            <tbody>
              {mediaRecommendations.map((rec, i) => (
                <motion.tr
                  key={rec.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.15 + i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/50 transition-all duration-200"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Megaphone className="size-4 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground font-sans">{rec.channel}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground font-sans text-xs">{rec.audience}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-[11px] bg-muted/40 text-muted-foreground px-2.5 py-1 rounded-lg font-medium font-sans">{rec.caseType}</span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-foreground">{rec.reach}</td>
                  <td className="p-4 text-right font-mono text-muted-foreground hidden lg:table-cell">{rec.cpm}</td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="h-1.5 w-12 rounded-full bg-muted/60 overflow-hidden">
                        <div className="h-full rounded-full bg-fin-gain" style={{ width: `${rec.relevance}%` }} />
                      </div>
                      <span className="text-xs font-mono font-bold text-fin-gain">{rec.relevance}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPanel>

      <SectionPanel>
        <SectionHeader title="Campaign Messaging Guidelines" subtitle="Compliant messaging for &quot;Know Your Rights&quot; campaigns" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded bg-fin-gain/5 border border-fin-gain/20">
            <div className="flex items-center gap-2 mb-2">
              <Check className="size-4 text-fin-gain" />
              <span className="text-sm font-bold text-foreground font-sans">Do</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1.5 font-sans">
              <li>Focus on educational &quot;Know Your Rights&quot; messaging</li>
              <li>Use broad, compliant outreach language</li>
              <li>Reference general legal resources</li>
              <li>Target geographic areas, not individuals</li>
            </ul>
          </div>
          <div className="p-4 rounded bg-fin-loss/5 border border-fin-loss/20">
            <div className="flex items-center gap-2 mb-2">
              <X className="size-4 text-fin-loss" />
              <span className="text-sm font-bold text-foreground font-sans">{"Don't"}</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1.5 font-sans">
              <li>Micro-target specific individuals</li>
              <li>Make direct solicitation claims</li>
              <li>Promise case outcomes or settlements</li>
              <li>Use collected PII for targeting</li>
            </ul>
          </div>
        </div>
      </SectionPanel>
    </div>
  )
}

// ─── Section: Data Sources ─────────────────────────────────────

function SourcesSection() {
  return (
    <div className={`flex flex-col gap-5 ${SECTION_MIN_H}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Total Documents" value="1.87M" change={14.2} delay={0} icon={Database} />
        <KpiCard label="Active Sources" value="6" delay={0.06} icon={Radio} />
        <KpiCard label="Dedup Rate" value="4.2" suffix="%" delay={0.12} icon={Layers} />
        <KpiCard label="Avg Latency" value="2.4" suffix="s" delay={0.18} icon={Zap} />
      </div>

      <SectionPanel className="!p-0 overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight font-display">Data Ingestion Pipeline</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-sans">6 source categories with unified schema normalization</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-background hover:opacity-80 transition-all px-3.5 py-2 rounded bg-foreground font-sans tracking-wide">
            <Plus className="size-3.5" />Add Source
          </button>
        </div>
        <div className="divide-y divide-border/30">
          {dataSources.map((source, i) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.05 }}
              className="p-5 hover:bg-accent/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`size-10 rounded flex items-center justify-center ${
                    source.status === "active" ? "bg-fin-gain/10" : "bg-chart-3/10"
                  }`}>
                    <Database className={`size-5 ${source.status === "active" ? "text-fin-gain" : "text-chart-3"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground font-sans">{source.name}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        source.status === "active" ? "bg-fin-gain/10 text-fin-gain" : "bg-chart-3/10 text-chart-3"
                      }`}>
                        {source.status === "active" ? <Check className="size-2.5" /> : <CircleDot className="size-2.5 animate-pulse" />}
                        {source.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">Last sync: {source.lastSync}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold font-mono text-foreground">{source.documents.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground font-sans">documents</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-foreground font-sans">{source.refresh}</p>
                    <p className="text-[10px] text-muted-foreground font-sans">refresh rate</p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label={`Settings for ${source.name}`}>
                    <Settings className="size-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel>
        <SectionHeader title="Unified Document Schema" subtitle="PostgreSQL with pgvector extension" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-mono">Field</th>
                <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-mono">Type</th>
                <th className="text-left p-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Description</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[
                { field: "doc_id", type: "UUID", desc: "Primary key" },
                { field: "source", type: "ENUM", desc: "One of six source categories" },
                { field: "raw_text", type: "TEXT", desc: "Full text content" },
                { field: "timestamp", type: "TIMESTAMP", desc: "Original posting or filing date" },
                { field: "geo_zip", type: "VARCHAR(5)", desc: "ZIP code, extracted or inferred" },
                { field: "embedding", type: "VECTOR(768)", desc: "Legal-BERT [CLS] token embedding" },
                { field: "metadata", type: "JSONB", desc: "Source-specific fields" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="p-3 text-primary font-semibold">{row.field}</td>
                  <td className="p-3 text-muted-foreground">{row.type}</td>
                  <td className="p-3 text-muted-foreground font-sans">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </div>
  )
}

// ─── Section: Model Performance ────────────────────────────────

function ModelSection() {
  return (
    <div className={`flex flex-col gap-5 ${SECTION_MIN_H}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Macro F1 Score" value="0.86" delay={0} icon={Cpu} />
        <KpiCard label="Micro F1 Score" value="0.89" delay={0.06} icon={Target} />
        <KpiCard label="Training Samples" value="25,000" delay={0.12} icon={FileText} />
        <KpiCard label="Categories" value="14" delay={0.18} icon={Layers} />
      </div>

      <SectionPanel className="relative overflow-hidden">
        <GlowOrb className="w-48 h-48 -top-24 -right-24 bg-primary/6" />
        <SectionHeader title="Model Architecture" subtitle="Fine-tuned Legal-BERT with multi-label classification head">
          <span className="text-[10px] font-mono bg-muted/50 px-2.5 py-1 rounded-lg text-muted-foreground">nlpaueb/legal-bert-base-uncased</span>
        </SectionHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Layers", value: "12" },
            { label: "Hidden Dim", value: "768" },
            { label: "Attention Heads", value: "12" },
            { label: "Parameters", value: "110M" },
          ].map((spec, i) => (
            <div key={i} className="p-4 rounded bg-muted/30">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em] font-sans">{spec.label}</p>
              <p className="text-xl font-bold font-mono text-foreground mt-1">{spec.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded bg-muted/20 border border-border/30">
          <p className="text-xs text-muted-foreground font-sans leading-relaxed">
            <span className="font-semibold text-foreground">Training Configuration:</span> NVIDIA A100 (80GB HBM2e) via Google Colab Pro+. 
            AdamW optimizer (β₁=0.9, β₂=0.999), learning rate 2×10⁻⁵ with linear warmup, mixed precision (FP16), batch size 64, 8 epochs.
          </p>
        </div>
      </SectionPanel>

      <SectionPanel className="!p-0 overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight font-display">Per-Category Performance</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-sans">Target: F₁ ≥ 0.80 for deployment</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-background hover:opacity-80 transition-all px-3.5 py-2 rounded bg-foreground font-sans tracking-wide">
            <Activity className="size-3.5" />Retrain Model
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Category</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Precision</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Recall</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">F1 Score</th>
                <th className="text-right p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans hidden md:table-cell">Samples</th>
                <th className="text-center p-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">Status</th>
              </tr>
            </thead>
            <tbody>
              {modelMetrics.map((metric, i) => {
                const meetsThreshold = metric.f1 >= 0.80
                return (
                  <motion.tr
                    key={metric.category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 + i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/50 transition-all duration-200"
                  >
                    <td className="p-4"><span className="font-semibold text-foreground font-sans">{metric.category}</span></td>
                    <td className="p-4 text-right font-mono text-muted-foreground">{metric.precision.toFixed(2)}</td>
                    <td className="p-4 text-right font-mono text-muted-foreground">{metric.recall.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <span className={`font-mono font-bold ${meetsThreshold ? "text-fin-gain" : "text-fin-loss"}`}>
                        {metric.f1.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-muted-foreground hidden md:table-cell">{metric.samples.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      {meetsThreshold ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-fin-gain bg-fin-gain/8 px-2.5 py-1 rounded-lg"><Check className="size-3" />Ready</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-fin-loss bg-fin-loss/8 px-2.5 py-1 rounded-lg"><AlertTriangle className="size-3" />Needs Data</span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionPanel>

      <SectionPanel>
        <SectionHeader title="Training Pipeline" subtitle="Three-tier labeling strategy" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tier: "Tier 1", label: "Court Records", desc: "PACER/NYSCEF NOS codes", samples: "15-20k", status: "gold" },
            { tier: "Tier 2", label: "LLM-Assisted", desc: "Claude API with structured prompts", samples: "Full corpus", status: "silver" },
            { tier: "Tier 3", label: "Human Review", desc: "Cornell Law students via Label Studio", samples: "25k target", status: "gold" },
          ].map((tier, i) => (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-4 rounded bg-muted/30 border border-border/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded font-mono">{tier.tier}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  tier.status === "gold" ? "bg-amber-500/10 text-amber-500" : "bg-slate-400/10 text-slate-400"
                }`}>{tier.status}</span>
              </div>
              <p className="text-sm font-bold text-foreground font-sans">{tier.label}</p>
              <p className="text-[11px] text-muted-foreground mt-1 font-sans">{tier.desc}</p>
              <p className="text-xs font-mono text-muted-foreground mt-2">{tier.samples} samples</p>
            </motion.div>
          ))}
        </div>
      </SectionPanel>
    </div>
  )
}

// ─── Section: Settings ──────────────────────────────────────────

function SettingsSection() {
  const [activeTab, setActiveTab] = useState("profile")
  const tabs = [
    { id: "profile", label: "Profile", icon: UserCog },
    { id: "notifications", label: "Alerts", icon: BellRing },
    { id: "security", label: "Security", icon: Lock },
    { id: "display", label: "Display", icon: Monitor },
    { id: "billing", label: "Billing", icon: CreditCard },
  ]

  return (
    <div className={`flex flex-col gap-5 ${SECTION_MIN_H}`}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded bg-card border border-border p-5 lg:p-6 relative overflow-hidden shadow-linen">
        <h3 className="text-lg font-semibold text-foreground font-display tracking-tight">Account Settings</h3>
        <p className="text-xs text-muted-foreground mt-1 font-sans">Manage your profile, alert preferences, and security</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded bg-card border border-border p-3.5 lg:col-span-1 shadow-linen">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left font-sans ${
                    activeTab === tab.id ? "text-primary-foreground bg-primary shadow-linen" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                  <Icon className="size-4" />{tab.label}
                  {activeTab === tab.id && <ChevronRight className="size-3.5 ml-auto text-primary-foreground" />}
                </button>
              )
            })}
            <div className="border-t border-border/50 my-2" />
            <button className="flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-fin-loss/80 hover:text-fin-loss hover:bg-fin-loss/10 border border-transparent hover:border-fin-loss/20 transition-all duration-200 w-full text-left font-sans">
              <LogOut className="size-4" />Sign Out
            </button>
          </nav>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded bg-card border border-border p-5 lg:p-7 lg:col-span-3 shadow-linen">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {activeTab === "profile" && (
                <div className="flex flex-col gap-6">
                  <div><h4 className="text-sm font-bold text-foreground font-display">Team Information</h4><p className="text-xs text-muted-foreground mt-0.5 font-sans">Manage your organization details</p></div>
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-lg bg-primary flex items-center justify-center shadow-linen"><span className="text-lg font-bold text-primary-foreground font-display">LM</span></div>
                    <div><p className="text-sm font-bold text-foreground font-display">Limira Team 38</p><p className="text-xs text-muted-foreground font-sans">Cornell Tech — Enterprise Plan</p></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Organization", value: "Limira Inc.", icon: Building2 },
                      { label: "Email", value: "team@limira.ai", icon: Mail },
                      { label: "API Usage", value: "847,000 / 1M calls", icon: Cpu },
                      { label: "Region", value: "US-East (NYC)", icon: Globe },
                    ].map((field, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.06em] font-sans">{field.label}</label>
                        <div className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-4 py-3 border border-border">
                          <field.icon className="size-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground font-sans">{field.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "notifications" && (
                <div className="flex flex-col gap-6">
                  <div><h4 className="text-sm font-bold text-foreground font-display">Alert Preferences</h4><p className="text-xs text-muted-foreground mt-0.5 font-sans">Choose how you want to be notified about anomalies</p></div>
                  {[
                    { label: "High Severity Anomalies", desc: "Immediate alerts for spikes exceeding 3σ", enabled: true },
                    { label: "New Entity Clusters", desc: "When DBSCAN detects new organization patterns", enabled: true },
                    { label: "Emerging Topics", desc: "BERTopic alerts for new discussion themes", enabled: true },
                    { label: "Model Drift Alerts", desc: "When classification confidence drops below threshold", enabled: false },
                    { label: "Data Source Issues", desc: "Sync failures or API rate limiting", enabled: true },
                    { label: "Weekly Summary", desc: "Aggregated analytics report via email", enabled: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div><p className="text-sm font-semibold text-foreground font-sans">{item.label}</p><p className="text-xs text-muted-foreground mt-0.5 font-sans">{item.desc}</p></div>
                      <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 border ${item.enabled ? "bg-primary border-primary" : "bg-muted border-border"}`}>
                        <div className={`absolute top-0.5 size-5 rounded-full bg-card shadow-linen transition-transform duration-300 ${item.enabled ? "translate-x-5.5" : "translate-x-0.5"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "security" && (
                <div className="flex flex-col gap-5">
                  <div><h4 className="text-sm font-bold text-foreground font-display">Security Settings</h4><p className="text-xs text-muted-foreground mt-0.5 font-sans">Manage API keys and access controls</p></div>
                  {[
                    { label: "Two-Factor Authentication", desc: "Required for all team members", status: "Enabled", statusColor: "text-fin-gain" },
                    { label: "API Keys", desc: "3 active keys for data ingestion", status: "Manage", statusColor: "text-primary" },
                    { label: "IP Allowlist", desc: "Restrict access to approved IPs", status: "Configure", statusColor: "text-primary" },
                    { label: "Audit Logs", desc: "Track all data access and exports", status: "View", statusColor: "text-primary" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-3.5">
                        <div className="size-10 rounded-lg bg-muted flex items-center justify-center border border-border"><Lock className="size-4 text-muted-foreground" /></div>
                        <div><p className="text-sm font-semibold text-foreground font-sans">{item.label}</p><p className="text-xs text-muted-foreground mt-0.5 font-sans">{item.desc}</p></div>
                      </div>
                      <span className={`text-xs font-bold ${item.statusColor}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "display" && (
                <div className="flex flex-col gap-5">
                  <div><h4 className="text-sm font-bold text-foreground font-display">Display Preferences</h4><p className="text-xs text-muted-foreground mt-0.5 font-sans">Customize your dashboard experience</p></div>
                  {[
                    { label: "Theme", desc: "Choose your preferred color scheme", value: "Dark", icon: Palette },
                    { label: "Default View", desc: "Landing section on login", value: "Overview", icon: Eye },
                    { label: "Date Format", desc: "How dates are displayed", value: "YYYY-MM-DD", icon: Calendar },
                    { label: "Chart Animations", desc: "Enable smooth chart transitions", value: "Enabled", icon: Activity },
                  ].map((item, i) => {
                    const Icon = item.icon
                    return (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-3.5">
                          <Icon className="size-4 text-muted-foreground" />
                          <div><p className="text-sm font-semibold text-foreground font-sans">{item.label}</p><p className="text-xs text-muted-foreground font-sans">{item.desc}</p></div>
                        </div>
                        <span className="text-xs font-bold text-foreground bg-muted/60 px-3 py-1.5 rounded-lg font-mono">{item.value}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              {activeTab === "billing" && (
                <div className="flex flex-col gap-6">
                  <div><h4 className="text-sm font-bold text-foreground font-display">Billing & Subscription</h4><p className="text-xs text-muted-foreground mt-0.5 font-sans">Manage your plan and API usage</p></div>
                  <div className="rounded-lg bg-primary/5 border border-primary/15 p-5 flex items-center justify-between shadow-linen">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded bg-primary/12 flex items-center justify-center"><Scale className="size-5 text-primary" /></div>
                      <div><p className="text-sm font-bold text-foreground font-display">Enterprise Plan</p><p className="text-xs text-muted-foreground font-sans">1M API calls/month — Renews Mar 1, 2026</p></div>
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline font-sans">Manage Plan</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] font-sans">API Usage This Month</h5>
                    <div className="h-3 rounded-full bg-muted/60 overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: "84.7%" }} />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">847,000 / 1,000,000 calls (84.7%)</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────

const sectionComponents: Record<SectionId, React.FC> = {
  overview: OverviewSection, cases: CasesSection, anomalies: AnomaliesSection,
  entities: EntitiesSection, media: MediaSection, sources: SourcesSection,
  model: ModelSection, settings: SettingsSection,
}

export default function FinancialAnalyticsDashboard() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifItems, setNotifItems] = useState(notifications)

  const handleNavigation = useCallback((sectionId: SectionId) => {
    if (sectionId === activeSection) return
    setIsTransitioning(true)
    setTimeout(() => { setActiveSection(sectionId); setIsTransitioning(false) }, 180)
  }, [activeSection])

  const handleMarkRead = useCallback((id: number) => { setNotifItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))) }, [])
  const handleMarkAllRead = useCallback(() => { setNotifItems((prev) => prev.map((n) => ({ ...n, read: true }))) }, [])

  const unreadCount = useMemo(() => notifItems.filter((n) => !n.read).length, [notifItems])
  const ActiveComponent = useMemo(() => sectionComponents[activeSection], [activeSection])
  const activeNav = useMemo(() => NAV_ITEMS.find((n) => n.id === activeSection), [activeSection])

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col relative grain">
      {/* Header - Editorial minimal */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30 relative">
        <div className="w-full px-6 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold tracking-tight text-foreground font-display">Limira</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-sans tracking-wide">
                <span className="uppercase text-[10px]">Platform</span>
                <span className="text-border">/</span>
                <span className="text-foreground font-medium">{activeNav?.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded hover:bg-accent/50 transition-colors" aria-label="Search">
                <Search className="size-4 text-muted-foreground" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  className="p-2 rounded hover:bg-accent/50 transition-colors relative"
                  aria-label="Notifications" aria-expanded={notificationsOpen}
                >
                  <Bell className="size-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING}
                      className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-foreground text-background text-[9px] font-medium flex items-center justify-center font-mono">
                      {unreadCount}
                    </motion.span>
                  )}
                </button>
                <NotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} items={notifItems} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} />
              </div>
              <button className="p-2 rounded hover:bg-accent/50 transition-colors" aria-label="Settings" onClick={() => handleNavigation("settings")}>
                <Settings className="size-4 text-muted-foreground" />
              </button>
              <div className="size-8 rounded bg-foreground flex items-center justify-center ml-1 cursor-pointer hover:opacity-80 transition-opacity">
                <span className="text-[10px] font-semibold text-background font-sans tracking-wide">LM</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Clean tabs */}
      <nav className="border-b border-border bg-card/60 sticky top-14 z-20 relative">
        <div className="w-full px-6 lg:px-12 xl:px-16">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === activeSection
              const Icon = item.icon
              return (
                <button key={item.id} onClick={() => handleNavigation(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium rounded transition-all duration-200 whitespace-nowrap shrink-0 font-sans tracking-wide ${
                    isActive ? "text-background bg-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="w-full px-6 lg:px-12 xl:px-16 py-8 lg:py-10 flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isTransitioning ? 0.3 : 1, y: isTransitioning ? 6 : 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer - Minimal editorial */}
      <footer className="border-t border-border mt-auto relative z-10">
        <div className="w-full px-6 lg:px-12 xl:px-16 py-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-sans tracking-wide">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-fin-gain" />
                <span className="font-medium uppercase">Operational</span>
              </div>
              <span className="text-border hidden sm:inline">|</span>
              <span className="hidden sm:inline">6 sources connected</span>
            </div>
            <span className="font-mono text-muted-foreground/70">Feb 20, 2026 08:15</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
