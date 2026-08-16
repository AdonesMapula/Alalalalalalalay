import { getDictionaryContext, getLabReferenceContext } from './dictionaryService';

let isPrimaryKeyExhausted = false;
let activeKeyType = 'primary';

// 1. Dual-Key Management
export const getPrimaryApiKey = () => {
  return (
    import.meta.env.VITE_GEMINI_API ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.EXPO_PUBLIC_GEMINI_API ||
    ''
  );
};

export const getReserveApiKey = () => {
  return (
    import.meta.env.VITE_GEMINI_API_RESERVE ||
    import.meta.env.VITE_GEMINI_API_KEY_RESERVE ||
    import.meta.env.EXPO_PUBLIC_GEMINI_API_RESERVE ||
    import.meta.env.EXPO_PUIBLIC_GEMINI_API_RESERVE ||
    ''
  );
};

export const getApiKey = () => {
  const primary = getPrimaryApiKey();
  const reserve = getReserveApiKey();

  if (isPrimaryKeyExhausted && reserve) {
    return reserve;
  }
  if (primary) {
    return primary;
  }
  if (reserve) {
    return reserve;
  }
  return '';
};

// Switch active key to reserve if available
export const switchKeyToReserveIfAvailable = (reason) => {
  const reserveKey = getReserveApiKey();
  if (reserveKey && activeKeyType === 'primary') {
    isPrimaryKeyExhausted = true;
    activeKeyType = 'reserve';
    console.warn(
      `[GeminiService] Primary API key exhausted/rate limited (${reason}). Automatically switched to RESERVE Gemini API Key.`
    );
    return true;
  }
  return false;
};

// Clean markdown formatting & sanitize output
export function cleanMarkdownText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove **bold**
    .replace(/\*(.*?)\*/g, '$1') // remove *italic*
    .replace(/^\s*\*\s+/gm, '• ') // convert * bullets to •
    .trim();
}

// Sliding Window Rate Limiter
class GeminiApiLimiter {
  constructor() {
    this.requestTimestamps = [];
    this.maxPerMinute = 10;
    this.minDelayMs = 1500;
    this.lastRequestTime = 0;
    this.mutex = Promise.resolve();
  }

  async acquireSlot() {
    this.mutex = this.mutex.then(async () => {
      const now = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter((t) => now - t < 60000);

      if (this.requestTimestamps.length >= this.maxPerMinute) {
        const oldest = this.requestTimestamps[0];
        const waitTime = 60000 - (now - oldest) + 200;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      const elapsedSinceLast = Date.now() - this.lastRequestTime;
      if (elapsedSinceLast < this.minDelayMs) {
        await new Promise((resolve) => setTimeout(resolve, this.minDelayMs - elapsedSinceLast));
      }

      const executionTime = Date.now();
      this.requestTimestamps.push(executionTime);
      this.lastRequestTime = executionTime;
    });

    return this.mutex;
  }
}

const limiter = new GeminiApiLimiter();

/**
 * ALALAY SMART RAG SERVICE
 *
 * Design goals:
 * 1. Retrieve by topic + question intent, not by one shared keyword such as
 *    "loan" or "student".
 * 2. Let Gemini decide what the citizen is actually asking for.
 * 3. Use verified scraped data when it directly answers the question.
 * 4. Use Gemini's general Philippine-government knowledge for normal questions
 *    that are outside the scraped program database (for example Barangay Clearance).
 * 5. Never let an unrelated RAG chunk override a general question.
 * 6. Do not force the model to answer with information that is not supported.
 */

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'which', 'where',
  'when', 'how', 'can', 'could', 'would', 'should', 'are', 'is', 'do', 'does',
  'did', 'get', 'got', 'give', 'tell', 'please', 'about', 'into', 'your',
  'you', 'my', 'me', 'our', 'their', 'they', 'them', 'a', 'an', 'to', 'of',
  'in', 'on', 'at', 'or', 'as', 'be', 'it', 'its', 'i', 'am', 'we', 'us',
  'na', 'ng', 'ang', 'mga', 'para', 'sa', 'ito', 'iyon', 'ako', 'ko', 'mo',
  'saan', 'paano', 'ano', 'may', 'meron', 'pwede', 'po', 'ba', 'yung', 'kung',
]);

const QUESTION_INTENTS = {
  LIST: 'list_available_options',
  REQUIREMENTS: 'requirements',
  ELIGIBILITY: 'eligibility',
  APPLICATION: 'application_process',
  LOCATION: 'location_or_office',
  BENEFITS: 'benefits_or_coverage',
  FEES: 'fees_or_cost',
  PROCESSING: 'processing_time_or_status',
  DOCUMENTS: 'documents',
  GENERAL: 'general_information',
};

