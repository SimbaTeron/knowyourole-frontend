import { useState } from 'react';
import { useLocation } from 'wouter';
import { PageContainer } from '@/components/layout/PageContainer';
import { CompactHeader } from '@/components/layout/CompactHeader';
import { GlassCard } from '@/components/glass/GlassCard';
import { NeonButton } from '@/components/glass/NeonButton';
import { ProgressBar } from '@/components/glass/ProgressBar';

const questions = [
  {
    question: "You're at a party. What do you naturally do?",
    answers: [
      "Work the room, meeting everyone",
      "Find one deep conversation",
      "Observe from the corner",
      "Make sure everyone is having fun",
      "Relax and enjoy your own company"
    ]
  },
  {
    question: "How do you prefer to make decisions?",
    answers: [
      "Based on logic and data",
      "Based on how it affects people",
      "Following my gut feeling",
      "Weighing pros and cons carefully",
      "Quickly, based on instinct"
    ]
  },
  {
    question: "Your ideal weekend involves:",
    answers: [
      "Spontaneous adventures with friends",
      "Deep work on a personal project",
      "Planning my next big goal",
      "Quiet time with a good book",
      "Learning something entirely new"
    ]
  },
  {
    question: "In a group project, you naturally:",
    answers: [
      "Lead and delegate tasks",
      "Bring creative ideas",
      "Keep everyone on schedule",
      "Mediate conflicts",
      "Do your part independently"
    ]
  },
  {
    question: "What motivates you most?",
    answers: [
      "Recognition and achievement",
      "Helping others succeed",
      "Mastery and expertise",
      "Freedom and autonomy",
      "Impact and purpose"
    ]
  }
];

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const q = questions[currentQuestion];
  const progress = (currentQuestion / questions.length) * 100;

  const handleNext = () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
    } else {
      // Quiz complete — for now alert with results and redirect
      alert(`Quiz complete! You answered: ${JSON.stringify(newAnswers)}`);
      setLocation('/');
    }
  };

  return (
    <PageContainer padded={false}>
      <CompactHeader onBack={() => history.back()} onMenu={() => {}} />
      <div className="min-h-screen flex flex-col px-4 pt-20">
        {/* Progress */}
        <div className="w-full py-4 space-y-2">
          <div className="text-xs text-white/40 text-center font-medium">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <ProgressBar progress={progress} />
        </div>

        {/* Question Card */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
          <GlassCard className="w-full p-8" variant="default">
            <div className="text-3xl font-display font-bold text-white mb-6">
              {q.question}
            </div>

            <div className="space-y-3">
              {q.answers.map((answer, i) => (
                <GlassCard
                  key={i}
                  variant={selectedAnswer === i ? 'selected' : 'interactive'}
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setSelectedAnswer(i)}
                >
                  <div className="radio-outer">
                    <div className="radio-inner" />
                  </div>
                  <span className="text-white/90 text-sm">{answer}</span>
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Next Button */}
        <div className="w-full max-w-xl mx-auto py-6">
          <NeonButton
            fullWidth
            size="lg"
            disabled={selectedAnswer === null}
            onClick={handleNext}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question →' : 'See Your Results →'}
          </NeonButton>
        </div>
      </div>
    </PageContainer>
  );
}
