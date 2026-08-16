import React, { useState } from 'react';
import logoImg from '../../assets/logos.png';
import {
  LayoutGrid,
  Database,
  Cpu,
  FileText,
  Users,
  Rocket,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  Settings,
  Shield,
  Star,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KnowledgeSourcesView } from './KnowledgeSourcesView';
import { ScrapingPipelineVisualizer } from './ScrapingPipelineVisualizer';
import { OpportunityReviewQueue } from './OpportunityReviewQueue';
import { AuditLogsView } from './AuditLogsView';
import { AddSourceModal } from './AddSourceModal';
import { UserManagementView } from './UserManagementView';

export const AdminDashboard = () => {
  const {
    adminTab,
    setAdminTab,
    setViewMode,
    logout,
    addToast,
    sources,
    reviewQueue,
    setTempAdminModalOpen,
  } = useApp();

  const [searchAdminQuery, setSearchAdminQuery] = useState('');

  const adminNavItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
    { id: 'sources', label: 'Knowledge Base', icon: Database },
    { id: 'pipeline', label: 'AI Configuration', icon: Cpu },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'users', label: 'User Management', icon: Users },
  ];

  const handleDeployUpdates = () => {
    addToast('Deploying Pipeline', 'Ingested government circulars and vector weights updated.', 'success');
  };

  return (
    <div className="h-screen bg-[#F4F5FB] flex flex-col md:flex-row select-none text-[#0f172a] overflow-hidden">
      {/* 1. Left Admin Sidebar (Fixed, Non-Scrolling with page content) */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/90 p-6 flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 z-30 overflow-y-auto">
        {/* Top Branding matching reference image */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            {/* Logo Emblem from assets */}
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
              <img
                src={logoImg}
                alt="ALALAY Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-[#093a96] tracking-tight leading-none">
                ALALAY
              </h2>
              <p className="text-[10px] text-slate-500 font-semibold tracking-tight mt-0.5">
                Super Admin Portal
              </p>
            </div>
          </div>

          {/* Navigation Links matching reference image */}
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              // Default active to 'sources' / Knowledge Base as in reference image
              const isActive = (adminTab === 'dashboard' && item.id === 'sources') || adminTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAdminTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2A2A9C] text-white shadow-sm shadow-indigo-950/20'
                      : 'text-slate-600 hover:text-[#093a96] hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Deploy Updates + Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDeployUpdates}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#141870] hover:bg-[#0c1055] text-white text-xs font-bold shadow-md shadow-blue-950/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Rocket className="w-4 h-4" />
            <span>Deploy Updates</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              setViewMode('user');
              window.history.pushState({}, '', '/');
            }}
            className="w-full flex items-center gap-2.5 px-2 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out & Return Home</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Admin Area (Independent Scroll Container) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F5FB] h-screen overflow-y-auto">
        {/* Top Header Bar matching reference image */}
        <header className="bg-white border-b border-slate-200/90 px-6 sm:px-10 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <h1 className="text-xl font-black text-[#093a96] tracking-tight">
            ALALAY Admin
          </h1>

          {/* Center Search Input */}
          <div className="relative flex items-center max-w-md w-full mx-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-4" />
            <input
              type="text"
              value={searchAdminQuery}
              onChange={(e) => setSearchAdminQuery(e.target.value)}
              placeholder="Search agencies, URLs..."
              className="w-full bg-white text-xs sm:text-sm font-medium rounded-full pl-11 pr-4 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:ring-1 focus:ring-[#093a96] text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Right Action Icons & Avatar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTempAdminModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs cursor-pointer transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Temp Admin</span>
            </button>

            <button
              type="button"
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
              alt="Admin"
              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 ml-1 cursor-pointer"
            />
          </div>
        </header>

        {/* Dynamic Admin Sub-view */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
          {adminTab === 'sources' || adminTab === 'dashboard' ? (
            <KnowledgeSourcesView />
          ) : adminTab === 'pipeline' ? (
            <ScrapingPipelineVisualizer />
          ) : adminTab === 'audit' ? (
            <AuditLogsView />
          ) : adminTab === 'overview' ? (
            <KnowledgeSourcesView />
          ) : adminTab === 'users' ? (
            <UserManagementView />
          ) : null}
        </main>
      </div>

      <AddSourceModal />
    </div>
  );
};
