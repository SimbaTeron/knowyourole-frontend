'use client';

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';
import { RatingRadios } from '@/components/results/RatingRadios';
import {
  BLANK_SCALE_NOTE,
  SCALE_QUESTIONS,
  emptyScaleAnswers,
  readFeedbackLink,
  scaleAnswersAreEmpty,
  scaleChoiceLabel,
  scalePayload,
  writeFeedbackLink,
  type ScaleAnswers,
  type ScaleKey,
} from '@/lib/feedback/scaleFeedback';

const RATINGS = [1, 2, 3, 4, 5] as const;

function capabilityStorageKey(sessionId: string) {
  return `kyr_anonymous_result_capability:${sessionId}`;
}

export default function FeedbackPage() {
  const [answers, setAnswers] = useState<ScaleAnswers>(emptyScaleAnswers);
  const [resultId, setResultId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [errorTick, setErrorTick] = useState(0);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const thanksRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const stored = readFeedbackLink();
    const params = new URLSearchParams(window.location.search);
    const fromUrlResult = params.get('resultId')?.trim() || params.get('result_id')?.trim() || '';
    const fromUrlSession = params.get('sessionId')?.trim() || params.get('session_id')?.trim() || '';
    const nextResult = stored.resultId || (fromUrlResult.length >= 8 ? fromUrlResult : null);
    const nextSession = stored.sessionId || fromUrlSession || null;
    setResultId(nextResult);
    setSessionId(nextSession);
    if (nextResult) writeFeedbackLink({ resultId: nextResult, sessionId: nextSession });
    if (params.has('resultId') || params.has('result_id') || params.has('sessionId') || params.has('session_id')) {
      params.delete('resultId');
      params.delete('result_id');
      params.delete('sessionId');
      params.delete('session_id');
      const query = params.toString();
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    }
  }, []);

  useEffect(() => {
    if (!error) return;
    errorRef.current?.focus({ preventScroll: true });
  }, [error, errorTick]);

  useEffect(() => {
    if (!submitted) return;
    thanksRef.current?.focus({ preventScroll: true });
  }, [submitted]);

  const setRating = (key: ScaleKey, value: number) => {
    setAnswers((current) => ({ ...current, [key]: current[key] === value ? null : value }));
    setError('');
    setNotice('');
  };

  const send = async (linkedResultId: string | null) => {
    let capability: string | null = null;
    if (linkedResultId && sessionId) {
      try {
        capability = sessionStorage.getItem(capabilityStorageKey(sessionId));
      } catch {
        capability = null;
      }
    }
    return fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(capability ? { 'x-kyr-anonymous-capability': capability } : {}),
      },
      body: JSON.stringify(scalePayload(answers, linkedResultId)),
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (scaleAnswersAreEmpty(answers)) {
      setError('');
      setNotice(BLANK_SCALE_NOTE);
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      let response = await send(resultId);
      if (resultId && (response.status === 403 || response.status === 404)) {
        response = await send(null);
      }
      if (response.status === 429) {
        setError('Please wait a moment, then try again.');
        setErrorTick((tick) => tick + 1);
        return;
      }
      if (!response.ok) {
        setError('Could not save that. Please try again.');
        setErrorTick((tick) => tick + 1);
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Could not save that. Please try again.');
      setErrorTick((tick) => tick + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="workday-simple-page min-h-screen bg-soft-cream text-warm-gray">
      <AppHeader />
      <main className="workday-simple-wrap max-w-2xl px-6 py-28">
        {submitted ? (
          <>
            <h1 ref={thanksRef} tabIndex={-1} className="text-3xl font-display font-bold">Thank you.</h1>
            <p className="mt-3 text-base leading-relaxed">Your feedback was saved.</p>
            <p className="mt-6">
              {resultId ? <a href="/results">Back to your result</a> : <a href="/">Back to home</a>}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-display font-bold">Leave feedback</h1>
            <p className="mt-3 text-base leading-relaxed">All five questions are optional. 1 is low. 5 is high. Tap a number again to clear it.</p>
            <style>{`[data-testid^="scale-"][aria-checked="true"] { background:#315f74; color:#fffdf8; border-color:#12263a; }`}</style>
            <form className="mt-8 space-y-6" onSubmit={(event) => { void handleSubmit(event); }}>
              <p id="scale-hint" className="sr-only">1 is low. 5 is high. You can skip any question.</p>
              {SCALE_QUESTIONS.map((question) => (
                <fieldset key={question.key} className="m-0 border-0 p-0">
                  <legend id={`scale-${question.key}`} className="mb-2 text-base font-semibold">{question.prompt}</legend>
                  <RatingRadios
                    labelledBy={`scale-${question.key}`}
                    describedBy="scale-hint"
                    className="grid grid-cols-5 gap-2"
                    selected={answers[question.key]}
                    onSelect={(value) => setRating(question.key, value)}
                    options={RATINGS.map((value) => ({
                      value,
                      ariaLabel: scaleChoiceLabel(value),
                      className: "min-h-11 rounded border border-[#12263a]/30 bg-white text-base font-bold text-[#12263a]",
                      testId: `scale-${question.key}-${value}`,
                      children: value,
                    }))}
                  />
                </fieldset>
              ))}
              {error ? (
                <p ref={errorRef} role="alert" tabIndex={-1} className="text-sm font-semibold text-[#9d3e2b]">{error}</p>
              ) : null}
              <p
                id="feedback-blank-note"
                role="status"
                className={notice ? "text-sm leading-relaxed text-[#29495c]" : "sr-only"}
              >
                {notice}
              </p>
              <button
                type="submit"
                className="min-h-11 rounded border border-[#12263a] bg-[#12263a] px-5 text-base font-bold text-[#fffdf8]"
                aria-disabled={submitting ? true : undefined}
                onClick={(event) => {
                  if (submitting) event.preventDefault();
                }}
              >
                {submitting ? 'Saving...' : 'Submit'}
              </button>
            </form>
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
