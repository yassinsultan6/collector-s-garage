"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { SwipeGallery } from "@/components/swipe-gallery";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  CarFront,
  CircleDollarSign,
  Fuel,
  Gauge,
  History,
  House,
  KeyRound,
  MapPin,
  MessageSquareText,
  ScanLine,
  Settings,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import {
  buildVehicleSubtitle,
  getInitials,
  getVehicleTypeLabel,
  getVehicleTypeOptions,
} from "@/lib/vehicle-utils";

type Language = "en" | "ar";

type VehicleFormState = {
  name: string;
  type: string;
  customType: string;
  year: string;
  location: string;
  garage: string;
  specs: string;
  photos: string;
  maintenanceRecords: string;
  licenseInfo: string;
  restorationHistory: string;
  tuningDetails: string;
  spareKeys: string;
  documents: string;
  comments: string;
  timeline: string;
};

type Vehicle = {
  id: string;
  name: string;
  type: string;
  customType?: string;
  year?: string;
  location?: string;
  garage?: string;
  specs?: string;
  photos?: string;
  maintenanceRecords?: string;
  licenseInfo?: string;
  restorationHistory?: string;
  tuningDetails?: string;
  spareKeys?: string;
  documents?: string;
  comments?: string;
  timeline?: string;
  createdAt: string;
  updatedAt: string;
};

const galleryImages = [
  {
    title: "Restoration reveal",
    before: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Private concierge",
    before: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80",
    after: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
  },
];

const emptyForm: VehicleFormState = {
  name: "",
  type: "Classic car",
  customType: "",
  year: "",
  location: "",
  garage: "",
  specs: "",
  photos: "",
  maintenanceRecords: "",
  licenseInfo: "",
  restorationHistory: "",
  tuningDetails: "",
  spareKeys: "",
  documents: "",
  comments: "",
  timeline: "",
};

// Translations migrated to /locales/*.json and accessed via useTranslation()

