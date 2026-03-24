import { Link } from "wouter";
import { ArrowLeft, Briefcase, Users, Code, Heart, Palette } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/glass/NeonText";
import { NeonButton } from "@/components/glass/NeonButton";

interface JobOpening {
  id: string;
  title: string;
  department: string;
  type: string;
  description: string;
}

const JOB_OPENINGS: JobOpening[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    type: "Full-time",
    description: "Build beautiful, accessible user interfaces using React and TypeScript. Work on our personality quiz platform serving thousands of daily users."
  },
  {
    id: "2",
    title: "Product Designer",
    department: "Design",
    type: "Full-time",
    description: "Shape the visual identity and user experience of KnowYouRole. Create intuitive interfaces that make personality discovery fun and engaging."
  },
  {
    id: "3",
    title: "Psychology Research Lead",
    department: "Research",
    type: "Full-time",
    description: "Lead research initiatives to improve our personality assessment algorithms. Collaborate with clinical psychologists to ensure scientific validity."
  },
  {
    id: "4",
    title: "Marketing Manager",
    department: "Growth",
    type: "Part-time",
    description: "Drive user acquisition and brand awareness for our personality platform. Develop content strategies that resonate with our target audience."
  }
];

export default function Careers() {
  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <AppHeader />
      <PageContainer>
        <div className="mb-8 text-center">
          <Briefcase className="w-10 h-10 mx-auto mb-4" style={{ color: '#7800FF' }} />
          <NeonText size="xl" className="mb-4">Join Our Mission</NeonText>
          <p className="text-sm opacity-70 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Help us build the future of personality discovery. We're a small team passionate about helping people understand themselves better.
          </p>
        </div>

        <div className="space-y-6">
          {JOB_OPENINGS.map((job, index) => (
            <GlassCard key={job.id} glowColor={index % 2 === 0 ? 'blue' : 'purple'} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#fff' }}>{job.title}</h3>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span className="flex items-center gap-1">
                      {job.department === 'Engineering' && <Code className="w-3 h-3" />}
                      {job.department === 'Design' && <Palette className="w-3 h-3" />}
                      {job.department === 'Research' && <Heart className="w-3 h-3" />}
                      {job.department === 'Growth' && <Users className="w-3 h-3" />}
                      {job.department}
                    </span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>{job.description}</p>
              <NeonButton variant="secondary">Apply Now</NeonButton>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="mt-10 text-center p-6" glowColor="blue">
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#00C8FF' }}>Don't see a perfect fit?</h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
          </p>
          <NeonButton variant="primary">Send Open Application</NeonButton>
        </GlassCard>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </PageContainer>
      <AppFooter />
    </div>
  );
}