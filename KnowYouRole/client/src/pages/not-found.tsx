import { Link } from 'wouter';
import { PageContainer } from '@/components/layout/PageContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { NeonButton } from '@/components/glass/NeonButton';

export default function NotFoundPage() {
  return (
    <>
      <AppHeader />
      <PageContainer>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ paddingTop: 80 }}>
          <div className="text-9xl font-display font-bold text-glow-blue mb-4" style={{ fontSize: '120px', lineHeight: 1 }}>
            404
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-3">
            Page not found
          </h1>
          <p className="text-white/50 mb-8 max-w-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <NeonButton>← Back to Home</NeonButton>
          </Link>
        </div>
      </PageContainer>
      <AppFooter />
    </>
  );
}
