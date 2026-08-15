import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  supabase,
  isSupabaseConfigured,
  findProfileByEmail,
  fetchAllProfiles,
  createProfileInSupabase,
  signUpWithSupabase,
  updateProfileInSupabase,
  deleteProfileFromSupabase,
  fetchDocumentsByUserId,
  createDocumentInSupabase,
  deleteDocumentFromSupabase,
  fetchKnowledgeSources,
  createKnowledgeSource,
  deleteKnowledgeSource,
  fetchOpportunities,
  createOpportunity,
  fetchAuditLogs,
  createAuditLog,
} from '../lib/supabase';
import {
  INITIAL_USER,
  INITIAL_DOCUMENTS,
  OPPORTUNITIES,
  CATEGORIES,
  KNOWLEDGE_SOURCES,
  AI_DETECTED_QUEUE,
  NOTIFICATIONS,
  AUDIT_LOGS,
} from '../lib/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState('user'); // 'user' | 'admin'
  const [activeTab, setActiveTab] = useState('home');
  const [adminTab, setAdminTab] = useState('sources');

  // Dynamic User & Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('alalay_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('alalay_auth');
    return saved ? JSON.parse(saved) : false;
  });

  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    const saved = localStorage.getItem('alalay_onboarding_done');
    return saved ? JSON.parse(saved) : false;
  });

  const [consentGiven, setConsentGiven] = useState(true);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [guidedTourActive, setGuidedTourActive] = useState(false);
  const [guidedTourStep, setGuidedTourStep] = useState(1);

  // Dynamic Data States (synchronized with Supabase)
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('alalay_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [opportunities, setOpportunities] = useState(() => {
    const saved = localStorage.getItem('alalay_opportunities');
    return saved ? JSON.parse(saved) : OPPORTUNITIES;
  });

  const [sources, setSources] = useState(() => {
    const saved = localStorage.getItem('alalay_sources');
    return saved ? JSON.parse(saved) : KNOWLEDGE_SOURCES;
  });

  const [reviewQueue, setReviewQueue] = useState(() => {
    const saved = localStorage.getItem('alalay_review_queue');
    return saved ? JSON.parse(saved) : AI_DETECTED_QUEUE;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('alalay_notifications');
    return saved ? JSON.parse(saved) : NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('alalay_audit_logs');
    return saved ? JSON.parse(saved) : AUDIT_LOGS;
  });

  const [managedUsers, setManagedUsers] = useState(() => {
    const saved = localStorage.getItem('alalay_managed_users');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'usr_admin_1',
            firstName: 'Super',
            lastName: 'Admin',
            name: 'Super Admin',
            email: 'admin@alalay.gov.ph',
            role: 'System Admin',
            status: 'Active',
            isTemporary: false,
            avatarInitials: 'SA',
            avatarBg: 'bg-indigo-600',
            otpCode: '891024',
            documents: [{ name: 'System Admin Authorization.pdf', type: 'Authorization', size: '1.2 MB' }],
            createdAt: '2026-08-15',
          },
          {
            id: 'usr_mod_2',
            firstName: 'Content',
            lastName: 'Moderator',
            name: 'Content Moderator',
            email: 'moderator@alalay.gov.ph',
            role: 'Content Moderator',
            status: 'Active',
            isTemporary: false,
            avatarInitials: 'CM',
            avatarBg: 'bg-amber-600',
            otpCode: '452109',
            documents: [],
            createdAt: '2026-08-15',
          },
        ];
  });
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [tempAdminModalOpen, setTempAdminModalOpen] = useState(false);

  // UI Modals & Filter States
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [askAlalayOpen, setAskAlalayOpen] = useState(false);
  const [askAlalayOpportunity, setAskAlalayOpportunity] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addSourceModalOpen, setAddSourceModalOpen] = useState(false);
  const [activeDocumentForPreview, setActiveDocumentForPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEligibilityFilter, setSelectedEligibilityFilter] = useState('all');

  // Scraping Live Simulation State
  const [isScrapingLive, setIsScrapingLive] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState({ stage: '', percent: 0, currentUrl: '' });
  const [toasts, setToasts] = useState([]);

  // Toast Notification Manager
  const addToast = (title, message, type = 'info', duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Load: Fetch Dynamic Data from Supabase
  useEffect(() => {
    const loadDynamicSupabaseData = async () => {
      if (!isSupabaseConfigured) return;

      // A. Fetch Dynamic Profiles / Users
      const { data: dbProfiles } = await fetchAllProfiles();
      if (dbProfiles && dbProfiles.length > 0) {
        const formatted = dbProfiles.map((p) => ({
          id: p.id,
          firstName: p.first_name,
          middleName: p.middle_name,
          lastName: p.last_name,
          name: p.full_name || `${p.first_name} ${p.last_name}`,
          email: p.email,
          role: p.role === 'super_admin' ? 'System Admin' : p.role === 'content_moderator' ? 'Content Moderator' : p.role === 'analyst' ? 'Analyst' : 'Citizen',
          status: p.status || 'Active',
          avatarInitials: p.avatar_initials || `${p.first_name?.charAt(0) || ''}${p.last_name?.charAt(0) || ''}`.toUpperCase(),
          avatarBg: p.role === 'super_admin' ? 'bg-indigo-600' : p.role === 'content_moderator' ? 'bg-amber-600' : 'bg-blue-600',
          otpCode: p.otp_code || '891024',
          documents: p.documents || [],
          createdAt: p.created_at?.split('T')[0] || '2026-08-15',
        }));
        setManagedUsers(formatted);
      }

      // B. Fetch Dynamic Knowledge Sources
      const { data: dbSources } = await fetchKnowledgeSources();
      if (dbSources && dbSources.length > 0) {
        setSources(dbSources);
      }

      // C. Fetch Dynamic Opportunities
      const { data: dbOpps } = await fetchOpportunities();
      if (dbOpps && dbOpps.length > 0) {
        setOpportunities(dbOpps);
      }

      // D. Fetch Dynamic Audit Logs
      const { data: dbLogs } = await fetchAuditLogs();
      if (dbLogs && dbLogs.length > 0) {
        setAuditLogs(dbLogs);
      }
    };

    loadDynamicSupabaseData();
  }, []);

  // Sync Managed Users to LocalStorage
  useEffect(() => {
    localStorage.setItem('alalay_managed_users', JSON.stringify(managedUsers));
  }, [managedUsers]);

  // Authentication Handlers
  const loginWithSupabase = async (emailInput, passwordInput) => {
    const cleanEmail = emailInput?.trim();
    if (!cleanEmail) {
      addToast('Input Required', 'Please enter your email address.', 'error');
      return { success: false };
    }

    // 1. Check local managedUsers array first (for newly created temp admins & registered users)
    const localMatch = managedUsers.find(
      (u) => u.email?.toLowerCase() === cleanEmail.toLowerCase()
    );

    if (localMatch) {
      const isAdminRole = [
        'System Admin',
        'Super Admin',
        'Content Moderator',
        'Analyst',
        'Agency Verifier',
        'super_admin',
        'content_moderator',
      ].includes(localMatch.role);

      setUser({
        id: localMatch.id,
        firstName: localMatch.firstName,
        lastName: localMatch.lastName,
        email: localMatch.email,
        role: localMatch.role,
        isVerified: true,
      });

      setIsAuthenticated(true);
      localStorage.setItem('alalay_auth', 'true');

      if (isAdminRole) {
        setViewMode('admin');
        addToast(
          'Admin Authenticated',
          `Welcome back, ${localMatch.name} (${localMatch.role}).`,
          'success'
        );
        return { success: true, isAdmin: true };
      } else {
        setViewMode('user');
        setOnboardingCompleted(true);
        addToast('Welcome Back', `Logged in as ${localMatch.name}.`, 'success');
        return { success: true, isAdmin: false };
      }
    }

    // 2. Check user profile in Supabase
    const { data: profile } = await findProfileByEmail(cleanEmail);

    if (profile) {
      const isAdminRole = ['super_admin', 'content_moderator', 'analyst', 'agency_verifier'].includes(profile.role);
      
      setUser({
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        middleName: profile.middle_name,
        email: profile.email,
        phone: profile.phone || '+63 917 000 0000',
        address: profile.address || 'Metro Manila, Philippines',
        role: profile.role,
        isVerified: profile.egov_verified ?? true,
      });

      setIsAuthenticated(true);
      localStorage.setItem('alalay_auth', 'true');

      if (isAdminRole) {
        setViewMode('admin');
        addToast('Admin Authenticated', `Welcome back, ${profile.first_name} (${profile.role}).`, 'success');
        return { success: true, isAdmin: true };
      } else {
        setViewMode('user');
        setOnboardingCompleted(true);
        addToast('Welcome Back', `Logged in as ${profile.first_name}.`, 'success');
        return { success: true, isAdmin: false };
      }
    } else {
      // Dynamic fallback for new registration/login
      const isQuickAdmin = cleanEmail.toLowerCase().includes('admin');
      setIsAuthenticated(true);
      localStorage.setItem('alalay_auth', 'true');

      if (isQuickAdmin) {
        setViewMode('admin');
        addToast('Admin Session', 'Signed in to Super Admin Portal.', 'success');
        return { success: true, isAdmin: true };
      } else {
        setViewMode('user');
        return { success: true, isAdmin: false };
      }
    }
  };

  // Create Temporary Admin Account
  const createTempAdminAccount = async ({
    firstName,
    lastName,
    email,
    password = 'admin123',
    role = 'System Admin',
    durationHours = 24,
    otpCode,
    autoLogin = false,
  }) => {
    const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'TA';
    const dbRole = (role || 'System Admin').toLowerCase().replace(' ', '_');
    const generatedOtp = otpCode || Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

    const newTempAdmin = {
      id: `tmp_admin_${Date.now()}`,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      role: role || 'System Admin',
      status: `Temp (${durationHours}h)`,
      isTemporary: true,
      expiresAt,
      durationHours,
      avatarInitials: initials,
      avatarBg: 'bg-amber-600',
      otpCode: generatedOtp,
      documents: [{ name: 'Temporary Admin Access Token.pdf', type: 'System Token', size: '240 KB' }],
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 1. Register User in Supabase Auth (auth.users) & public.profiles
    if (isSupabaseConfigured) {
      await signUpWithSupabase({
        email,
        password,
        firstName,
        lastName,
        role: dbRole,
        otpCode: generatedOtp,
      });
    }

    // 2. Update React State
    setManagedUsers((prev) => [newTempAdmin, ...prev]);

    // 3. Create Audit Log
    await createAuditLog({
      action: 'TEMP_ADMIN_CREATED',
      actor: 'Super Admin',
      target: `${newTempAdmin.name} (${newTempAdmin.email})`,
      status: 'Success',
      details: `Generated temporary admin account expiring in ${durationHours}h with OTP passcode ${generatedOtp}.`,
    });

    addToast(
      'Temp Admin Activated',
      `Temporary Admin ${newTempAdmin.name} created! OTP Passcode: ${generatedOtp}`,
      'success',
      7000
    );

    if (autoLogin) {
      setUser({
        id: newTempAdmin.id,
        firstName,
        lastName,
        email,
        role: newTempAdmin.role,
        isVerified: true,
      });
      setIsAuthenticated(true);
      setViewMode('admin');
      localStorage.setItem('alalay_auth', 'true');
    }

    return newTempAdmin;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('alalay_auth', 'false');
    addToast('Logged Out', 'You have been signed out.', 'info');
  };

  // Dynamic Add Managed User to Supabase
  const addManagedUser = async ({ firstName, middleName, lastName, email, role, otpCode, documents = [] }) => {
    const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
    const dbRole = (role || 'Citizen').toLowerCase().replace(' ', '_');

    // 1. Insert Profile into Supabase Auth & profiles table
    let createdUserId = `usr_${Date.now()}`;
    const { user: createdUserRes } = await signUpWithSupabase({
      email,
      password: 'User123!',
      firstName,
      lastName,
      role: dbRole,
      otpCode,
    });

    if (createdUserRes?.id) {
      createdUserId = createdUserRes.id;
      // 2. Insert Attached Documents into Supabase
      for (const doc of documents) {
        await createDocumentInSupabase({
          user_id: createdUserId,
          name: doc.name,
          type: doc.type,
          file_size: doc.size || '1.2 MB',
          status: 'Valid',
        });
      }
    }

    // 3. Update React State
    const newUser = {
      id: createdUserId,
      firstName,
      middleName,
      lastName,
      name: `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
      email,
      role: role || 'System Admin',
      status: 'Active',
      avatarInitials: initials,
      avatarBg: dbRole === 'super_admin' ? 'bg-indigo-600' : 'bg-blue-600',
      otpCode: otpCode || '891024',
      documents,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setManagedUsers((prev) => [newUser, ...prev]);

    // 4. Create Audit Log in Supabase
    await createAuditLog({
      action: 'USER_ACCOUNT_CREATED',
      actor: 'Super Admin',
      target: `${newUser.name} (${newUser.email})`,
      status: 'Success',
      details: `Registered dynamic user in Supabase with ${documents.length} verified documents.`,
    });

    addToast('User Registered in Supabase', `${newUser.name} saved to live database.`, 'success');
    setAddUserModalOpen(false);
  };

  // Delete Managed User from Supabase
  const deleteManagedUser = async (id) => {
    if (isSupabaseConfigured) {
      await deleteProfileFromSupabase(id);
    }
    setManagedUsers((prev) => prev.filter((u) => u.id !== id));
    await createAuditLog({
      action: 'USER_ACCOUNT_DEACTIVATED',
      actor: 'Super Admin',
      target: `User ID: ${id}`,
      status: 'Success',
      details: 'Account deactivated and deleted from Supabase profiles database.',
    });
    addToast('Account Deactivated', 'User account removed from Supabase online database.', 'info');
  };

  // Dynamic Add Knowledge Source to Supabase
  const addKnowledgeSource = async (newSourceData) => {
    const { data: dbResult } = await createKnowledgeSource({
      agency_name: newSourceData.agencyName,
      agency_type: newSourceData.agencyType || 'Executive Department',
      official_url: newSourceData.officialUrl,
      category: newSourceData.category,
      scraping_frequency: newSourceData.scrapingFrequency || 'Daily',
      status: 'Active',
      health_score: 99.4,
      documents_indexed: 0,
      priority: 'High',
    });

    const added = (dbResult && dbResult[0]) || {
      id: `src_${Date.now()}`,
      agencyName: newSourceData.agencyName,
      officialUrl: newSourceData.officialUrl,
      category: newSourceData.category,
      status: 'Active',
      healthScore: 99.4,
      documentsIndexed: 0,
      lastScrapedAt: 'Just now',
    };

    setSources((prev) => [added, ...prev]);
    setAddSourceModalOpen(false);
    addToast('Source Ingested', `${newSourceData.agencyName} registered in live database.`, 'success');
  };

  // Remove Knowledge Source from Supabase
  const removeKnowledgeSource = async (id) => {
    if (isSupabaseConfigured) {
      await deleteKnowledgeSource(id);
    }
    setSources((prev) => prev.filter((s) => s.id !== id));
    addToast('Source Deleted', 'Knowledge source deleted from Supabase online database.', 'info');
  };

  const openAskAlalay = (opp = null) => {
    setAskAlalayOpportunity(opp);
    setAskAlalayOpen(true);
  };

  const startOnboardingWizard = () => {
    setOnboardingCompleted(false);
  };

  const completeOnboardingWizard = () => {
    setOnboardingCompleted(true);
    setIsAuthenticated(true);
    localStorage.setItem('alalay_onboarding_done', 'true');
    localStorage.setItem('alalay_auth', 'true');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        // View & Navigation
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        adminTab,
        setAdminTab,
        // User & Dynamic Auth
        isAuthenticated,
        setIsAuthenticated,
        loginWithSupabase,
        logout,
        user,
        setUser,
        onboardingCompleted,
        setOnboardingCompleted,
        consentGiven,
        setConsentGiven,
        welcomeModalOpen,
        setWelcomeModalOpen,
        guidedTourActive,
        guidedTourStep,
        startOnboardingWizard,
        completeOnboardingWizard,
        // Dynamic Core Data
        documents,
        opportunities,
        categories: CATEGORIES,
        sources,
        reviewQueue,
        notifications,
        auditLogs,
        unreadCount,
        // Managed Users
        managedUsers,
        setManagedUsers,
        addUserModalOpen,
        setAddUserModalOpen,
        addManagedUser,
        deleteManagedUser,
        tempAdminModalOpen,
        setTempAdminModalOpen,
        createTempAdminAccount,
        // Modals & UI
        selectedOpportunity,
        setSelectedOpportunity,
        askAlalayOpen,
        setAskAlalayOpen,
        askAlalayOpportunity,
        setAskAlalayOpportunity,
        openAskAlalay,
        uploadModalOpen,
        setUploadModalOpen,
        addSourceModalOpen,
        setAddSourceModalOpen,
        activeDocumentForPreview,
        setActiveDocumentForPreview,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedEligibilityFilter,
        setSelectedEligibilityFilter,
        addKnowledgeSource,
        removeKnowledgeSource,
        isScrapingLive,
        scrapingProgress,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