function normalizeText(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9áéíóúñü₱\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text = '') {
  return normalizeText(text)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function includesAny(text, phrases = []) {
  const q = normalizeText(text);
  return phrases.some((phrase) => q.includes(normalizeText(phrase)));
}

/**
 * Understand the shape of the question before retrieving documents.
 * This is intentionally deterministic and cheap. Gemini then gets the final
 * semantic interpretation instructions as well.
 */
export function analyzeQuestion(userQuery = '', conversationHistory = []) {
  const q = normalizeText(userQuery);
  const tokens = tokenize(q);
  const recent = Array.isArray(conversationHistory)
    ? conversationHistory.slice(-6).map((m) => {
      if (typeof m === 'string') return m;
      return m?.content || m?.text || '';
    }).filter(Boolean)
    : [];

  const combinedForReference = [...recent, userQuery].join(' ');

  let intent = QUESTION_INTENTS.GENERAL;
  let confidence = 0.55;

  if (includesAny(q, [
    'requirements', 'requirement', 'what do i need', 'what do i need to bring',
    'documents needed', 'documents required', 'papers needed', 'needed to apply',
    'ano ang requirements', 'anong requirements', 'ano kailangan', 'mga kailangan',
    'requirements to get', 'requirements for',
  ])) {
    intent = QUESTION_INTENTS.REQUIREMENTS;
    confidence = 0.98;
  } else if (includesAny(q, [
    'am i eligible', 'eligible', 'qualify', 'qualified', 'who can apply',
    'who qualifies', 'can i apply', 'pasok ba ako', 'pwede ba ako',
    'sino ang qualified', 'sino ang eligible',
  ])) {
    intent = QUESTION_INTENTS.ELIGIBILITY;
    confidence = 0.97;
  } else if (includesAny(q, [
    'how to apply', 'how do i apply', 'how can i apply', 'how to get',
    'how do i get', 'how can i get', 'steps', 'step by step', 'process of getting',
    'process to apply', 'application process', 'paano kumuha', 'paano mag apply',
    'paano mag-apply', 'paano makakuha', 'saan kumuha', 'where can i get',
  ])) {
    intent = QUESTION_INTENTS.APPLICATION;
    confidence = 0.96;
  } else if (includesAny(q, [
    'how much', 'fee', 'fees', 'cost', 'price', 'magkano', 'bayad', 'magkano ang',
  ])) {
    intent = QUESTION_INTENTS.FEES;
    confidence = 0.96;
  } else if (includesAny(q, [
    'how long', 'processing time', 'when will', 'when can i get', 'release',
    'gaano katagal', 'kailan makukuha', 'status', 'pending',
  ])) {
    intent = QUESTION_INTENTS.PROCESSING;
    confidence = 0.95;
  } else if (includesAny(q, [
    'where is', 'where can i apply', 'where do i apply', 'nearest', 'office',
    'branch', 'location', 'address', 'saan pwede', 'saan mag apply', 'saan ako pupunta',
  ])) {
    intent = QUESTION_INTENTS.LOCATION;
    confidence = 0.94;
  } else if (includesAny(q, [
    'what benefits', 'benefits', 'what do i get', 'what assistance', 'how much assistance',
    'covered', 'coverage', 'entitlement', 'ano ang benefit', 'ano makukuha',
  ])) {
    intent = QUESTION_INTENTS.BENEFITS;
    confidence = 0.94;
  } else if (includesAny(q, [
    'what loans', 'which loans', 'available loans', 'loans available',
    'what programs', 'which programs', 'available programs', 'what assistance is available',
    'what grants', 'which grants', 'ano ang mga loan', 'anong loan', 'anong programa',
    'mga available', 'what options', 'which options',
  ])) {
    intent = QUESTION_INTENTS.LIST;
    confidence = 0.95;
  } else if (includesAny(q, [
    'what documents', 'which documents', 'document', 'documents', 'id needed',
    'valid id', 'anong dokumento', 'anong id',
  ])) {
    intent = QUESTION_INTENTS.DOCUMENTS;
    confidence = 0.88;
  }

  // Detect the main topic separately from the requested information.
  // This is the key difference from the old implementation: "loan" and
  // "student" are topic signals, not the answer itself.
  const topicKeywords = [];
  const topicGroups = [
    ['loan', 'loans', 'pautang', 'utang', 'salary loan', 'calamity loan', 'multi purpose loan'],
    ['student', 'students', 'tuition', 'scholarship', 'school', 'education', 'tes', 'spes'],
    ['senior', 'elderly', 'osca', 'pension'],
    ['medical', 'hospital', 'medicine', 'malasakit', 'doh', 'health'],
    ['job', 'work', 'employment', 'trabaho', 'dole', 'tupad'],
    ['sss'],
    ['philhealth'],
    ['dswd', 'aics'],
    ['pag-ibig', 'pagibig', 'hdmf'],
    ['ched', 'unifast'],
    ['tesda'],
    ['barangay clearance', 'barangay certificate', 'barangay'],
    ['nbi clearance', 'nbi'],
    ['police clearance', 'police'],
    ['birth certificate', 'psa'],
    ['passport', 'dfa'],
    ['driver license', 'drivers license', 'lto'],
    ['tin', 'bir'],
  ];

  topicGroups.forEach((group) => {
    if (group.some((term) => q.includes(normalizeText(term)))) {
      topicKeywords.push(group[0]);
    }
  });

  // If a follow-up uses "it/the loan/that program", preserve a small amount
  // of previous context without allowing history to replace the current question.
  const isFollowUp = includesAny(q, [
    'it', 'that', 'this', 'the loan', 'the program', 'that loan', 'that program',
    'those', 'them', 'same program', 'yung loan', 'yung program',
  ]) && recent.length > 0;

  return {
    intent,
    confidence,
    topicKeywords,
    queryTokens: tokens,
    isFollowUp,
    conversationContext: combinedForReference,
    originalQuestion: userQuery,
  };
}

function getOpportunityText(item = {}) {
  return [
    item.title,
    item.agency,
    item.categoryName,
    item.category,
    item.shortDesc,
    item.fullDesc,
    ...(item.benefits || []),
    ...(item.requirements || []).map((r) => (typeof r === 'string' ? r : r?.name || '')),
    item.eligibility,
    item.qualification,
    item.applicationProcess,
    item.process,
    item.fees,
    item.processingTime,
  ].filter(Boolean).join(' ');
}

function scoreTextOverlap(queryTokens, itemText) {
  if (!queryTokens.length) return 0;
  const text = normalizeText(itemText);
  const matched = queryTokens.filter((token) => text.includes(token));
  return Math.min(24, matched.length * 3);
}

function scoreIntent(intent, item = {}) {
  const requirements = (item.requirements || []).length > 0 || !!item.requirements;
  const benefits = (item.benefits || []).length > 0 || !!item.benefits;
  const process = !!(item.applicationProcess || item.process || item.howToApply);
  const eligibility = !!(item.eligibility || item.qualification || item.qualifications);
  const fees = !!item.fees;
  const processing = !!item.processingTime;

  switch (intent) {
    case QUESTION_INTENTS.REQUIREMENTS:
    case QUESTION_INTENTS.DOCUMENTS:
      return requirements ? 22 : -6;
    case QUESTION_INTENTS.BENEFITS:
      return benefits ? 22 : -4;
    case QUESTION_INTENTS.APPLICATION:
      return process ? 22 : 0;
    case QUESTION_INTENTS.ELIGIBILITY:
      return eligibility ? 22 : -4;
    case QUESTION_INTENTS.FEES:
      return fees ? 22 : -3;
    case QUESTION_INTENTS.PROCESSING:
      return processing ? 22 : -3;
    case QUESTION_INTENTS.LIST:
      return 8;
    default:
      return 0;
  }
}

/**
 * Smart RAG retriever.
 *
 * It still works with the existing in-memory scraped data structure, but it
 * now scores the requested intent separately from the topic. This prevents
 * "loan + student" from being treated as the entire question.
 */
export function retrieveRelevantKnowledgeChunks(userQuery, database = {}) {
  const { opportunities = [], sources = [], opp = null, conversationHistory = [] } = database;
  const plan = analyzeQuestion(userQuery, conversationHistory);
  const q = normalizeText(userQuery);
  const scoredChunks = [];

  if (opp) {
    scoredChunks.push({
      score: 100,
      relevance: 'explicit-current-opportunity',
      title: opp.title,
      agency: opp.agency,
      category: opp.categoryName || opp.category,
      content: `Target Program: ${opp.title} (${opp.agency}). ${opp.fullDesc || opp.shortDesc || ''}. Benefits: ${(opp.benefits || []).join(', ')}. Requirements: ${(opp.requirements || []).map((r) => (typeof r === 'string' ? r : r?.name || '')).join(', ')}.`,
      sourceUrl: opp.officialSource?.url || '',
      rawItem: opp,
    });
  }

  opportunities.forEach((item) => {
    if (opp && opp.id === item.id) return;

    const itemText = getOpportunityText(item);
    const normalizedItem = normalizeText(itemText);
    let score = 0;

    // Strong topic matching.
    plan.topicKeywords.forEach((topic) => {
      if (normalizedItem.includes(normalizeText(topic))) score += 14;
    });

    // Exact title/phrase match is stronger than individual words.
    const title = normalizeText(item.title || '');
    if (title && q.includes(title)) score += 34;
    if (q.length >= 8 && normalizedItem.includes(q)) score += 28;

    // Individual words are intentionally low-weight.
    score += scoreTextOverlap(plan.queryTokens, normalizedItem);

    // Intent is scored separately.
    score += scoreIntent(plan.intent, item);

    // If the question asks for a list, prefer programs whose title/description
    // actually represents an option instead of merely containing the word loan.
    if (plan.intent === QUESTION_INTENTS.LIST) {
      if (includesAny(itemText, ['loan', 'program', 'assistance', 'grant', 'subsidy'])) score += 10;
    }

    // A topic match without an intent match should not be enough to create a
    // strong RAG result. This threshold is intentionally conservative.
    if (score >= 12) {
      scoredChunks.push({
        score,
        relevance: score >= 35 ? 'strong' : 'supporting',
        title: item.title,
        agency: item.agency,
        category: item.categoryName || item.category,
        content: `${item.title} (${item.agency}): ${item.fullDesc || item.shortDesc || ''}. Benefits: ${(item.benefits || []).join(', ')}. Requirements: ${(item.requirements || []).map((r) => (typeof r === 'string' ? r : r?.name || '')).join(', ')}. Eligibility: ${item.eligibility || item.qualification || item.qualifications || 'Not provided in this record'}. Application process: ${item.applicationProcess || item.process || item.howToApply || 'Not provided in this record'}. Fees: ${item.fees || 'Not provided in this record'}. Processing time: ${item.processingTime || 'Not provided in this record'}.`,
        sourceUrl: item.officialSource?.url || '',
        rawItem: item,
      });
    }
  });

  sources.forEach((s) => {
    const sName = normalizeText(s.agency_name || s.agencyName || s.name || '');
    const sCat = normalizeText(s.category || '');
    const sUrl = s.official_url || s.officialUrl || s.url || '';
    let score = 0;

    plan.topicKeywords.forEach((topic) => {
      if (sName.includes(normalizeText(topic)) || sCat.includes(normalizeText(topic))) score += 6;
    });

    if (score > 0) {
      scoredChunks.push({
        score,
        relevance: 'source-level',
        title: s.agency_name || s.name || 'Official Knowledge Source',
        agency: s.agency_name || 'Government Portal',
        category: s.category || 'General',
        content: `Official knowledge source: ${s.agency_name || s.name || 'Government source'} (${sUrl}). Sector: ${s.category || 'General'}.`,
        sourceUrl: sUrl,
        rawItem: s,
      });
    }
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  return scoredChunks.slice(0, 6).map((chunk) => ({
    ...chunk,
    queryIntent: plan.intent,
  }));
}

/**
 * Kept as a public helper for existing imports.
 * The result now reflects question intent instead of simple keyword routing.
 */
export function classifyQueryIntent(userQuery, ragChunks = [], conversationHistory = []) {
  const plan = analyzeQuestion(userQuery, conversationHistory);

  if (ragChunks.some((chunk) => chunk.score >= 35)) return 'rag';

  // Procedural government-document questions are valid general questions even
  // when the RAG database has no matching program.
  if (plan.topicKeywords.some((topic) => [
    'barangay clearance', 'nbi clearance', 'police clearance', 'birth certificate',
    'passport', 'driver license', 'tin',
  ].includes(topic))) {
    return ragChunks.length > 0 ? 'hybrid' : 'general';
  }

  return ragChunks.length > 0 ? 'rag' : 'general';
}

function formatRagContext(retrievedChunks, plan) {
  if (!retrievedChunks.length) {
    return 'No sufficiently relevant verified program record was retrieved for this question.\n';
  }

  return retrievedChunks.map((chunk, index) => {
    return [
      `[Verified Candidate ${index + 1}]`,
      `Title: ${chunk.title || 'Unknown'}`,
      `Agency: ${chunk.agency || 'Unknown'}`,
      `Category: ${chunk.category || 'General'}`,
      `Relevance score: ${chunk.score}`,
      `Retrieved because of: ${chunk.relevance}`,
      `Verified source: ${chunk.sourceUrl || 'No specific source URL stored'}`,
      `Content: ${chunk.content}`,
    ].join('\n');
  }).join('\n\n');
}

/**
 * Build the RAG context. The context explicitly separates "candidate data"
 * from "answer" so Gemini knows that retrieval candidates are not automatically
 * the answer to the question.
 */
export function buildGroundingContext(userQuery, options = {}) {
  const {
    opp,
    user,
    opportunities = [],
    sources = [],
    userDocs = [],
    conversationHistory = [],
  } = options;

  const plan = analyzeQuestion(userQuery, conversationHistory);
  const retrievedChunks = retrieveRelevantKnowledgeChunks(userQuery, {
    opp,
    opportunities,
    sources,
    userDocs,
    conversationHistory,
  });

  let rag = '\n\n## VERIFIED RETRIEVED KNOWLEDGE\n';
  rag += 'Important: Retrieved records are CANDIDATES, not automatic answers. Only use a record if it answers the exact requested intent.\n';
  rag += `Detected question intent: ${plan.intent}\n`;
  rag += `Detected topic(s): ${plan.topicKeywords.join(', ') || 'general'}\n\n`;
  rag += formatRagContext(retrievedChunks, plan);

  if (!retrievedChunks.length && opportunities.length > 0) {
    rag += '\nNo relevant opportunity was retrieved. Do not select an unrelated program just because it shares one word with the question.\n';
  }

  if (user) {
    rag += '\n### CITIZEN PROFILE CONTEXT\n';
    rag += `• Citizen Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() + '\n';
    rag += `• Resident Status: ${user.isVerified ? 'eGov PH Verified Citizen' : 'Citizen'}\n`;
    if (userDocs && userDocs.length > 0) {
      rag += `• Uploaded Verified Documents in Vault: ${userDocs.map((d) => d.name).join(', ')}\n`;
    }
  }

  return rag;
}

/**
 * General-government fallback used only when Gemini is unavailable.
 * This is deliberately useful for common procedural questions instead of
 * returning the old generic four-line government-services message.
 */
function generateStructuredGroundedAnswer(cleanQ, options = {}) {
  const q = normalizeText(cleanQ);
  const { opp, opportunities = [], userDocs = [] } = options;

  // 1. Explicit Single Opportunity Focus
  if (opp) {
    if (includesAny(q, ['requirements', 'documents', 'what do i need', 'what do i bring'])) {
      const docList = (opp.requirements || [])
        .map((r) => {
          const name = typeof r === 'string' ? r : r?.name || 'Required document';
          const hasDoc = Array.isArray(userDocs) && userDocs.some((d) => normalizeText(d.name || '').includes(normalizeText(name).slice(0, 6)));
          return `• ${name} — ${hasDoc ? '✓ Verified in Profile' : 'Action Required'}`;
        })
        .join('\n') || '• Check the official program record for the required documents.';
      return `Requirements for ${opp.title}:\n\n${docList}\n\nVerified Source: ${opp.officialSource?.url || 'https://www.gov.ph'}`;
    }

    if (includesAny(q, ['eligible', 'qualify', 'am i'])) {
      return `Eligibility for ${opp.title}:\n\n• Program: ${opp.title}\n• Agency: ${opp.agency}\n• Eligibility: ${opp.eligibility || opp.qualification || opp.qualifications || 'Available to eligible Philippine citizens meeting agency criteria.'}\n\nVerified Source: ${opp.officialSource?.url || 'https://www.gov.ph'}`;
    }

    if (includesAny(q, ['where', 'apply', 'how', 'steps'])) {
      return `How to apply for ${opp.title}:\n\n1. Review the listed requirements.\n2. Prepare your required identification and supporting papers.\n3. Submit through the ${opp.agency || 'responsible agency'} frontline desk or official portal.\n\nOfficial Source: ${opp.officialSource?.url || 'https://www.gov.ph'}`;
    }

    return `${opp.title} (${opp.agency}):\n\n• Overview: ${opp.fullDesc || opp.shortDesc || 'Government assistance program'}\n• Entitlements: ${(opp.benefits || []).join(', ') || 'Coverage and financial support under agency guidelines'}\n• Source: ${opp.officialSource?.url || 'https://www.gov.ph'}`;
  }

  // 2. Student Benefits & Scholarships
  if (q.includes('student') || q.includes('estudyante') || q.includes('school') || q.includes('scholarship') || q.includes('tuition')) {
    const studentOpps = opportunities.filter((o) => {
      const t = normalizeText(`${o.title} ${o.category} ${o.categoryName} ${o.agency} ${o.shortDesc}`);
      return t.includes('student') || t.includes('tertiary') || t.includes('unifast') || t.includes('ched') || t.includes('spes') || t.includes('education');
    });

    let result = `Filipino students are entitled to key statutory benefits, tuition subsidies, and discounts under Philippine law:\n\n` +
      `1. Mandatory 20% Fare Discount (RA 11314 - Student Fare Discount Act):\n` +
      `• 20% discount on all domestic public transportation: Jeepneys, Buses, UV Express, MRT/LRT, Ferries, and Domestic Airline flights.\n` +
      `• Valid every day including weekends and holidays upon presentation of a valid School ID.\n\n` +
      `2. Free Higher Education (RA 10931):\n` +
      `• 100% Free Tuition and miscellaneous school fees in all State Universities and Colleges (SUCs) and Local Universities and Colleges (LUCs).\n\n` +
      `3. CHED & UniFAST Tertiary Education Subsidy (TES / Tulong Dunong):\n` +
      `• Cash allowance of ₱20,000 to ₱40,000 per academic year for books, living allowance, and education expenses.\n` +
      `• Apply through your college Registrar or Student Affairs Office (SFAO) and at https://unifast.gov.ph.\n\n` +
      `4. DOLE SPES Student Bridging Employment:\n` +
      `• Temporary paid wage employment during summer/semestral breaks with 40% government educational voucher subsidy.\n` +
      `• Apply at your local Public Employment Service Office (PESO).\n\n` +
      `5. Republic Act 11261 (First-Time Jobseekers Act):\n` +
      `• Free issuance of Barangay Clearance, NBI Clearance, Police Clearance, and Medical Certificates for graduating students applying for their first job.`;

    if (studentOpps.length > 0) {
      result += `\n\nMatched Verified Scraped Programs:\n` +
        studentOpps.slice(0, 3).map((o) => `• ${o.title} (${o.agency}): ${(o.benefits || []).join(', ') || o.shortDesc}`).join('\n');
    }

    return result;
  }

  // 3. Senior Citizen Benefits (RA 9994 & RA 10645)
  if (q.includes('senior') || q.includes('elderly') || q.includes('osca') || q.includes('pension')) {
    return (
      `Filipino Senior Citizens (Age 60+) are entitled to comprehensive statutory benefits under RA 9994 and RA 10645:\n\n` +
      `1. 20% Statutory Discount & 12% VAT Exemption:\n` +
      `• All prescription medicines, vitamins, and medical/dental supplies\n` +
      `• Professional fees of attending physicians in all private clinics and hospitals\n` +
      `• Public transportation fares (Jeepney, Bus, MRT, LRT, Taxis, Domestic Flights, Ships)\n` +
      `• Hotels, restaurants, recreation centers, movie theaters, and funeral services\n` +
      `• 5% special grocery discount on basic necessities and prime commodities\n\n` +
      `2. 100% Free Mandatory PhilHealth Coverage (RA 10645):\n` +
      `• Automatic subsidized PhilHealth membership with Zero-Balance Billing in public hospital wards\n\n` +
      `3. DSWD Social Pension for Indigent Senior Citizens (SPISC):\n` +
      `• ₱1,000 monthly cash stipend for seniors without regular pension or income (apply at OSCA)\n\n` +
      `4. Centenarian Cash Gift (RA 10868 / RA 11982):\n` +
      `• ₱10,000 milestone cash gifts at ages 80, 85, 90, and 95, and ₱100,000 at age 100.\n\n` +
      `Official Agency: City/Municipal Office of Senior Citizens Affairs (OSCA) & https://www.philhealth.gov.ph`
    );
  }

  // 4. Philippine Government Loans & Multi-Purpose Cash Assistance
  if (q.includes('loan') || q.includes('borrow') || q.includes('pautang') || q.includes('utang') || q.includes('pera') || q.includes('cash')) {
    return (
      `Here are the official Philippine government loan programs available by member category:\n\n` +
      `1. SSS Salary Loan (Employed / Self-Employed / OFW):\n` +
      `• Amount: 1 to 2 months average basic salary credit\n` +
      `• Interest: 10% annual interest rate computed on diminishing balance\n` +
      `• Terms: 24 equal monthly installments with direct bank or e-wallet disbursement\n` +
      `• Portal: https://www.sss.gov.ph\n\n` +
      `2. SSS Calamity Loan Assistance Program (CLAP):\n` +
      `• 7% interest per annum for declared calamity areas with 24-month payment terms\n\n` +
      `3. Pag-IBIG Multi-Purpose Cash Loan (HDMF MPL):\n` +
      `• Loan up to 80% of your accumulated Total Accumulated Value (TAV)\n` +
      `• Terms: 10.5% p.a. interest, 24 to 36 month repayment period via Virtual Pag-IBIG (https://www.pagibigfund.gov.ph)\n\n` +
      `4. DSWD AICS Emergency Cash Assistance (Non-Repayable Grant):\n` +
      `• ₱3,000 to ₱10,000 outright cash grant for emergency food, medicine, or family crisis support (apply at DSWD Field Office/CSWDO).\n\n` +
      `Anti-Scam Reminder: Official government loans and subsidies are processed exclusively via .gov.ph portals and branch offices. Never pay upfront processing fees.`
    );
  }

  // 5. Medical & Hospital Financial Assistance
  if (q.includes('hospital') || q.includes('medical') || q.includes('malasakit') || q.includes('doh') || q.includes('bill') || q.includes('gamot')) {
    return (
      `Assistance for Hospital Bills & Healthcare in the Philippines:\n\n` +
      `1. Malasakit Centers (One-Stop Action Desk):\n` +
      `• Located inside all DOH-run and accredited public hospitals nationwide.\n` +
      `• Coordinates assistance from PhilHealth, PCSO, DSWD, and DOH Medical Assistance for Indigent Patients (MAP).\n\n` +
      `2. PhilHealth Universal Health Care:\n` +
      `• Direct deduction from hospital bill and Zero-Balance Billing in public hospital basic ward beds.\n\n` +
      `3. DOH Medical Assistance for Indigent Patients (MAP):\n` +
      `• Guarantee Letters (GL) covering surgical supplies, laboratories, MRI/CT scans, dialysis, and medicines.\n\n` +
      `4. PCSO Individual Medical Assistance Program (IMAP):\n` +
      `• Cash vouchers and Guarantee Letters for hospitalization, chemotherapy, and specialty procedures.\n\n` +
      `Requirements to Bring: Clinical Abstract / Medical Certificate, Statement of Account (SOA) with hospital stamp, Barangay Certificate of Indigency, and Valid Photo ID.`
    );
  }

  // 6. Procedural Civil Documents: Barangay Clearance
  if (q.includes('barangay') && (q.includes('clearance') || q.includes('cert') || q.includes('how'))) {
    return (
      `Step-by-Step Guide: How to Get a Barangay Clearance in the Philippines\n\n` +
      `1. Requirements to Bring:\n` +
      `• Valid Government Photo ID (PhilSys National ID, Voter's ID, Postal ID, Driver's License, or Student ID)\n` +
      `• Community Tax Certificate (Cedula) — can be obtained at the same Barangay Hall\n` +
      `• Proof of Residency (Utility bill or lease agreement)\n` +
      `• 1x1 or 2x2 ID Photo (if required by your barangay)\n\n` +
      `2. Procedure:\n` +
      `1. Go to your local Barangay Hall where you reside.\n` +
      `2. Fill out the Barangay Clearance Application Form stating your purpose.\n` +
      `3. Pay the processing fee (₱50 – ₱200) at the Barangay Treasurer desk.\n` +
      `4. Wait for signature and official seal release (typically 15–30 minutes same-day).\n\n` +
      `Note: Under RA 11261 (First-Time Jobseekers Act), Barangay Clearance is 100% FREE for first-time job applicants upon presenting a First-Time Jobseeker Oath/Certificate.`
    );
  }

  // 7. NBI & Police Clearance
  if (q.includes('nbi') || q.includes('police clearance')) {
    return (
      `Step-by-Step Guide: How to Get NBI & Police Clearances\n\n` +
      `1. NBI Clearance:\n` +
      `1. Register online at https://clearance.nbi.gov.ph.\n` +
      `2. Choose branch, date, and appointment time.\n` +
      `3. Pay ₱130 + ₱25 e-service fee via GCash, Maya, or 7-Eleven.\n` +
      `4. Appear on your scheduled date with 2 valid IDs for photo and biometric capture.\n\n` +
      `2. National Police Clearance:\n` +
      `1. Register at https://pnpclearance.ph.\n` +
      `2. Book an appointment at your nearest Police Station and pay ₱150 fee.\n` +
      `3. Present 2 valid IDs on your appointment date for biometric release.`
    );
  }

  // 8. PSA Birth / Marriage Certificate
  if (q.includes('birth certificate') || q.includes('psa') || q.includes('marriage certificate')) {
    return (
      `How to Request a PSA Birth / Marriage Certificate:\n\n` +
      `• Online Delivery: Visit https://www.psaserbilis.com.ph or https://psahelpline.ph (₱330 per copy, delivered to your door in 3–5 business days).\n` +
      `• In-Person Walk-in: Book a mandatory appointment at https://appointment.psa.gov.ph before visiting any PSA CRS Outlet (₱155 per copy, same-day release with valid ID).`
    );
  }

  // 9. Generic Opportunity Matcher
  if (opportunities.length > 0) {
    const matched = opportunities.filter((o) => {
      const text = normalizeText(`${o.title} ${o.category} ${o.agency} ${o.shortDesc}`);
      return q.split(/\s+/).some((word) => word.length > 3 && text.includes(word));
    });

    if (matched.length > 0) {
      return (
        `Here are the relevant verified Philippine government programs matching your inquiry:\n\n` +
        matched.slice(0, 3).map((o, idx) => `${idx + 1}. ${o.title} (${o.agency})\n• Details: ${o.shortDesc || o.fullDesc}\n• Benefits: ${(o.benefits || []).join(', ') || 'Official government assistance'}\n• Official Portal: ${o.officialSource?.url || 'https://www.gov.ph'}`).join('\n\n') +
        `\n\nVisit the official agency portals or your local branch desk to apply.`
      );
    }
  }

  return `Here are the steps to access Philippine government services:\n\n1. Prepare valid government identification (PhilSys National ID, UMID, Postal ID, or Voter's ID).\n2. For civil requirements, visit your local Barangay Hall or City Hall frontline desk.\n3. For statutory benefits (SSS, PhilHealth, DSWD, Pag-IBIG), use the official .gov.ph portals or visit the nearest branch office.\n4. Official government forms and standard service consultations are free of charge.`;
}

/**
 * Ask ALALAY AI.
 *
 * The important change is that the model is explicitly required to separate:
 *   SUBJECT = what the question is about
 *   INTENT  = what the citizen wants to know about that subject
 *
 * Example:
 *   "What loans are applicable for students?"
 *       -> intent = list_available_options
 *
 *   "What are the requirements for the student loan?"
 *       -> intent = requirements
 *
 * They may share the same topic, but they must not receive the same answer.
 */
export async function askAlalayAI(userQuestion, options = {}) {
  const originalQuestion = String(userQuestion || '').trim();
  if (!originalQuestion) return 'Please enter a question so I can help you.';

  const contextOptions = typeof options === 'string' ? { contextType: options } : options;
  const {
    opportunities = [],
    sources = [],
    opp = null,
    user = null,
    userDocs = [],
    conversationHistory = [],
  } = contextOptions;

  const plan = analyzeQuestion(originalQuestion, conversationHistory);
  const ragContext = buildGroundingContext(originalQuestion, contextOptions);

  const historyText = Array.isArray(conversationHistory) && conversationHistory.length
    ? conversationHistory.slice(-6).map((m, i) => {
      const role = m?.role || (i % 2 === 0 ? 'user' : 'assistant');
      const text = typeof m === 'string' ? m : (m?.content || m?.text || '');
      return `${role}: ${text}`;
    }).join('\n')
    : 'No previous conversation provided.';

  const systemPrompt =
    'You are ALALAY, an intelligent Philippine government service assistant for Filipino citizens.\n\n' +
    'YOUR JOB IS NOT TO MATCH WORDS. YOUR JOB IS TO UNDERSTAND THE CITIZENS REQUEST.\n\n' +

    'QUESTION UNDERSTANDING RULES:\n' +
    '1. Identify the SUBJECT separately from the INTENT.\n' +
    '2. The subject is the government program, loan, benefit, document, agency, or service.\n' +
    '3. The intent is what the citizen wants to know: available options, requirements, eligibility, application steps, location, benefits, fees, processing time, documents, or general information.\n' +
    '4. Words such as "loan", "student", "SSS", or "DSWD" identify a topic. They are NOT by themselves the answer.\n' +
    '5. If the citizen asks "what loans are applicable for students", answer which loan/program options are applicable. Do NOT turn the answer into a requirements list unless requirements are explicitly requested.\n' +
    '6. If the citizen asks "what are the requirements for the student loan", answer the requirements/documents for the relevant loan. Do NOT repeat the previous list of loans.\n' +
    '7. If the citizen asks a follow-up such as "what are the requirements for it?" or "where can I apply for it?", use the recent conversation history to resolve "it".\n' +
    '8. Ignore irrelevant retrieved records even if they share a keyword with the question.\n\n' +

    'SOURCE PRIORITY:\n' +
    'A. VERIFIED RETRIEVED KNOWLEDGE: Use this when a retrieved record directly answers the exact question intent. Cite its specific source URL when available.\n' +
    'B. GENERAL PHILIPPINE GOVERNMENT KNOWLEDGE: Use this for ordinary government-document and procedural questions that are not covered by the verified records, such as Barangay Clearance, NBI Clearance, PSA certificates, passport, cedula, LTO, etc.\n' +
    'C. If neither source can support a specific claim, do not invent it. Say that the current information could not be verified and give the safest next step.\n\n' +

    'RAG RULES:\n' +
    '1. Retrieved records are candidates, NOT automatically the answer.\n' +
    '2. Match the record to BOTH the subject AND the requested intent.\n' +
    '3. For REQUIREMENTS/DOCUMENTS questions, prioritize requirement/document fields.\n' +
    '4. For BENEFITS questions, prioritize benefits/coverage fields.\n' +
    '5. For ELIGIBILITY questions, prioritize eligibility/qualification fields.\n' +
    '6. For APPLICATION questions, prioritize application/process fields.\n' +
    '7. For LIST questions, list the relevant programs/options and briefly explain why they match. Do not dump all requirements unless requested.\n' +
    '8. Never select a program solely because it contains a word from the question.\n\n' +

    'GENERAL QUESTION RULE:\n' +
    'If the question is not represented in the verified program data, answer it normally using your general knowledge of Philippine government offices and procedures. For local requirements, fees, schedules, or other details that may vary by LGU/barangay, explicitly say they can vary and should be verified with the relevant local office.\n\n' +

    'ANSWER RULES:\n' +
    '• Answer the exact question first.\n' +
    '• Use numbered steps for procedures.\n' +
    '• Use bullet points (•) for requirements, options, or lists.\n' +
    '• Do not repeat unrelated information merely because it appears in retrieved context.\n' +
    '• Do not output your reasoning, internal analysis, question classification, or source-selection process.\n' +
    '• Do not invent fees, requirements, processing times, URLs, or government rules.\n' +
    '• Use a specific office or official source when it is known.\n' +
    '• If a local government requirement can vary, say so instead of presenting one local rule as universal.\n' +
    '• Do not force a generic answer when the question can be answered specifically.\n' +
    '• No markdown asterisks.\n\n' +
    getDictionaryContext() +
    ragContext;

  const userInstruction =
    `RECENT CONVERSATION (use only when needed to resolve follow-ups):\n${historyText}\n\n` +
    `CURRENT CITIZEN QUESTION:\n${originalQuestion}\n\n` +
    `LOCAL QUESTION PLAN (a hint, not the answer):\n` +
    `- Intent: ${plan.intent}\n` +
    `- Topic: ${plan.topicKeywords.join(', ') || 'general'}\n` +
    `- Follow-up: ${plan.isFollowUp ? 'yes' : 'no'}\n\n` +
    'Now answer the CURRENT CITIZEN QUESTION only. Match the requested intent, not merely the shared keywords.';

  // 1. Preferred Route: Call secure backend proxy (zero credential exposure in browser)
  try {
    const backendRes = await fetch('/api/alalay/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        userInstruction,
        temperature: 0.1,
        maxOutputTokens: 1400,
      }),
    });

    if (backendRes.ok) {
      const backendData = await backendRes.json();
      if (backendData.success && backendData.text && backendData.text.trim().length > 10) {
        return cleanMarkdownText(backendData.text);
      }
    }
  } catch {
    // If backend proxy is not reachable, fall through to client direct fetch or grounded generator
  }

  // 2. Direct client fallback if API key is provided and backend proxy is bypassed
  let apiKey = getApiKey();
  if (apiKey) {
    const models = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3-flash-preview',
      'gemini-3.7-flash',
    ];

    for (const model of models) {
      try {
        await limiter.acquireSlot();
        const isOAuth = apiKey.startsWith('ya29.');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent${
          isOAuth ? '' : `?key=${apiKey}`
        }`;

        const headers = { 'Content-Type': 'application/json' };
        if (isOAuth) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        } else {
          headers['x-goog-api-key'] = apiKey;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userInstruction}` }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1400,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText =
            data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
          if (rawText.trim().length > 20) {
            return cleanMarkdownText(rawText);
          }
        } else if (response.status === 429) {
          if (switchKeyToReserveIfAvailable('Rate limit')) {
            apiKey = getApiKey();
          }
        }
      } catch {
        // Try next model
      }
    }
  }

  // 3. Grounded local fallback with full Philippine government knowledge synthesis
  return generateStructuredGroundedAnswer(originalQuestion, { ...contextOptions, userDocs, opportunities });
}
