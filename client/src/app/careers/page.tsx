'use client';

import Link from "next/link";
import { ArrowLeft, Briefcase, Palette, Wrench, HeartPulse, HandHelping, Building2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface JobRole {
  id: string;
  roleName: string;
  jobCollar: string;
}

const CATEGORY_META: Record<string, { label: string; icon: typeof Briefcase; color: string }> = {
  white: { label: "Professional & Office", icon: Building2, color: "text-dusty-blue dark:text-[#67E8F9]" },
  blue: { label: "Skilled Trades & Technical", icon: Wrench, color: "text-sage-green dark:text-[#34D399]" },
  healthcare: { label: "Healthcare & Wellness", icon: HeartPulse, color: "text-terracotta dark:text-[#F87171]" },
  service: { label: "Service & Community", icon: HandHelping, color: "text-amber-600 dark:text-[#FBBF24]" },
  arts: { label: "Creative & Arts", icon: Palette, color: "text-purple-600 dark:text-[#A78BFA]" },
};

export default function Careers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: roles = [], isLoading } = useQuery<JobRole[]>({
    queryKey: ["/api/job-roles"],
  });

  const grouped: Record<string, string[]> = {};
  for (const role of roles) {
    if (!grouped[role.jobCollar]) grouped[role.jobCollar] = [];
    grouped[role.jobCollar].push(role.roleName);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.localeCompare(b));
  }

  const categoryOrder = ["white", "healthcare", "blue", "service", "arts"];
  const filteredCategories = categoryOrder.filter(cat => grouped[cat]);

  const lowerSearch = searchTerm.toLowerCase().trim();
  const filteredGrouped: Record<string, string[]> = {};
  for (const cat of filteredCategories) {
    const filtered = (grouped[cat] || []).filter(name => name.toLowerCase().includes(lowerSearch));
    if (filtered.length > 0) filteredGrouped[cat] = filtered;
  }

  const totalRoles = roles.length;
  const totalFiltered = Object.values(filteredGrouped).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-soft-cream dark:bg-[#0A0A12] text-warm-gray dark:text-[#F8FAFC]">
      <header className="sticky top-0 z-50 px-6 py-4 bg-soft-cream/90 dark:bg-[#0A0A12]/90 backdrop-blur-sm border-b border-warm-gray/10 dark:border-[#A78BFA]/10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-warm-gray/70 dark:text-[#94A3B8] hover:text-terracotta dark:hover:text-[#A78BFA] transition-colors" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-7 h-7 text-terracotta dark:text-[#A78BFA]" />
            <h1 className="text-3xl font-display font-bold" data-testid="text-careers-title">Career Paths</h1>
          </div>
          <p className="text-warm-gray/70 dark:text-[#94A3B8] leading-relaxed">
            Explore the {totalRoles}+ career roles we match against your personality profile. Take the quiz to see which ones fit you best.
          </p>
        </div>

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

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-6 w-48 bg-warm-gray/10 dark:bg-white/10 rounded mb-3" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <div key={j} className="h-10 bg-warm-gray/5 dark:bg-white/5 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
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
            Take the personality quiz to discover which of these {totalRoles}+ careers align with your unique trait blend.
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
    </div>
  );
}
