'use client';

import { useState, useEffect, useRef } from 'react';

interface FeedbackPayload {
  first_reaction: string;
  first_reaction_text: string;
  accuracy_score: number;
  accuracy_surprise: string;
  personality_rating: number | null;
  career_rating: number | null;
  mood_lab_rating: number | null;
  visual_rating: number | null;
  share_card_rating: number | null;
  most_valuable_feature: string;
  retake_quiz: string;
  shared_results: string;
  nps_score: number | null;
  career_relevance: number | null;
  feels_designed_for_you: string;
  college_suggestions: string;
  bugs_issues: string;
  email: string;
  anything_else: string;
  quiz_type: string;
  mbti_type: string;
  disc_style: string;
  primary_role: string;
  tier: string;
}

const EMOJI_OPTIONS = [
  { emoji: '💡', label: 'Loved it', value: 'loved_it' },
  { emoji: '🤔', label: 'Interesting', value: 'interesting' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😕', label: 'Confused', value: 'confused' },
  { emoji: '❌', label: 'Off target', value: 'off_target' },
];

const STAR_LABELS = ['terrible', 'poor', 'fair', 'good', 'excellent', 'outstanding', 'amazing'];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          style={{ color: star <= value ? '#FFD700' : '#444' }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function YNGrid({ options, selected, onChange }: { options: string[]; selected: string | undefined; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
          style={{
            background: selected === opt ? '#6366f1' : 'transparent',
            borderColor: selected === opt ? '#6366f1' : '#444',
            color: selected === opt ? '#fff' : '#aaa',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function LikertScale({ options, selected, onChange }: { options: string[]; selected: number | null | undefined; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((_, i) => {
        const num = i + 1;
        return (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className="w-10 h-10 rounded-full border text-sm font-bold transition-all"
            style={{
              background: selected === num ? '#6366f1' : 'transparent',
              borderColor: selected === num ? '#6366f1' : '#444',
              color: selected === num ? '#fff' : '#aaa',
            }}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}

export default function FeedbackPage() {
  const [form, setForm] = useState<FeedbackPayload>({
    first_reaction: '',
    first_reaction_text: '',
    accuracy_score: 5,
    accuracy_surprise: '',
    personality_rating: null,
    career_rating: null,
    mood_lab_rating: null,
    visual_rating: null,
    share_card_rating: null,
    most_valuable_feature: '',
    retake_quiz: '',
    shared_results: '',
    nps_score: null,
    career_relevance: null,
    feels_designed_for_you: '',
    college_suggestions: '',
    bugs_issues: '',
    email: '',
    anything_else: '',
    quiz_type: '',
    mbti_type: '',
    disc_style: '',
    primary_role: '',
    tier: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Pull personality data from URL params (passed from results pages)
    const params = new URLSearchParams(window.location.search);
    setForm((prev) => ({
      ...prev,
      mbti_type: params.get('mbti') || '',
      disc_style: params.get('disc') || '',
      primary_role: params.get('role') || '',
      tier: params.get('tier') || '',
      quiz_type: params.get('quiz_type') || 'full',
    }));
  }, []);

  const update = (field: keyof FeedbackPayload, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(#050510 0%, #020024 50%, #000 100%)' }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-3">Feedback received!</h1>
          <p className="text-gray-400 mb-6">Thanks for taking the time to share your thoughts. You rock.</p>
          <a href="/" className="text-indigo-400 hover:text-indigo-300 underline">Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(#050510 0%, #020024 50%, #000 100%)', fontFamily: 'Outfit, sans-serif' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-sm font-bold tracking-widest text-indigo-400 mb-2">KNOWYOUROLE</div>
          <h1 className="text-3xl font-bold text-white mb-2">Tell us what you really think.</h1>
          <p className="text-gray-400 text-sm">
            You just finished the <span className="text-white font-medium">KnowYouRole personality quiz</span> — we want to hear what landed, what missed, and everything in between. This takes <span className="text-white font-medium">under 3 minutes</span>.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">

          {/* Section 1: First Impressions */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-700/30 rounded-full px-3 py-1">01</span>
              <h2 className="text-lg font-semibold text-white">First Impressions</h2>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              What was your <strong className="text-white">first reaction</strong> when you saw your personality results?*
            </p>
            <div className="flex flex-wrap gap-3">
              {EMOJI_OPTIONS.map(({ emoji, label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('first_reaction', value)}
                  className="rounded-xl border px-4 py-2 text-sm flex items-center gap-2 transition-all"
                  style={{
                    background: form.first_reaction === value ? '#6366f1' : 'transparent',
                    borderColor: form.first_reaction === value ? '#6366f1' : '#444',
                    color: form.first_reaction === value ? '#fff' : '#aaa',
                  }}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>

            <p className="text-gray-300 text-sm mt-5 mb-2">
              In one sentence — what went through your head when you got your results?*
            </p>
            <textarea
              value={form.first_reaction_text}
              onChange={(e) => update('first_reaction_text', e.target.value)}
              placeholder="e.g. 'I didn't expect CONSCIOUSNESS to be my highest trait but... honestly accurate.'"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
              rows={2}
            />
          </section>

          {/* Section 2: Feature Breakdown */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-700/30 rounded-full px-3 py-1">02</span>
              <h2 className="text-lg font-semibold text-white">Feature Breakdown</h2>
            </div>
            <p className="text-gray-300 text-sm mb-5">Rate each part of the experience:*</p>

            {[
              { field: 'personality_rating' as const, emoji: '🧬', label: 'Your Blended Personality Profile' },
              { field: 'career_rating' as const, emoji: '💼', label: 'Career Matches from 150+ Roles' },
              { field: 'mood_lab_rating' as const, emoji: '🧪', label: 'Mood Alchemy / Mood Lab' },
              { field: 'visual_rating' as const, emoji: '✨', label: 'Visual Design & Layout' },
              { field: 'share_card_rating' as const, emoji: '📤', label: 'Share Card / Shareable Results' },
            ].map(({ field, emoji, label }) => (
              <div key={field} className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-sm text-gray-300">{emoji} {label}</span>
                <StarRating value={form[field] ?? 0} onChange={(v) => update(field, v)} />
              </div>
            ))}

            <p className="text-gray-300 text-sm mt-5 mb-3">
              Which feature felt <strong className="text-white">most valuable</strong> to you?
            </p>
            <select
              value={form.most_valuable_feature}
              onChange={(e) => update('most_valuable_feature', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="" className="bg-[#0a0a1a]">Pick one...</option>
              <option value="personality_profile" className="bg-[#0a0a1a]">My Blended Personality Profile</option>
              <option value="career_matches" className="bg-[#0a0a1a]">Career Matches from 150+ Roles</option>
              <option value="mood_lab" className="bg-[#0a0a1a]">Mood Alchemy Lab</option>
              <option value="visual_design" className="bg-[#0a0a1a]">Visual Design & Layout</option>
              <option value="share_card" className="bg-[#0a0a1a]">Shareable Results Card</option>
              <option value="other" className="bg-[#0a0a1a]">Other</option>
            </select>
          </section>

          {/* Section 3: Accuracy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-700/30 rounded-full px-3 py-1">03</span>
              <h2 className="text-lg font-semibold text-white">Did It Get You Right?</h2>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              How accurate did your results feel?* <span className="text-gray-500">(Completely off → Spot on)</span>
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={form.accuracy_score}
                onChange={(e) => update('accuracy_score', parseInt(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
              <span className="text-xs text-gray-500">10</span>
              <span className="text-white font-bold text-lg min-w-[2rem] text-center">{form.accuracy_score}</span>
            </div>

            <p className="text-gray-300 text-sm mt-5 mb-2">
              What surprised you most — either a trait or a career match that felt unexpected?
            </p>
            <textarea
              value={form.accuracy_surprise}
              onChange={(e) => update('accuracy_surprise', e.target.value)}
              placeholder="e.g. 'I never thought I'd get Architect (INTJ) but the description of high openness + low extraversion was uncomfortably accurate...'"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
              rows={2}
            />
          </section>

          {/* Section 4: Would You */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-700/30 rounded-full px-3 py-1">04</span>
              <h2 className="text-lg font-semibold text-white">What Would You Do?</h2>
            </div>

            <p className="text-gray-300 text-sm mb-3">
              Would you <strong className="text-white">retake the quiz</strong> later to compare results?*
            </p>
            <div className="mb-5">
              <YNGrid
                options={['Yes', 'No', 'Maybe']}
                selected={form.retake_quiz}
                onChange={(v) => update('retake_quiz', v)}
              />
            </div>

            <p className="text-gray-300 text-sm mb-3">
              Have you <strong className="text-white">shared your results</strong> with someone yet?*
            </p>
            <div className="mb-5">
              <YNGrid
                options={["Yes, already!", 'Plan to', 'Not really']}
                selected={form.shared_results}
                onChange={(v) => update('shared_results', v)}
              />
            </div>

            <p className="text-gray-300 text-sm mb-3">
              How likely are you to <strong className="text-white">recommend KnowYouRole</strong> to a friend?*
            </p>
            <LikertScale
              options={Array.from({ length: 10 }, (_, i) => String(i))}
              selected={form.nps_score}
              onChange={(v) => update('nps_score', v)}
            />
            <p className="text-xs text-gray-500 mt-1">0 = Not at all &nbsp;&nbsp; 10 = In my will</p>
          </section>

          {/* Section 5: College Student Lens */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-700/30 rounded-full px-3 py-1">05</span>
              <h2 className="text-lg font-semibold text-white">College Student Lens</h2>
            </div>

            <p className="text-gray-300 text-sm mb-3">
              As a college student — did the <strong className="text-white">career suggestions</strong> feel relevant to your situation?*
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update('career_relevance', n)}
                  className="w-10 h-10 rounded-full border text-sm font-bold transition-all"
                  style={{
                    background: form.career_relevance === n ? '#6366f1' : 'transparent',
                    borderColor: form.career_relevance === n ? '#6366f1' : '#444',
                    color: form.career_relevance === n ? '#fff' : '#aaa',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-5">1 = Not relevant &nbsp;&nbsp; 5 = Spot on</p>

            <p className="text-gray-300 text-sm mb-3">
              Did the quiz <strong className="text-white">feel designed for someone like you</strong>?*
            </p>
            <YNGrid
              options={['Yes, totally', 'A little off', 'Not really']}
              selected={form.feels_designed_for_you}
              onChange={(v) => update('feels_designed_for_you', v)}
            />

            <p className="text-gray-300 text-sm mt-5 mb-2">
              What would make this <strong className="text-white">MORE useful</strong> for college students?
            </p>
            <textarea
              value={form.college_suggestions}
              onChange={(e) => update('college_suggestions', e.target.value)}
              placeholder="More internship-specific roles? Peer comparisons? Salary data? Class-of-2026 filters? Tell us."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
              rows={2}
            />
          </section>

          {/* Section 6: Bugs */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-700/30 rounded-full px-3 py-1">06</span>
              <h2 className="text-lg font-semibold text-white">Bugs & Issues</h2>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              Did anything feel <strong className="text-white">broken, confusing, or just wrong</strong>?
            </p>
            <textarea
              value={form.bugs_issues}
              onChange={(e) => update('bugs_issues', e.target.value)}
              placeholder="Describe the issue — e.g. 'The page froze when I tried to share', 'Question 12 was unclear', 'My results seemed off...'"
              className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
              rows={2}
            />
          </section>

          {/* Section 7: Stay in the Loop */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-700/30 rounded-full px-3 py-1">07</span>
              <h2 className="text-lg font-semibold text-white">Stay in the Loop</h2>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Want to <strong className="text-white">test the next version</strong> before anyone else? Drop your email — we'll only reach out when something big drops.
            </p>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="yourname@university.edu"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
            />

            <p className="text-gray-300 text-sm mt-5 mb-2">
              Anything else on your mind?
            </p>
            <textarea
              value={form.anything_else}
              onChange={(e) => update('anything_else', e.target.value)}
              placeholder="Unfiltered thoughts, feature requests, complaints, compliments... we read everything."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
              rows={2}
            />
          </section>

          {/* Submit */}
          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-900/20 px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-4 text-white font-semibold text-lg transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>

          <p className="text-center text-xs text-gray-500">
            Your answers are completely anonymous. We never sell your data. · <a href="/privacy" className="underline hover:text-gray-400">Privacy Policy</a> · KnowYouRole — Science-backed personality insights for every age.
          </p>
        </form>
      </div>
    </div>
  );
}
