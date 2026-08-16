import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key, fallback = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://kejkhhnouwdrcmifgkzb.supabase.co');
const supabaseAnonKey = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlamtoaG5vdXdkcmNtaWZna3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDEzNDEsImV4cCI6MjEwMjE3NzM0MX0.Wnw_pTEC7ck-aVPKkci16O7B6YZapLURfJnF1GTsVls'
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create live Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Dynamic Supabase Backend Services
 */

// 1. Dynamic User & Profile Authentication / Lookup
export const signUpWithSupabase = async ({ email, password, firstName, middleName = '', lastName, role, otpCode = '891024' }) => {
  if (!isSupabaseConfigured || !email) return { data: null, error: 'Not configured' };
  try {
    const dbRole = (role || 'super_admin').toLowerCase().replace(' ', '_');
    const validRole = ['super_admin', 'content_moderator', 'analyst', 'agency_verifier', 'citizen'].includes(dbRole)
      ? dbRole
      : 'super_admin';

    // A. Register in Supabase Auth (auth.users - shows up under Supabase Dashboard -> Authentication -> Users!)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password || 'admin123',
      options: {
        data: {
          first_name: firstName,
          middle_name: middleName || '',
          last_name: lastName,
          role: validRole,
        },
      },
    });

    const createdAuthUser = authData?.user;

    // B. Register/Upsert in public.profiles table
    const profilePayload = {
      first_name: firstName || 'Admin',
      middle_name: middleName || null,
      last_name: lastName || 'User',
      email: email.trim(),
      role: validRole,
      otp_code: otpCode,
      status: 'Active',
      avatar_initials: `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'AD',
      egov_verified: true,
      birth_date: userData.birthDate || userData.birth_date || null,
      citizenship: userData.citizenship || 'Filipino',
      civil_status: userData.civilStatus || userData.civil_status || 'Single',
      is_senior_citizen: Boolean(userData.isSeniorCitizen || userData.is_senior_citizen),
      is_pwd: Boolean(userData.isPwd || userData.is_pwd),
      is_solo_parent: Boolean(userData.isSoloParent || userData.is_solo_parent),
      employment_status: userData.employmentStatus || userData.employment_status || 'Employed',
      monthly_income: userData.monthlyIncome || userData.monthly_income || '₱25,000 - ₱35,000',
    };

    if (createdAuthUser?.id) {
      profilePayload.id = createdAuthUser.id;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert([profilePayload], { onConflict: 'email' })
      .select();

    return {
      authData,
      profileData,
      user: createdAuthUser || (profileData && profileData[0]),
      error: authError || profileError,
    };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const findProfileByEmail = async (email) => {
  if (!isSupabaseConfigured || !email) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, documents(*)')
      .ilike('email', email.trim())
      .maybeSingle();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const fetchAllProfiles = async () => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, documents(*)')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createProfileInSupabase = async (profileData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const updateProfileInSupabase = async (id, updates) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const deleteProfileFromSupabase = async (id) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// 2. Dynamic Documents API
export const fetchDocumentsByUserId = async (userId) => {
  if (!isSupabaseConfigured || !userId) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createDocumentInSupabase = async (docData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([docData])
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const deleteDocumentFromSupabase = async (id) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// 3. Dynamic Knowledge Sources API
export const fetchKnowledgeSources = async () => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createKnowledgeSource = async (sourceData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert([sourceData])
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const updateKnowledgeSource = async (id, updateData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .update(updateData)
      .eq('id', id)
      .select();
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const deleteKnowledgeSource = async (id, targetUrl, name) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ''));
    if (isUUID) {
      const { data, error } = await supabase
        .from('knowledge_sources')
        .delete()
        .eq('id', id);
      return { data, error };
    }

    // Match by URL or name if non-UUID
    let query = supabase.from('knowledge_sources').delete();
    if (targetUrl) {
      const cleanUrl = targetUrl.replace(/^https?:\/\//, '').split('/')[0];
      query = query.or(`official_url.ilike.%${cleanUrl}%,name.ilike.%${name || cleanUrl}%`);
    } else if (name) {
      query = query.ilike('name', `%${name}%`);
    } else {
      query = query.eq('id', id);
    }
    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const deleteOpportunitiesBySourceUrl = async (urlPattern, agencyName) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const domain = (urlPattern || '').replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
    const domainKeyword = domain.replace(/^www\./, '').split('.')[0];
    let query = supabase.from('opportunities').delete();
    
    if (domainKeyword && agencyName) {
      query = query.or(
        `official_source->>url.ilike.%${domain}%,agency.ilike.%${agencyName}%,title.ilike.%${agencyName}%,title.ilike.%${domainKeyword}%`
      );
    } else if (domainKeyword) {
      query = query.or(
        `official_source->>url.ilike.%${domain}%,title.ilike.%${domainKeyword}%,agency.ilike.%${domainKeyword}%`
      );
    } else if (agencyName) {
      query = query.or(`agency.ilike.%${agencyName}%,title.ilike.%${agencyName}%`);
    }
    const { data, error } = await query;
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const deleteOpportunitiesByIds = async (ids) => {
  if (!isSupabaseConfigured || !ids?.length) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .delete()
      .in('id', ids);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// 4. Dynamic Opportunities API
export const fetchOpportunities = async () => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      const formatted = data.map((o) => ({
        id: o.id,
        title: o.title,
        agency: o.agency,
        category: o.category,
        categoryName: o.category_name || o.categoryName || 'General',
        categoryColor: o.category_color || o.categoryColor || '#093a96',
        shortDesc: o.short_desc || o.shortDesc || '',
        fullDesc: o.full_desc || o.fullDesc || '',
        matchScore: o.match_score || o.matchScore || 88,
        matchStatus: o.match_status || o.matchStatus || 'Likely Eligible',
        confidence: o.confidence || '96% Confident',
        deadline: o.deadline || 'Open Year-Round',
        isApproved: o.is_approved ?? true,
        benefits: o.benefits || [],
        whyYouQualify: o.why_you_qualify || o.whyYouQualify || [],
        requirements: o.requirements || [],
        missingItems: o.missing_items || o.missingItems || [],
        officialSource: o.official_source || o.officialSource || {},
        createdAt: o.created_at,
      }));
      return { data: formatted, error: null };
    }

    return { data: [], error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createOpportunity = async (oppData) => {
  if (!isSupabaseConfigured || !oppData) return { data: null, error: 'Not configured' };
  try {
    const payload = {
      title: oppData.title,
      agency: oppData.agency || 'Government Agency',
      category: (oppData.category || 'health').toLowerCase(),
      category_name: oppData.categoryName || oppData.category || 'General',
      category_color: oppData.categoryColor || '#093a96',
      short_desc: oppData.shortDesc || oppData.fullDesc || 'Government assistance program.',
      full_desc: oppData.fullDesc || oppData.shortDesc || '',
      match_score: oppData.matchScore || 90,
      match_status: oppData.matchStatus || 'Likely Eligible',
      confidence: oppData.confidence || '96% Confident',
      deadline: oppData.deadline || 'Ongoing Program',
      is_approved: oppData.isApproved ?? true,
      benefits: oppData.benefits || [],
      why_you_qualify: oppData.whyYouQualify || [],
      requirements: oppData.requirements || [],
      missing_items: oppData.missingItems || [],
      official_source: oppData.officialSource || {},
    };

    const { data, error } = await supabase
      .from('opportunities')
      .insert([payload])
      .select();

    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const saveMultipleOpportunitiesToSupabase = async (oppsList = []) => {
  if (!isSupabaseConfigured || !oppsList || oppsList.length === 0) return { data: null };
  try {
    const payloads = oppsList.map((oppData) => ({
      title: oppData.title,
      agency: oppData.agency || 'Government Agency',
      category: (oppData.category || 'health').toLowerCase(),
      category_name: oppData.categoryName || oppData.category || 'General',
      category_color: oppData.categoryColor || '#093a96',
      short_desc: oppData.shortDesc || oppData.fullDesc || 'Government assistance program.',
      full_desc: oppData.fullDesc || oppData.shortDesc || '',
      match_score: oppData.matchScore || 90,
      match_status: oppData.matchStatus || 'Likely Eligible',
      confidence: oppData.confidence || '96% Confident',
      deadline: oppData.deadline || 'Ongoing Program',
      is_approved: oppData.isApproved ?? true,
      benefits: oppData.benefits || [],
      why_you_qualify: oppData.whyYouQualify || [],
      requirements: oppData.requirements || [],
      missing_items: oppData.missingItems || [],
      official_source: oppData.officialSource || {},
    }));

    const { data, error } = await supabase
      .from('opportunities')
      .insert(payloads)
      .select();

    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// 5. Dynamic Audit Logs API
export const fetchAuditLogs = async () => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const createAuditLog = async (logData) => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([logData]);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// 6. Dynamic Chat Archives API (Real Citizen & AI Consultation History - User Isolated)
export const fetchChatArchives = async (userEmail = '', userId = '') => {
  if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };
  try {
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    if (!cleanEmail && !userId) {
      return { data: [], error: null };
    }

    let query = supabase
      .from('chat_archives')
      .select('*')
      .order('updated_at', { ascending: false });

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (isUUID && cleanEmail) {
      query = query.or(`user_id.eq.${userId},user_email.ilike.${cleanEmail}`);
    } else if (isUUID) {
      query = query.eq('user_id', userId);
    } else if (cleanEmail) {
      query = query.ilike('user_email', cleanEmail);
    }

    const { data, error } = await query;
    if (data) {
      const formatted = data.map((c) => ({
        id: c.id,
        userId: c.user_id,
        userEmail: c.user_email,
        title: c.title,
        category: c.category || 'General',
        categoryColor: c.category_color || '#093a96',
        preview: c.preview || '',
        messageCount: c.message_count || (c.messages?.length || 0),
        sourceUrl: c.source_url || '',
        messages: c.messages || [],
        timestamp: c.created_at,
        dateFormatted: new Date(c.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) + ' • ' + new Date(c.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }));
      return { data: formatted, error: null };
    }
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const saveChatArchiveToSupabase = async (archiveData) => {
  if (!isSupabaseConfigured || !archiveData) return { data: null, error: 'Not configured' };
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(archiveData.id);
    const userIdValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(archiveData.userId);

    const payload = {
      title: archiveData.title || 'Citizen AI Consultation',
      category: archiveData.category || 'General',
      category_color: archiveData.categoryColor || '#093a96',
      preview: archiveData.preview || '',
      message_count: archiveData.messages?.length || archiveData.messageCount || 0,
      source_url: archiveData.sourceUrl || '',
      messages: archiveData.messages || [],
      user_email: archiveData.userEmail || '',
      updated_at: new Date().toISOString(),
    };

    if (userIdValid) {
      payload.user_id = archiveData.userId;
    }

    if (isUUID) {
      payload.id = archiveData.id;
      const { data, error } = await supabase
        .from('chat_archives')
        .upsert(payload)
        .select();
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('chat_archives')
        .insert([payload])
        .select();
      return { data, error };
    }
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const deleteChatArchiveFromSupabase = async (id) => {
  if (!isSupabaseConfigured || !id) return { data: null, error: 'Not configured' };
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUUID) return { data: null, error: null };

    const { data, error } = await supabase
      .from('chat_archives')
      .delete()
      .eq('id', id);
    return { data, error };
  } catch (err) {
    return { data: null, error: err.message };
  }
};
