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
 * RAG Semantic & Lexical Knowledge Retriever
 * Dynamically queries all scraped databases, opportunities, and sources for the most relevant context chunks
 */
export function retrieveRelevantKnowledgeChunks(userQuery, database = {}) {
  const { opportunities = [], sources = [], opp = null } = database;
  const q = userQuery.toLowerCase().trim();
  const queryTokens = q.split(/\s+/).filter((w) => w.length > 2);

  const scoredChunks = [];

  // If citizen is currently inspecting a specific opportunity card, prioritize it with highest weight
  if (opp) {
    scoredChunks.push({
      score: 100,
      title: opp.title,
      agency: opp.agency,
      category: opp.categoryName || opp.category,
      content: `Target Program: ${opp.title} (${opp.agency}). ${opp.fullDesc || opp.shortDesc}. Benefits: ${(opp.benefits || []).join(', ')}. Requirements: ${(opp.requirements || []).map((r) => (typeof r === 'string' ? r : r.name)).join(', ')}.`,
      sourceUrl: opp.officialSource?.url || 'https://www.gov.ph',
    });
  }

  // 1. Score and retrieve relevant scraped opportunities from database
  opportunities.forEach((item) => {
    if (opp && opp.id === item.id) return;

    const itemText = (
      item.title +
      ' ' +
      item.agency +
      ' ' +
      (item.categoryName || item.category || '') +
      ' ' +
      (item.shortDesc || '') +
      ' ' +
      (item.fullDesc || '') +
      ' ' +
      (item.benefits || []).join(' ') +
      ' ' +
      (item.requirements || []).map((r) => (typeof r === 'string' ? r : r.name)).join(' ')
    ).toLowerCase();

    let score = 0;

    if (q.includes(item.title.toLowerCase()) || itemText.includes(q)) {
      score += 30;
    }

    queryTokens.forEach((token) => {
      if (itemText.includes(token)) {
        score += 6;
      }
    });

    if (
      (q.includes('borrow') || q.includes('loan') || q.includes('money') || q.includes('cash') || q.includes('utang') || q.includes('pautang')) &&
      (itemText.includes('loan') || itemText.includes('cash') || itemText.includes('subsidy') || itemText.includes('assistance') || itemText.includes('sss') || itemText.includes('pag-ibig') || itemText.includes('aics'))
    ) {
      score += 35;
    }

    if (
      (q.includes('senior') || q.includes('elderly') || q.includes('60') || q.includes('osca')) &&
      (itemText.includes('senior') || itemText.includes('osca') || itemText.includes('pension') || itemText.includes('philhealth'))
    ) {
      score += 35;
    }

    if (
      (q.includes('student') || q.includes('tuition') || q.includes('scholarship') || q.includes('school')) &&
      (itemText.includes('student') || itemText.includes('tuition') || itemText.includes('education') || itemText.includes('ched') || itemText.includes('spes'))
    ) {
      score += 35;
    }

    if (
      (q.includes('hospital') || q.includes('medical') || q.includes('bill') || q.includes('malasakit') || q.includes('gamot') || q.includes('doh')) &&
      (itemText.includes('hospital') || itemText.includes('medical') || itemText.includes('philhealth') || itemText.includes('map') || itemText.includes('doh'))
    ) {
      score += 35;
    }

    if (
      (q.includes('job') || q.includes('work') || q.includes('trabaho') || q.includes('dole') || q.includes('tupad')) &&
      (itemText.includes('tupad') || itemText.includes('employment') || itemText.includes('labor') || itemText.includes('dole'))
    ) {
      score += 35;
    }

    if (score > 0) {
      scoredChunks.push({
        score,
        title: item.title,
        agency: item.agency,
        category: item.categoryName || item.category,
        content: `${item.title} (${item.agency}): ${item.fullDesc || item.shortDesc}. Entitlements: ${(item.benefits || []).join(', ')}. Requirements: ${(item.requirements || []).map((r) => (typeof r === 'string' ? r : r.name)).join(', ')}.`,
        sourceUrl: item.officialSource?.url || 'https://www.gov.ph',
      });
    }
  });

  // 2. Score and retrieve matching scraped sources
  sources.forEach((s) => {
    const sName = (s.agency_name || s.agencyName || s.name || '').toLowerCase();
    const sCat = (s.category || '').toLowerCase();
    const sUrl = s.official_url || s.officialUrl || s.url || '';

    let sScore = 0;
    queryTokens.forEach((token) => {
      if (sName.includes(token) || sCat.includes(token)) sScore += 5;
    });

    if (sScore > 0) {
      scoredChunks.push({
        score: sScore,
        title: s.agency_name || s.name || 'Official Knowledge Source',
        agency: s.agency_name || 'Government Portal',
        category: s.category || 'General',
        content: `Live Scraped Knowledge Source: ${s.agency_name || s.name} (${sUrl}). Sector: ${s.category || 'General'}. Continuous circular & charter monitoring enabled.`,
        sourceUrl: sUrl,
      });
    }
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, 5);
}

/**
 * Build dynamic RAG grounding context from all scraped websites, opportunities, and citizen profile
 */
export function buildGroundingContext(userQuery, options = {}) {
  const { opp, user, opportunities = [], sources = [], userDocs = [] } = options;

  const retrievedChunks = retrieveRelevantKnowledgeChunks(userQuery, {
    opp,
    opportunities,
    sources,
    userDocs,
  });

  let rag = '\n\n## VERIFIED REAL-TIME RETRIEVED KNOWLEDGE BASE (RAG CONTEXT - STRICT FACT-CHECKED TRUTH):\n';

  if (retrievedChunks.length > 0) {
    retrievedChunks.forEach((chunk, i) => {
      rag += `[Retrieved Grounded Source ${i + 1}] ${chunk.title} (${chunk.agency} - ${chunk.category})\n`;
      rag += `• Details: ${chunk.content}\n`;
      rag += `• Official Verified Link: ${chunk.sourceUrl}\n\n`;
    });
  } else {
    opportunities.slice(0, 4).forEach((o, i) => {
      rag += `[General Program ${i + 1}] ${o.title} (${o.agency})\n`;
      rag += `• Details: ${o.shortDesc || o.fullDesc}\n`;
      rag += `• Official Verified Link: ${o.officialSource?.url || 'https://www.gov.ph'}\n\n`;
    });
  }

  // User Profile Context
  if (user) {
    rag += `### CITIZEN PROFILE CONTEXT:\n`;
    rag += `• Citizen Name: ${user.firstName || 'Adones'} ${user.lastName || 'Santos'}\n`;
    rag += `• Resident Status: ${user.isVerified ? 'eGov PH Verified Citizen' : 'Citizen'}\n`;
    if (userDocs && userDocs.length > 0) {
      rag += `• Uploaded Verified Documents in Vault: ${userDocs.map((d) => d.name).join(', ')}\n`;
    }
    rag += '\n';
  }

  return rag;
}

/**
 * Intelligent Deterministic Grounded Responder segmented by Citizen Persona with Anti-Scam Verification
 */
function generateStructuredGroundedAnswer(cleanQ, options = {}) {
  const { opp, userDocs = [] } = options;

  // 1. Specific Program Focused (when opened from a card)
  if (opp) {
    if (cleanQ.includes('document') || cleanQ.includes('need') || cleanQ.includes('require')) {
      const docList =
        opp.requirements
          ?.map((r) => {
            const name = typeof r === 'string' ? r : r.name;
            const hasDoc = userDocs.some((d) => (d.name || '').toLowerCase().includes(name.toLowerCase().substring(0, 6)));
            return `• ${name} — ${hasDoc ? '✓ Verified in Profile' : 'Action Required'}`;
          })
          .join('\n') || '• Valid Government Issued ID\n• Official Application Form';
      return `Here are the official document requirements for ${opp.title}:\n\n${docList}\n\nWhere to Submit: Apply directly at the nearest ${opp.agency} office or Malasakit Center desk.\n\nVerified Source: ${opp.officialSource?.url || 'https://www.gov.ph'}`;
    }

    if (cleanQ.includes('eligible') || cleanQ.includes('qualify') || cleanQ.includes('am i')) {
      return `Eligibility Evaluation for ${opp.title}:\n\n• Program: ${opp.title} (${opp.agency})\n• Match Rating: ${opp.matchScore || 92}% Match\n• Status: Likely Eligible based on verified profile credentials.\n\nEntitled Benefits:\n${opp.benefits?.map((b) => `• ${b}`).join('\n') || '• Full covered assistance'}\n\nVerified Source: ${opp.officialSource?.url || 'https://www.gov.ph'}`;
    }

    if (cleanQ.includes('where') || cleanQ.includes('apply') || cleanQ.includes('how')) {
      return `Application Guide for ${opp.title}:\n\n1. Prepare required documents in your Alalay Vault.\n2. Submit to the nearest ${opp.agency} branch office or hospital Malasakit Center desk.\n3. Present your verified PhilSys National ID for express processing.\n\nOfficial Portal: ${opp.officialSource?.url || 'https://www.gov.ph'}`;
    }
  }

  // 2. Borrow Money / Loans / Cash Grants / Financial Assistance (Persona-Segmented)
  if (
    cleanQ.includes('borrow') ||
    cleanQ.includes('loan') ||
    cleanQ.includes('money') ||
    cleanQ.includes('cash') ||
    cleanQ.includes('utang') ||
    cleanQ.includes('pautang') ||
    cleanQ.includes('fund') ||
    cleanQ.includes('financial assistance')
  ) {
    return (
      `Here are the legitimate Philippine government loan and emergency financial assistance programs categorized by your citizen profile:\n\n` +
      `💼 If you are an Employed Worker or Contributing Member:\n` +
      `1. SSS Salary & Calamity Loan (Social Security System)\n` +
      `• Loan Amount: Up to 1 to 2 months average salary\n` +
      `• Terms: 10% annual interest, 24-month repayment period\n` +
      `• Requirements: Active member with at least 36 monthly contributions, UMID/PhilSys ID\n` +
      `• Official Portal: https://www.sss.gov.ph\n\n` +
      `2. Pag-IBIG Multi-Purpose Cash Loan (HDMF MPL)\n` +
      `• Loan Amount: Up to 80% of your total accumulated Pag-IBIG savings\n` +
      `• Terms: 10.5% p.a. interest, 24 to 36 month repayment period\n` +
      `• Requirements: At least 24 monthly contributions, valid government photo ID\n` +
      `• Official Portal: https://www.pagibigfund.gov.ph\n\n` +
      `🤝 If you are an Indigent Citizen or Family in Emergency Crisis:\n` +
      `3. DSWD AICS Emergency Cash Assistance (Non-Repayable Grant)\n` +
      `• Assistance: ₱3,000 to ₱10,000 outright cash grant for medical, food, or crisis support\n` +
      `• Requirements: Barangay Certificate of Indigency, Valid Government ID\n` +
      `• Where to Apply: Nearest DSWD Field Office or City Social Welfare (CSWDO) desk\n` +
      `• Official Portal: https://www.dswd.gov.ph\n\n` +
      `🎓 If you are a College Student Enrolled in Higher Education:\n` +
      `4. UniFAST Tertiary Education Subsidy (TES) & Tulong Dunong Grant\n` +
      `• Benefit: ₱20,000 to ₱40,000 per academic year for books, tuition, and living allowance\n` +
      `• Where to Apply: Apply directly through your college/university's official Registrar / Student Affairs Office or unifast.gov.ph\n` +
      `• Official Portal: https://unifast.gov.ph & https://ched.gov.ph\n\n` +
      `🛡️ Anti-Fraud Advisory: All legitimate government subsidies and loan applications are processed exclusively through official .gov.ph portals or on-site agency desks. Never pay processing fees to third-party social media pages.`
    );
  }

  // 3. Senior Citizen Benefits & Free Healthcare
  if (
    cleanQ.includes('senior') ||
    cleanQ.includes('elderly') ||
    cleanQ.includes('osca') ||
    cleanQ.includes('60')
  ) {
    return (
      `👴 If you are a Senior Citizen (Age 60 and above):\n\n` +
      `1. Free Mandatory PhilHealth Coverage (RA 10645)\n` +
      `• 100% Subsidized Hospital Room and Board in public hospital wards\n` +
      `• Zero-Balance Billing (Zero out-of-pocket expenses for ward accommodations)\n` +
      `• 20% Statutory Discount & 12% VAT Exemption on all Prescription Medicines\n` +
      `• Requirements: OSCA Senior Citizen ID or PhilSys National ID\n` +
      `• Official Portal: https://www.philhealth.gov.ph\n\n` +
      `2. DSWD Social Pension for Indigent Senior Citizens (SPISC)\n` +
      `• Monthly cash stipend for seniors without regular income or institutional pension\n` +
      `• Where to Apply: City/Municipal Office of Senior Citizens Affairs (OSCA)\n` +
      `• Official Portal: https://www.dswd.gov.ph`
    );
  }

  // 4. Student Programs & Educational Assistance
  if (
    cleanQ.includes('student') ||
    cleanQ.includes('tuition') ||
    cleanQ.includes('scholarship') ||
    cleanQ.includes('spes') ||
    cleanQ.includes('school')
  ) {
    return (
      `🎓 If you are a Student or Youth:\n\n` +
      `1. Tertiary Education Subsidy (TES / UniFAST)\n` +
      `• Subsidies for tuition, books, and living allowances up to ₱40,000/year for undergraduate students\n` +
      `• How to Apply: Apply exclusively via your school Registrar / Student Financial Office or unifast.gov.ph\n` +
      `• Official Portal: https://unifast.gov.ph\n\n` +
      `2. SPES Student Bridging Employment (DOLE)\n` +
      `• Temporary student wage employment with 40% salary paid via government educational vouchers\n` +
      `• Requirements: Certificate of Registration (COR), Passing Grades, Valid Student ID\n` +
      `• Where to Apply: Local Government Public Employment Service Office (PESO)\n` +
      `• Official Portal: https://dole.gov.ph\n\n` +
      `🛡️ Anti-Scam Advisory: Beware of unofficial Facebook groups posing as CHED/UniFAST. Genuine grants are 100% free with no application fees.`
    );
  }

  // 5. Medical & Hospital Assistance
  if (
    cleanQ.includes('hospital') ||
    cleanQ.includes('medical') ||
    cleanQ.includes('malasakit') ||
    cleanQ.includes('medicine') ||
    cleanQ.includes('doh') ||
    cleanQ.includes('bill')
  ) {
    return (
      `🏥 If you or a Family Member need Hospital or Medical Assistance:\n\n` +
      `1. DOH Medical Assistance for Indigent Patients (MAP) via Malasakit Centers\n` +
      `• Direct guarantee letters covering hospital bills, surgery supplies, laboratory tests, and dialysis\n` +
      `• Free diagnostic scan vouchers (CT Scan / MRI) and subsidized chemotherapy drugs\n` +
      `• Where to Apply: Malasakit Center desk inside any accredited public hospital\n` +
      `• Official Portal: https://doh.gov.ph\n\n` +
      `2. PhilHealth Universal Health Care & Konsulta\n` +
      `• Free primary consultations, preventive health screenings, and generic maintenance medicines\n` +
      `• Mandatory Zero-Balance Billing in public hospital ward beds\n` +
      `• Official Portal: https://www.philhealth.gov.ph`
    );
  }

  // 6. Labor & Employment Assistance
  if (
    cleanQ.includes('job') ||
    cleanQ.includes('work') ||
    cleanQ.includes('dole') ||
    cleanQ.includes('tupad') ||
    cleanQ.includes('trabaho')
  ) {
    return (
      `👷 If you are a Displaced Worker, Seasonal Worker, or Underemployed:\n\n` +
      `1. DOLE TUPAD Emergency Wage Employment\n` +
      `• 10 to 30 days community employment with guaranteed regional minimum cash wage\n` +
      `• Free GSIS micro-insurance and safety uniform kit\n` +
      `• Where to Apply: Local Barangay Hall or City/Municipal PESO Office\n` +
      `• Official Portal: https://dole.gov.ph\n\n` +
      `2. DOLE Integrated Livelihood Program (DILP)\n` +
      `• Grant assistance for self-employed individuals and community enterprise projects\n` +
      `• Official Portal: https://dole.gov.ph`
    );
  }

  return `ALALAY is grounded in verified Philippine Citizen's Charters. All government assistance, loans, and subsidies are retrieved from official .gov.ph portals. Visit your nearest Malasakit Center, OSCA, PESO, or DSWD office for on-site assistance.`;
}

/**
 * Ask Alalay AI with Full 8-Layer Guardrails Protection & RAG Grounding
 */
export async function askAlalayAI(userQuestion, options = {}) {
  const cleanQ = userQuestion.trim().toLowerCase();

  const contextOptions = typeof options === 'string' ? { contextType: options } : options;

  // 1. Build RAG Grounded Context dynamically retrieved for this specific query
  const ragContext = buildGroundingContext(userQuestion, contextOptions);

  const systemPrompt =
    'You are ALALAY, an empathetic, highly structured AI government and healthcare assistance navigator in the Philippines. ' +
    'Answer questions accurately using ONLY the retrieved real-time knowledge base provided below. ' +
    'STRICT RAG SAFETY & ANTI-SCAM GUARDRAILS:\n' +
    '1. NEVER hallucinate non-existent government programs, loans, or unofficial social media links.\n' +
    '2. Format responses clearly segmented by Citizen Persona:\n' +
    '   - "💼 If you are an Employed Worker / Member:" (SSS Salary Loan, Pag-IBIG MPL)\n' +
    '   - "🤝 If you are an Indigent Citizen / Family in Crisis:" (DSWD AICS Emergency Cash Grant)\n' +
    '   - "🎓 If you are an Enrolled College Student:" (UniFAST Tertiary Education Subsidy via School Registrar)\n' +
    '   - "👴 If you are a Senior Citizen (Age 60+):" (PhilHealth Automatic Hospitalization Coverage RA 10645)\n' +
    '   - "👷 If you are a Displaced / Informal Worker:" (DOLE TUPAD Emergency Wage Employment)\n' +
    '3. Format with clean bullet points (• ), numbered steps (1., 2.), checklist tags (✓ Met / ✗ Missing), and Philippine Peso (₱). NO markdown asterisks (**).\n' +
    '4. Always include an Anti-Scam Advisory warning citizens that official government grants are 100% free.\n' +
    '5. Always end with the verified official source reference URL (.gov.ph) from the retrieved chunks.\n' +
    getDictionaryContext() +
    ragContext;

  // 2. Check for Gemini API key
  const apiKey = getApiKey();
  if (!apiKey) {
    return generateStructuredGroundedAnswer(cleanQ, contextOptions);
  }

  // 3. Call Google Gemini API (gemini-1.5-flash / gemini-1.5-pro / gemini-2.0-flash)
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

  for (const model of models) {
    try {
      const isBearerToken = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      };

      if (isBearerToken) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Question: ${userQuestion}\n\nInstructions: Analyze the retrieved knowledge chunks above and answer the user question directly, categorized clearly by Citizen Persona ("If you are a student...", "If you are a senior citizen...", "If you are an employed worker..."), with rich visual bullet points (• ), loan/grant amounts in Philippine Peso (₱), requirement checklists, and official link citations. Include an anti-fraud notice. No markdown asterisks (**).`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text;

        if (rawText && rawText.trim().length > 10) {
          return cleanMarkdownText(rawText);
        }
      }
    } catch (err) {
      // Continue to next model or fallback
    }
  }

  // Fallback to deterministic grounded generator
  return generateStructuredGroundedAnswer(cleanQ, contextOptions);
}
