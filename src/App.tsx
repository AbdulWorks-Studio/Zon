import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Nav } from '@/components/Nav';
import { AuthModal } from '@/components/AuthModal';
import NotFound from '@/pages/not-found';
import { HomePage } from '@/pages/Home';
import { RemoverPage } from '@/pages/BgRemover';
import { CropPage } from '@/pages/Crop';
import { ColorPage } from '@/pages/Color';
import { ResizePage } from '@/pages/Resize';
import { ObjectEraserPage } from '@/pages/ObjectEraser';
import { VoiceCleanerPage } from '@/pages/VoiceCleaner';
import { VoiceGeneratorPage } from '@/pages/VoiceGenerator';
import { PrivacyPage } from '@/pages/Privacy';
import { TermsPage } from '@/pages/Terms';
import { ContactPage } from '@/pages/Contact';
import { AboutPage } from '@/pages/About';
import { SettingsPage } from '@/pages/Settings';
import type { AuthUser } from '@/lib/types';

const queryClient = new QueryClient();

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router({ user, onLogin, onSignup, onLogout }: { user: AuthUser | null; onLogin: () => void; onSignup: () => void; onLogout: () => void }) {
  return (
    <RoutedErrorBoundary>
      <Nav user={user} onLogin={onLogin} onSignup={onSignup} onLogout={onLogout} />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/remover" component={RemoverPage} />
        <Route path="/eraser" component={ObjectEraserPage} />
        <Route path="/voice-cleaner" component={VoiceCleanerPage} />
        <Route path="/voice-generator" component={VoiceGeneratorPage} />
        <Route path="/crop" component={CropPage} />
        <Route path="/color" component={ColorPage} />
        <Route path="/resize" component={ResizePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/about" component={AboutPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('zon-user');
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const handleLogin = () => setAuthMode('login');
  const handleSignup = () => setAuthMode('signup');
  const handleLogout = () => {
    localStorage.removeItem('zon-user');
    setUser(null);
  };
  const handleAuthSuccess = (u: AuthUser) => {
    setUser(u);
    setAuthMode(null);
  };
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router user={user} onLogin={handleLogin} onSignup={handleSignup} onLogout={handleLogout} />
          {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSuccess={handleAuthSuccess} />}
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