export default function CollectorGarage() {
  const { lang: language, setLang, t } = useTranslation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // t() returns translations from the I18nProvider

  useEffect(() => {
    // document direction and lang handled by I18nProvider
  }, [language]);

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/vehicles");
        if (!response.ok) throw new Error("Unable to load vehicles");
        const nextVehicles = (await response.json()) as Vehicle[];
        setVehicles(nextVehicles);
        if (nextVehicles[0]) {
          setSelectedVehicleId(nextVehicles[0].id);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load vehicles");
      } finally {
        setLoading(false);
      }
    };

    void loadVehicles();
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehicles[0],
    [selectedVehicleId, vehicles],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      const nextVehicle = (await response.json()) as Vehicle;
      const nextVehicles = [nextVehicle, ...vehicles];
      setVehicles(nextVehicles);
      setSelectedVehicleId(nextVehicle.id);
      setForm(emptyForm);
      setSavedMessage(t("notifications.saved") as string);
      window.setTimeout(() => setSavedMessage(null), 2600);
    }

    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_38%),linear-gradient(135deg,_#07111f_0%,_#0f172a_100%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
        <LoadingState title="Preparing your collection" description="The luxury dashboard is loading your vehicles, garages, and service overview." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_38%),linear-gradient(135deg,_#07111f_0%,_#0f172a_100%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
        <ErrorState title="Dashboard unavailable" description={error} action={<button type="button" onClick={() => window.location.reload()} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">Try again</button>} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_38%),linear-gradient(135deg,_#07111f_0%,_#0f172a_100%)] text-slate-100">
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_24px_120px_rgba(15,23,42,0.4)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-3 text-amber-300">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-[0.32em]">
                  {String(t("header.subtitle"))}
                </span>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold sm:text-5xl">{String(t("header.title"))}</h1>
                <p className="text-base text-slate-300 sm:text-lg">{String(t("header.description"))}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start">
              <Link href="/admin" className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20">
                Admin dashboard
              </Link>
              <button
                type="button"
                onClick={() => setLang(language === "en" ? "ar" : "en")}
                className="rounded-full border border-white/20 bg-slate-950/40 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-900"
              >
                {String(t("header.toggle"))}
              </button>
            </div>
          </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
            {(() => {
              const stats = t("stats") as unknown as { label: string; value: string }[];
              return stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              ));
            })()}
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 shadow-[0_24px_120px_rgba(15,23,42,0.4)] backdrop-blur"
        >
          <div className="relative aspect-video w-full">
            <motion.img
              src="/collection-hero.jpg"
              alt="Yehia Rashdan's Collection"
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Yehia Rashdan's Collection</h2>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">Premium automobiles curated and managed with precision</p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_80px_rgba(2,6,23,0.4)] backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.28em] text-amber-300">
              <Camera className="h-4 w-4" />
              {String(t("gallery.privateGallery"))}
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <SwipeGallery items={galleryImages} />
              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <ScanLine className="h-4 w-4 text-amber-300" />
                    Premium storytelling
                  </div>
                  <p className="mt-3 text-sm text-slate-300">Every gallery touchpoint is optimized for swipe gestures on mobile and a large immersive layout on desktop.</p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                  Collections stay responsive with touch-ready cards, quick filters, and contextual actions for each vehicle.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_80px_rgba(2,6,23,0.4)] backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.28em] text-amber-300">
              <Gauge className="h-4 w-4" />
              Concierge intelligence
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: House, label: "Garages", value: "6 private vaults" },
                { icon: ShieldCheck, label: "Insurance", value: "Always protected" },
                { icon: Fuel, label: "Fuel & fluids", value: "Live service logs" },
                { icon: Settings, label: "Admin controls", value: "Configurable fields" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4"
                  >
                    <div className="flex items-center gap-2 text-amber-200">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">{item.value}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 space-y-3 rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
              {[
                { icon: History, title: "Timeline history", text: "Every milestone is tracked with optional notes and dates." },
                { icon: MessageSquareText, title: "Collector comments", text: "Private remarks stay attached to each profile." },
                { icon: BadgeCheck, title: "Documents", text: "Keys, insurance, and ownership paperwork remain optional entries." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-slate-950/70 p-3">
                    <div className="rounded-full bg-amber-400/10 p-2 text-amber-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.form
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_80px_rgba(2,6,23,0.4)] backdrop-blur"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">{String(t("form.title"))}</h2>
                <p className="mt-2 text-sm text-slate-400">{String(t("form.helper"))}</p>
              </div>
              <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm text-amber-200">
                {String(t("form.sections.overview"))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.name"))}</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none ring-0 transition focus:border-amber-400"
                  placeholder="e.g. R-8 Vision"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.type"))}</span>
                <select
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none transition focus:border-amber-400"
                >
                  {getVehicleTypeOptions().map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value="Custom">Custom</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.customType"))}</span>
                <input
                  value={form.customType}
                  onChange={(event) => setForm({ ...form, customType: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional custom class"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.year"))}</span>
                <input
                  value={form.year}
                  onChange={(event) => setForm({ ...form, year: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.location"))}</span>
                <input
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.garage"))}</span>
                <input
                  value={form.garage}
                  onChange={(event) => setForm({ ...form, garage: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="mt-6 space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-200">
                <Wrench className="h-4 w-4" />
                {String(t("form.sections.history"))}
              </div>
              <label className="block space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.specs"))}</span>
                <textarea
                  value={form.specs}
                  onChange={(event) => setForm({ ...form, specs: event.target.value })}
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.photos"))}</span>
                <textarea
                  value={form.photos}
                  onChange={(event) => setForm({ ...form, photos: event.target.value })}
                  className="min-h-20 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.maintenanceRecords"))}</span>
                <textarea
                  value={form.maintenanceRecords}
                  onChange={(event) => setForm({ ...form, maintenanceRecords: event.target.value })}
                  className="min-h-20 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="mt-6 space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-200">
                <KeyRound className="h-4 w-4" />
                {String(t("form.sections.documents"))}
              </div>
              <label className="block space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.licenseInfo"))}</span>
                <textarea
                  value={form.licenseInfo}
                  onChange={(event) => setForm({ ...form, licenseInfo: event.target.value })}
                  className="min-h-20 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.restorationHistory"))}</span>
                <textarea
                  value={form.restorationHistory}
                  onChange={(event) => setForm({ ...form, restorationHistory: event.target.value })}
                  className="min-h-20 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.tuningDetails"))}</span>
                <textarea
                  value={form.tuningDetails}
                  onChange={(event) => setForm({ ...form, tuningDetails: event.target.value })}
                  className="min-h-20 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.spareKeys"))}</span>
                <textarea
                  value={form.spareKeys}
                  onChange={(event) => setForm({ ...form, spareKeys: event.target.value })}
                  className="min-h-20 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-300">
                <span>{String(t("form.fieldLabels.documents"))}</span>
                <textarea
                  value={form.documents}
                  onChange={(event) => setForm({ ...form, documents: event.target.value })}
                  className="min-h-20 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                  placeholder="Optional"
                />
              </label>
            </div>

            <label className="mt-6 block space-y-2 text-sm text-slate-300">
              <span>{String(t("form.fieldLabels.comments"))}</span>
              <textarea
                value={form.comments}
                onChange={(event) => setForm({ ...form, comments: event.target.value })}
                className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                placeholder="Optional"
              />
            </label>

            <label className="mt-6 block space-y-2 text-sm text-slate-300">
              <span>{String(t("form.fieldLabels.timeline"))}</span>
              <textarea
                value={form.timeline}
                onChange={(event) => setForm({ ...form, timeline: event.target.value })}
                className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-amber-400"
                placeholder="Optional"
              />
            </label>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : String(t("form.saveButton"))}
              </button>
              <AnimatePresence>
                {savedMessage ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {savedMessage}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.form>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-6"
          >
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_80px_rgba(2,6,23,0.4)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{String(t("form.detailTitle"))}</h2>
                    <p className="mt-2 text-sm text-slate-400">{String(t("form.detailHelper"))}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/10 p-3">
                  <CarFront className="h-5 w-5 text-amber-300" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {vehicles.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-5 text-sm text-slate-400">
                    {String(t("form.emptyState"))}
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <button
                      type="button"
                      key={vehicle.id}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`w-full rounded-[1.25rem] border p-4 text-left transition ${selectedVehicleId === vehicle.id ? "border-amber-400/50 bg-amber-400/10" : "border-white/10 bg-slate-900/60 hover:border-amber-400/30"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-300">{getVehicleTypeLabel(vehicle.type, vehicle.customType)}</p>
                          <p className="text-lg font-semibold text-white">{vehicle.name}</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-amber-200">
                          {getInitials(vehicle.name)}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-400">{buildVehicleSubtitle(vehicle)}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedVehicle ? (
                <motion.div
                  key={selectedVehicle.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_80px_rgba(2,6,23,0.4)] backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
                        {selectedVehicle.type}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{selectedVehicle.name}</h3>
                      <p className="mt-2 text-sm text-slate-400">{buildVehicleSubtitle(selectedVehicle)}</p>
                    </div>
                    <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-amber-200">
                      Draft
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin className="h-4 w-4 text-amber-300" />
                        {selectedVehicle.location || "Optional collection location"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CalendarDays className="h-4 w-4 text-amber-300" />
                        {selectedVehicle.year || "Optional model year"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CircleDollarSign className="h-4 w-4 text-amber-300" />
                        {selectedVehicle.garage || "Optional garage name"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Wrench className="h-4 w-4 text-amber-300" />
                        {selectedVehicle.maintenanceRecords || "Maintenance logs can be added later"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    <p>{selectedVehicle.specs || "Specifications can be entered whenever the collector wants to refine the profile."}</p>
                    <p>{selectedVehicle.documents || "Documents and keys remain completely optional until the admin chooses to add them."}</p>
                    <p>{selectedVehicle.timeline || "The full timeline can be filled in over time as the car evolves."}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.aside>
        </section>
        </main>
    </div>
  );
}
