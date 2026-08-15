import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SimulationBanner } from './components/common/SimulationBanner';
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
import { NotificationsView } from './components/user/NotificationsView';
import { UserProfileView } from './components/user/UserProfileView';
import { OpportunityDetailModal } from './components/user/OpportunityDetailModal';
import { AskAlalayChatModal } from './components/user/AskAlalayChatModal';
import { DocumentUploadModal } from './components/user/DocumentUploadModal';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainAppContent = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    onboardingCompleted,
    viewMode,
    setViewMode,
    activeTab,
  } = useApp();

  // Auth Navigation Sub-States: 'landing' | 'login' | 'verify'
  const [authView, setAuthView] = useState('landing');

  // Check URL hash / parameter on mount (#admin or ?admin=true)
  useEffect(() => {
    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      setIsAuthenticated(true);
      setViewMode('admin');
    }
  }, []);

  const openAdminPortal = () => {
    setIsAuthenticated(true);
    setViewMode('admin');
  };

  // Super Admin Portal (Exact layout matching the Admin Reference Design)
  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-[#F4F5FB] flex flex-col text-[#0f172a] selection:bg-[#093a96] selection:text-white">
        <SimulationBanner />
        <AdminDashboard />
        <ToastContainer />
      </div>
    );
  }

  // If user is authenticated for the first time and hasn't completed onboarding:
  if (isAuthenticated && !onboardingCompleted && viewMode === 'user') {
    return (
      <main className="min-h-screen bg-white">
        <SimulationBanner />
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
          <SimulationBanner />
          <LoginPage
            onContinueToVerify={() => setAuthView('verify')}
            onSignUp={() => setAuthView('verify')}
            onCancel={() => setAuthView('landing')}
            onOpenAdmin={openAdminPortal}
          />
          <ToastContainer />
        </main>
      );
    }

    if (authView === 'verify') {
      return (
        <main className="min-h-screen bg-white">
          <SimulationBanner />
          <OnboardingWizard onCancel={() => setAuthView('login')} />
          <ToastContainer />
        </main>
      );
    }

    // Default: Landing Page (Image 2)
    return (
      <main className="min-h-screen bg-[#FAFBFF]">
        <SimulationBanner />
        <LandingPage
          onGetStarted={() => setAuthView('login')}
          onLogin={() => setAuthView('login')}
          onOpenAdmin={openAdminPortal}
        />
        <ToastContainer />
      </main>
    );
  }

  // Authenticated Citizen Dashboard (Image 3 & Image 5)
  return (
    <div className="min-h-screen bg-[#f8fafd] flex flex-col text-[#0f172a] selection:bg-[#093a96] selection:text-white">
      {/* Simulation Notice Banner */}
      <SimulationBanner />

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Desktop Sidebar matching Image 3 & 5 */}
        <Sidebar />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafd]">
          {/* Header Greeting Bar matching Image 3 */}
          <Header />

          {/* Dynamic Tab Router */}
          <main className="flex-1 px-6 sm:px-10 pb-20 md:pb-10 overflow-y-auto">
            {activeTab === 'home' && <HomeDashboard />}
            {activeTab === 'explore' && <ExploreCategories />}
            {activeTab === 'documents' && <DocumentsView />}
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
