import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/layout/LandingPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { GuidedTour } from './components/layout/GuidedTour';
import { WelcomeModal } from './components/layout/WelcomeModal';
import { ToastContainer } from './components/common/ToastContainer';

// User Views & Modals
import { LoginPage } from './components/user/LoginPage';
import { OnboardingWizard } from './components/user/OnboardingWizard';
import { HomeDashboard } from './components/user/HomeDashboard';
import { ExploreCategories } from './components/user/ExploreCategories';
import { DocumentsView } from './components/user/DocumentsView';
import { BenefitsView } from './components/user/BenefitsView';
import { NotificationsView } from './components/user/NotificationsView';
import { ChatArchivesView } from './components/user/ChatArchivesView';
import { AskAlalayPageView } from './components/user/AskAlalayPageView';
import { UserProfileView } from './components/user/UserProfileView';
import { OpportunityDetailModal } from './components/user/OpportunityDetailModal';
import { AskAlalayChatModal } from './components/user/AskAlalayChatModal';
import { AskAlalayFloatingFab } from './components/common/AskAlalayFloatingFab';
import { DocumentUploadModal } from './components/user/DocumentUploadModal';
import { ApplicationIntakeAgent } from './components/user/ApplicationIntakeAgent';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';

const ADMIN_ROLES = new Set([
  'system admin',
  'super admin',
  'content moderator',
  'analyst',
  'agency verifier',
  'super_admin',
  'content_moderator',
  'agency_verifier',
]);

const isOnAdminRoute = () => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/admin' ||
    path === '/admin/' ||
    path.startsWith('/admin') ||
    hash === '#admin' ||
    search.includes('admin=true')
  );
};

const MainAppContent = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    onboardingCompleted,
    viewMode,
    setViewMode,
    activeTab,
    user,
    logout,
  } = useApp();

  // Auth Navigation Sub-States: 'landing' | 'login' | 'verify'
  const [authView, setAuthView] = useState('landing');

  // Check URL pathname or hash on mount and popstate (e.g. /admin, /admin/, localhost/admin, #admin)
  useEffect(() => {
    const checkAdminRoute = () => {
      if (isOnAdminRoute()) {
        setIsAuthenticated(true);
        setViewMode('admin');
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    return () => window.removeEventListener('popstate', checkAdminRoute);
  }, [setIsAuthenticated, setViewMode]);

  // A session restored from localStorage (e.g. after a plain refresh) must never resume
  // an admin account outside the admin portal route — otherwise it falls through to the
  // citizen dashboard/onboarding with no citizen profile behind it. This also covers the
  // /admin URL route's own bypass, which flips isAuthenticated without ever running a real
  // login (every real login path — managedUsers, Supabase, eGov OTP — always sets an
  // explicit user.role; the untouched default INITIAL_USER never has one, so a missing
  // role here means "never actually logged in"). Mount-only: this guards the *restored*
  // cold-boot session, not a role change during an active session (a fresh admin login
  // already sets viewMode itself and shouldn't be undone by this).
  useEffect(() => {
    if (isOnAdminRoute() || !isAuthenticated) return;
    const role = user?.role;
    if (!role || ADMIN_ROLES.has(role.toLowerCase())) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Super Admin Portal (Accessed via localhost/admin or /admin URL)
  if (viewMode === 'admin') {
    return (
      <div className="h-screen bg-[#F4F5FB] flex flex-col text-[#0f172a] selection:bg-[#093a96] selection:text-white overflow-hidden">
        <AdminDashboard />
        <ToastContainer />
      </div>
    );
  }

  // If user is authenticated for the first time and hasn't completed onboarding:
  if (isAuthenticated && !onboardingCompleted && viewMode === 'user') {
    return (
      <main className="min-h-screen bg-white">
        <OnboardingWizard onCancel={() => { setIsAuthenticated(false); setAuthView('login'); }} />
        <ToastContainer />
      </main>
    );
  }

  // If user is NOT authenticated yet
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <main className="min-h-screen bg-[#F4F5FB]">
          <LoginPage
            onContinueToVerify={() => setAuthView('verify')}
            onSignUp={() => setAuthView('verify')}
            onCancel={() => setAuthView('landing')}
          />
          <ToastContainer />
        </main>
      );
    }

    if (authView === 'verify') {
      return (
        <main className="min-h-screen bg-white">
          <OnboardingWizard onCancel={() => setAuthView('login')} />
          <ToastContainer />
        </main>
      );
    }

    // Default: Landing Page
    return (
      <main className="min-h-screen bg-[#FAFBFF]">
        <LandingPage
          onGetStarted={() => setAuthView('login')}
          onLogin={() => setAuthView('login')}
        />
        <ToastContainer />
      </main>
    );
  }

  // Authenticated Citizen Dashboard
  return (
    <div className="h-screen bg-[#f8fafd] flex flex-col text-[#0f172a] selection:bg-[#093a96] selection:text-white overflow-hidden">
      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto h-full overflow-hidden">
        {/* Left Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafd] h-full overflow-hidden">
          {/* Header Greeting Bar */}
          <Header />

          {/* Dynamic Tab Router */}
          <main
            className={`flex-1 min-h-0 ${
              activeTab === 'ai-chat' || activeTab === 'apply'
                ? 'px-4 sm:px-6 pb-3 overflow-hidden flex flex-col'
                : 'px-6 sm:px-10 pb-20 md:pb-10 overflow-y-auto'
            }`}
          >
            {activeTab === 'home' && <HomeDashboard />}
            {activeTab === 'explore' && <ExploreCategories />}
            {activeTab === 'ai-chat' && <AskAlalayPageView />}
            {activeTab === 'apply' && <ApplicationIntakeAgent />}
            {activeTab === 'documents' && <DocumentsView />}
            {activeTab === 'benefits' && <BenefitsView />}
            {activeTab === 'chat-history' && <ChatArchivesView />}
            {activeTab === 'notifications' && <NotificationsView />}
            {activeTab === 'profile' && <UserProfileView />}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />

      {/* Floating Modals & Overlays */}
      <OpportunityDetailModal />
      <AskAlalayChatModal />
      <AskAlalayFloatingFab />
      <DocumentUploadModal />
      <WelcomeModal />
      <GuidedTour />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
