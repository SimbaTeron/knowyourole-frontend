'use client';

import Link from "next/link";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { ArrowLeft, Briefcase, Palette, Wrench, HeartPulse, HandHelping, Building2, Search } from "lucide-react";
import { useState } from "react";
import type { CareerCatalogRole } from "@/lib/job-role-catalog";

const CATEGORY_META: Record<string, { label: string; icon: typeof Briefcase; color: string }> = {
  white: { label: "Professional & Office", icon: Building2, color: "text-dusty-blue dark:text-[#67E8F9]" },
  blue: { label: "Skilled Trades & Technical", icon: Wrench, color: "text-sage-green dark:text-[#34D399]" },
  healthcare: { label: "Healthcare & Wellness", icon: HeartPulse, color: "text-terracotta dark:text-[#F87171]" },
  service: { label: "Service & Community", icon: HandHelping, color: "text-amber-600 dark:text-[#FBBF24]" },
  arts: { label: "Creative & Arts", icon: Palette, color: "text-purple-600 dark:text-[#A78BFA]" },
};

type CatalogPresentation =
  | { state: "ready"; roleCount: number; intro: string; cta: string }
  | { state: "empty"; intro: string; cta: string }
  | { state: "unavailable"; intro: string; cta: string };

function getCatalogPresentation(roleCount: number, loadError: boolean): CatalogPresentation {
  if (loadError) {
    return {
      state: "unavailable",
      intro: "Career paths are temporarily unavailable. Please try again soon.",
      cta: "Take the personality quiz to start exploring career directions matched to your work style.",
    };
  }

  if (roleCount === 0) {
    return {
      state: "empty",
      intro: "Explore career paths matched to your work style.",
      cta: "Take the personality quiz to start exploring career directions matched to your work style.",
    };
  }

  return {
    state: "ready",
    roleCount,
    intro: `Explore the ${roleCount} career roles we match against your personality profile. Take the quiz to see which ones fit you best.`,
    cta: `Take the personality quiz to discover which of these ${roleCount} careers align with your unique trait blend.`,
  };
}

type CareersClientProps = {
  roles: CareerCatalogRole[];
  loadError: boolean;
};

export default function CareersClient({ roles, loadError }: CareersClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const grouped: Record<string, string[]> = {};
  for (const role of roles) {
    if (!grouped[role.category]) grouped[role.category] = [];
    grouped[role.category].push(role.roleName);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.localeCompare(b));
  }

  const filteredCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  const lowerSearch = searchTerm.toLowerCase().trim();
  const filteredGrouped: Record<string, string[]> = {};
  for (const cat of filteredCategories) {
    const filtered = (grouped[cat] || []).filter(name => name.toLowerCase().includes(lowerSearch));
    if (filtered.length > 0) filteredGrouped[cat] = filtered;
  }

  const totalRoles = roles.length;
  const presentation = getCatalogPresentation(totalRoles, loadError);
  const isReady = presentation.state === "ready";
  const totalFiltered = Object.values(filteredGrouped).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-soft-cream dark:bg-[#0A0A12] text-warm-gray dark:text-[#F8FAFC]">
      <AppHeader />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-7 h-7 text-terracotta dark:text-[#A78BFA]" />
            <h1 className="text-3xl font-display font-bold" data-testid="text-careers-title">Career Paths</h1>
          </div>
          <p className="text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed">
            {presentation.intro}
          </p>
        </div>

        {isReady && (
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/40 dark:text-[#64748B]" />
            <input
              type="text"
              placeholder="Search careers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/10 dark:border-[#A78BFA]/10 text-warm-gray dark:text-[#F8FAFC] placeholder:text-warm-gray/40 dark:placeholder:text-[#64748B] focus:outline-none focus:border-terracotta dark:focus:border-[#A78BFA] transition-colors"
              data-testid="input-career-search"
            />
            {searchTerm && (
              <p className="text-xs text-warm-gray/50 dark:text-[#64748B] mt-2">
                Showing {totalFiltered} of {totalRoles} careers
              </p>
            )}
          </div>
        )}

        {presentation.state === "unavailable" ? (
          <p className="text-center text-warm-gray/60 dark:text-[#94A3B8] py-8" role="alert" data-testid="text-careers-unavailable">
            The career catalog is temporarily unavailable. Please try again soon.
          </p>
        ) : presentation.state === "empty" ? (
          <p className="text-center text-warm-gray/60 dark:text-[#94A3B8] py-8" data-testid="text-careers-pending">
            Career paths are being curated. Take the quiz to start exploring your work style.
          </p>
        ) : Object.keys(filteredGrouped).length === 0 ? (
          <p className="text-center text-warm-gray/50 dark:text-[#64748B] py-8" data-testid="text-no-results">
            No careers match "{searchTerm}"
          </p>
        ) : (
          <div className="space-y-8">
            {Object.keys(filteredGrouped).map(cat => {
              const meta = CATEGORY_META[cat] || { label: cat, icon: Briefcase, color: "text-warm-gray" };
              const CategoryIcon = meta.icon;
              const names = filteredGrouped[cat];
              return (
                <section key={cat} data-testid={`section-category-${cat}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon className={`w-5 h-5 ${meta.color}`} />
                    <h2 className="text-lg font-display font-semibold">
                      {meta.label}
                    </h2>
                    <span className="text-xs text-warm-gray/40 dark:text-[#64748B] ml-1">
                      ({names.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {names.map(name => (
                      <div
                        key={name}
                        className="px-3 py-2.5 rounded-lg bg-warm-gray/5 dark:bg-white/5 border border-warm-gray/8 dark:border-[#A78BFA]/8 text-sm text-warm-gray/80 dark:text-[#E2E8F0]"
                        data-testid={`career-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-12 p-5 rounded-xl bg-terracotta/5 dark:bg-[#A78BFA]/5 border border-terracotta/10 dark:border-[#A78BFA]/15 text-center">
          <h3 className="font-semibold text-warm-gray dark:text-[#F8FAFC] mb-2">Find Your Best Match</h3>
          <p className="text-sm text-warm-gray/60 dark:text-[#94A3B8] mb-4">
            {presentation.cta}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-terracotta dark:bg-[#A78BFA] text-white font-medium text-sm transition-opacity hover:opacity-90"
            data-testid="link-take-quiz"
          >
            Take the Quiz
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
