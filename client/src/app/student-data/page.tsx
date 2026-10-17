import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata("/student-data");

/*
 * LEGAL REVIEW REQUIRED: this page is a plain-English draft, not legal advice.
 * A lawyer should review the FERPA, COPPA, SOPIPA / AB 1584 and NY Ed Law 2-d
 * statements before schools rely on them.
 * Retention (30 days) and deletion window (30 days) confirmed by the owner.
 * Retention matches purge_expired_anonymous_result_data() (supabase/migrations/006),
 * run daily by the Vercel cron in client/vercel.json. Change both together.
 * OWNER TO CONFIRM: data controller name and mailing address. See OWNER_VALUES below.
 */
const OWNER_VALUES = {
  retention: "30 days", // must match INTERVAL '30 days' in purge_expired_anonymous_result_data()
  deletionWindow: "30 days",
  controller: "KnowYouRole", // OWNER TO CONFIRM: legal entity or owner name
  contact: "info@knowyourole.com",
} as const;

const stored = [
  "Your quiz answers and the result they produce",
  "A random session ID so your result can be shown and recovered",
  "The age range you pick, so the wording fits your age",
  "Anonymous feedback, only if you choose to send it",
];

const notStored = [
  "Names, student ID numbers or grades",
  "School name, home address or phone number",
  "Accounts or passwords (none are needed)",
  "Email addresses, unless someone 13 or older asks for one (see below)",
];

const sectionClass = "rounded-3xl border border-[#12263a]/12 bg-white/75 p-6 shadow-[0_14px_35px_rgba(18,38,58,0.06)] sm:p-7";
const h2Class = "font-display text-2xl font-bold tracking-[-0.025em]";
const pClass = "mt-3 text-sm leading-relaxed text-[#405f72]";
const listClass = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#405f72]";
const linkClass = "font-semibold text-[#315f74] underline underline-offset-4";

export default function StudentDataPage() {
  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#12263a]">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#a3402b]">For schools, parents & students</p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-[-0.05em] sm:text-5xl">Student data and privacy</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#405f72]">
          KnowYouRole is a free work-style quiz. Students don&apos;t need an account and never give us their name. This page explains, in plain English, exactly what we keep and how a school or parent can ask us to delete it.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="What we store">
          <article className={sectionClass}>
            <h2 className={h2Class}>What we store</h2>
            <ul className={listClass}>{stored.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article className={`${sectionClass} bg-[#edf5f4]`}>
            <h2 className={h2Class}>What we don&apos;t collect</h2>
            <ul className={listClass}>{notStored.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </section>

        <div className="mt-4 space-y-4">
          <section className={sectionClass}>
            <h2 className={h2Class}>How long we keep it</h2>
            <p className={pClass}>
              Quiz results are kept for <strong>{OWNER_VALUES.retention}</strong>, then deleted automatically by a daily cleanup. Because results have no name attached, we use them only to show a result again and to improve the quiz.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>Deleting a result</h2>
            <p className={pClass}>
              A school, parent, guardian or student can ask us to delete a result by emailing <a className={linkClass} href={`mailto:${OWNER_VALUES.contact}`}>{OWNER_VALUES.contact}</a>. Include the result link or session ID if you have it, since results have no name to search by. We delete it within <strong>{OWNER_VALUES.deletionWindow}</strong> and reply to confirm.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>No selling, no ads, no marketing profiles</h2>
            <ul className={listClass}>
              <li>We never sell student data or quiz results.</li>
              <li>We don&apos;t show ads, and no advertising cookies or pixels are active.</li>
              <li>We don&apos;t use student data to build profiles for marketing or to target anyone.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>Analytics only with consent</h2>
            <p className={pClass}>
              Google Analytics loads only after someone turns it on in cookie settings. It measures things like page visits and quiz completions. We don&apos;t send quiz answers, names or email addresses to it. Schools can leave it off; the quiz works the same either way.
            </p>
          </section>

          <section className={`${sectionClass} bg-[#fff5d8]`}>
            <h2 className={h2Class}>Students under 13</h2>
            <ul className={`${listClass} text-[#5a451a]`}>
              <li>For grades 6–7 and anyone under 13, we recommend teacher-led use, with an educator in the room.</li>
              <li>Students should not enter any personal information. The quiz never asks for it.</li>
              <li>Emailing a result is only for people 13 or older. Students under 13 can print or save their result instead.</li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>Optional results email (13 and older)</h2>
            <p className={pClass}>
              This feature is not live yet. When it is, people 13 or older can ask for a one-time copy of their result. We delete that email address after sending. Updates are sent only if someone ticks a box and confirms by email, and we keep that address until they unsubscribe.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>Laws for schools</h2>
            <ul className={listClass}>
              <li><strong>FERPA:</strong> we don&apos;t ask for or receive education records. If a school chooses to give us student records, we would handle them as a &quot;school official&quot; under the school&apos;s direct control, use them only for the school&apos;s purpose, and not share them.</li>
              <li><strong>COPPA:</strong> the quiz doesn&apos;t ask children for personal information. For students under 13, we rely on teacher-led use and don&apos;t collect email addresses.</li>
              <li><strong>California (SOPIPA and AB 1584):</strong> we follow their core rules: no selling student data, no targeted ads, no marketing profiles, and deletion on a school&apos;s request.</li>
              <li><strong>New York (Education Law 2-d):</strong> New York schools may need a Parents&apos; Bill of Rights and a data privacy agreement. Contact us and we&apos;ll work through your district&apos;s agreement.</li>
            </ul>
            <p className={pClass}>Your district&apos;s own student-data rules always come first.</p>
          </section>

          <section className={sectionClass}>
            <h2 className={h2Class}>Who is responsible and how to reach us</h2>
            <p className={pClass}>
              {OWNER_VALUES.controller} is responsible for the data described here. For questions, deletion requests or a district data privacy agreement, email <a className={linkClass} href={`mailto:${OWNER_VALUES.contact}`}>{OWNER_VALUES.contact}</a>.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
              <Link className={linkClass} href="/privacy">Full privacy policy</Link>
              <Link className={linkClass} href="/terms#school-use">School use in our Terms</Link>
              <Link className={linkClass} href="/for-schools">For schools</Link>
            </div>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
