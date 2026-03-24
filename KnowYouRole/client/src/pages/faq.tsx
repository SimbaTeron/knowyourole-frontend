import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { GlassCard } from '@/components/glass/GlassCard';
import { NeonButton } from '@/components/glass/NeonButton';
import { NeonText } from '@/components/glass/NeonText';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How long does the quiz take?',
      a: 'Most people complete it in 3-5 minutes. It\'s designed to be quick, engaging, and insightful.',
    },
    {
      q: 'Is my data private?',
      a: '100%. We never sell your data, share it with third parties, or use it for anything you haven\'t explicitly agreed to.',
    },
    {
      q: 'What personality model do you use?',
      a: 'We use the Big Five (OCEAN) model — the most scientifically validated personality framework in psychology.',
    },
    {
      q: 'Is this free?',
      a: 'Yes! The core assessment is completely free. Premium features are available for those who want deeper insights.',
    },
    {
      q: 'Can I retake the quiz?',
      a: 'Absolutely. Your personality may evolve over time, and we encourage revisiting the quiz as you grow.',
    },
    {
      q: 'How accurate are the results?',
      a: 'Our algorithm is based on decades of personality research and maps closely to clinical assessments.',
    },
  ];

  return (
    <PageContainer>
      <AppHeader />
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
            FAQ
          </h1>
          <p className="text-white/50">Everything you need to know about KnowYouRole.</p>
        </div>

        {/* Accordion */}
        <div className="space-y-3 mb-12">
          {faqs.map((faq, i) => (
            <GlassCard
              key={i}
              variant={openIndex === i ? 'selected' : 'default'}
              className="p-0 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium text-white pr-4">{faq.q}</span>
                <span className={`text-glow-blue text-xl transition-transform ${openIndex === i ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/6 pt-4">
                  {faq.a}
                </div>
              )}
            </GlassCard>
          ))}
        </div>

        {/* CTA */}
        <GlassCard variant="default" className="p-8 text-center">
          <h2 className="text-xl font-display font-bold text-white mb-2">Still have questions?</h2>
          <p className="text-white/50 text-sm mb-6">We're here to help. Reach out anytime.</p>
          <NeonButton variant="secondary">Get in touch →</NeonButton>
        </GlassCard>
      </div>
      <AppFooter />
    </PageContainer>
  );
}
