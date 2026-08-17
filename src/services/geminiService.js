import { getDictionaryContext, getLabReferenceContext } from './dictionaryService.js';
import { AUTHORITATIVE_BENEFITS, calculateCitizenAge } from './rulesEngine.js';
import { OFFICIAL_AGENCY_DIRECTORY } from './webScraper.js';

let isPrimaryKeyExhausted = false;
let activeKeyType = 'primary';

// 1. Dual-Key Management & API Key Resolvers
export const getPrimaryApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (
      import.meta.env.VITE_GEMINI_API ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.EXPO_PUBLIC_GEMINI_API ||
      ''
    );
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_GEMINI_API || process.env.VITE_GEMINI_API_KEY || '';
  }
  return '';
};

export const getReserveApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (
      import.meta.env.VITE_GEMINI_API_RESERVE ||
      import.meta.env.VITE_GEMINI_API_KEY_RESERVE ||
      import.meta.env.EXPO_PUBLIC_GEMINI_API_RESERVE ||
      import.meta.env.EXPO_PUIBLIC_GEMINI_API_RESERVE ||
      ''
    );
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_GEMINI_API_RESERVE || process.env.VITE_GEMINI_API_KEY_RESERVE || '';
  }
  return '';
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
    .replace(/^\s*[\*\-]\s+/gm, '• ') // convert to standard bullets
    .trim();
}

// Sliding Window Rate Limiter
class GeminiApiLimiter {
  constructor() {
    this.requestTimestamps = [];
    this.maxPerMinute = 20;
    this.minDelayMs = 800;
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
 * Check if the user document vault contains a document matching the requirement
 */
export function checkUserDocMatch(reqName = '', userDocs = []) {
  if (!userDocs || userDocs.length === 0) return false;
  const rLow = (reqName || '').toLowerCase();
  return userDocs.some((d) => {
    const dName = (d.name || '').toLowerCase();
    const dType = (d.type || '').toLowerCase();
    return (
      (rLow.includes('id') && (dName.includes('id') || dName.includes('philsys') || dName.includes('umid') || dName.includes('driver') || dName.includes('passport'))) ||
      (rLow.includes('indigen') && (dName.includes('indigen') || dName.includes('barangay') || dType.includes('indigency'))) ||
      (rLow.includes('birth') && dName.includes('birth')) ||
      (rLow.includes('medical') && (dName.includes('medical') || dName.includes('abstract') || dName.includes('cert'))) ||
      (rLow.includes('bill') && (dName.includes('bill') || dName.includes('soa') || dName.includes('statement'))) ||
      (rLow.includes('registration') && (dName.includes('cor') || dName.includes('registration') || dName.includes('school'))) ||
      (rLow.includes('grades') && (dName.includes('grades') || dName.includes('tor') || dName.includes('transcript'))) ||
      (rLow.includes('nbi') && dName.includes('nbi')) ||
      (rLow.includes('resume') && (dName.includes('resume') || dName.includes('cv')))
    );
  });
}

/**
 * Normalize and clean queries, correcting common typos, Tagalog variants, and abbreviations
 */
export function normalizeQueryString(rawQuery = '') {
  let q = (rawQuery || '').toLowerCase().trim();

  // Normalize common typos, phonetic spelling, and local terms
  q = q
    // Barangay variants
    .replace(/\b(bargy|bargay|brgy|brgay|baranggay|baragay|bgry|bgy|barangy|brngy)\b/gi, 'barangay')
    // Clearance variants
    .replace(/\b(clearnace|clearence|clearans|clearnce|clrn|clearanc|klerans|clerans)\b/gi, 'clearance')
    // Certificate variants
    .replace(/\b(cert|certficate|certifcate|certificat|certfkt|sertipiko|katibayan)\b/gi, 'certificate')
    // Validity / duration variants
    .replace(/\b(liong|loong|long|tagal|validty|validdity|validaty|kailan|kelan|nageexpire|nag-eexpire|duration|valid)\b/gi, 'validity')
    // Senior variants
    .replace(/\b(senyor|senior citizen|elderly|matanda)\b/gi, 'senior')
    // Indigency variants
    .replace(/\b(indigen|indigent|indigensi|indiginsi|kahirapan)\b/gi, 'indigency')
    // Apply / Avail variants
    .replace(/\b(avial|avail|aply|kumuha|kuha|paano|saan|process)\b/gi, 'how to apply');

  return q;
}

/**
 * Autonomous Full-Spectrum Knowledge Retriever across all Scraped Government Websites & Databases
 */
export function retrieveRelevantKnowledgeChunks(userQuery, database = {}) {
  const { opportunities = [], sources = [], opp = null } = database;
  const oppsToSearch = Array.isArray(opportunities) ? opportunities : [];
  const q = normalizeQueryString(userQuery || '');
  const queryTokens = q.split(/\s+/).filter((w) => w.length > 2);

  const scoredChunks = [];

  // 1. Current selected opportunity card (highest weight)
  if (opp) {
    scoredChunks.push({
      score: 150,
      title: opp.title,
      agency: opp.agency,
      category: opp.categoryName || opp.category,
      shortDesc: opp.shortDesc,
      fullDesc: opp.fullDesc,
      benefits: opp.benefits || [],
      requirements: opp.requirements || [],
      content: `${opp.title} (${opp.agency}). ${opp.fullDesc || opp.shortDesc}. Benefits: ${(opp.benefits || []).join(', ')}. Requirements: ${(opp.requirements || []).map((r) => (typeof r === 'string' ? r : r.name)).join(', ')}.`,
      sourceUrl: opp.officialSource?.url || 'https://www.gov.ph',
      rawItem: opp,
    });
  }

  const isJobSearchQuery = q.includes('job') || q.includes('work') || q.includes('career') || q.includes('hiring') || q.includes('vacancy') || q.includes('employment') || q.includes('csr') || q.includes('sahod') || q.includes('salary');

  // 2. Database Opportunities & Scraped Programs
  oppsToSearch.forEach((item) => {
    if (opp && opp.id === item.id) return;

    const itemTitle = (item.title || '').toLowerCase();
    const isJobPosting = itemTitle.includes('job') || itemTitle.includes('vacancy') || itemTitle.includes('worker') || itemTitle.includes('technician') || itemTitle.includes('csr') || itemTitle.includes('representative');

    // Never return job postings if the citizen is asking a civic/document/legal question
    if (isJobPosting && !isJobSearchQuery) return;

    const itemAgency = (item.agency || '').toLowerCase();
    const itemCategory = (item.categoryName || item.category || '').toLowerCase();
    const itemDesc = ((item.shortDesc || '') + ' ' + (item.fullDesc || '')).toLowerCase();
    const itemBenefits = (item.benefits || []).join(' ').toLowerCase();
    const itemReqs = (item.requirements || []).map((r) => (typeof r === 'string' ? r : r.name)).join(' ').toLowerCase();

    const itemFullText = `${itemTitle} ${itemAgency} ${itemCategory} ${itemDesc} ${itemBenefits} ${itemReqs}`;

    let score = 0;
    if (q.includes(itemTitle) || itemTitle.includes(q)) score += 60;
    if (q.includes(itemAgency) || itemAgency.includes(q)) score += 40;
    if (itemFullText.includes(q)) score += 30;

    queryTokens.forEach((token) => {
      if (itemTitle.includes(token)) score += 18;
      if (itemAgency.includes(token)) score += 14;
      if (itemBenefits.includes(token)) score += 10;
      if (itemReqs.includes(token)) score += 8;
      if (itemFullText.includes(token)) score += 5;
    });

    if (score > 0) {
      scoredChunks.push({
        score,
        title: item.title,
        agency: item.agency,
        category: item.categoryName || item.category,
        shortDesc: item.shortDesc,
        fullDesc: item.fullDesc,
        benefits: item.benefits || [],
        requirements: item.requirements || [],
        content: `${item.title} (${item.agency}): ${item.fullDesc || item.shortDesc}. Benefits: ${(item.benefits || []).join(', ')}. Requirements: ${(item.requirements || []).map((r) => (typeof r === 'string' ? r : r.name)).join(', ')}.`,
        sourceUrl: item.officialSource?.url || 'https://www.gov.ph',
        rawItem: item,
      });
    }
  });

  // 3. Scraped Government Agency Directory
  if (OFFICIAL_AGENCY_DIRECTORY) {
    Object.entries(OFFICIAL_AGENCY_DIRECTORY).forEach(([domain, agencyData]) => {
      const fullText = (
        agencyData.name +
        ' ' +
        agencyData.title +
        ' ' +
        agencyData.category +
        ' ' +
        agencyData.description +
        ' ' +
        (agencyData.headings || []).join(' ') +
        ' ' +
        (agencyData.paragraphs || []).join(' ')
      ).toLowerCase();

      let score = 0;
      if (q.includes(domain) || fullText.includes(q)) score += 50;

      queryTokens.forEach((tok) => {
        if (fullText.includes(tok)) score += 10;
      });

      if (score > 0) {
        scoredChunks.push({
          score,
          title: agencyData.name,
          agency: agencyData.title,
          category: agencyData.category,
          shortDesc: agencyData.description,
          fullDesc: agencyData.description,
          benefits: agencyData.headings || [],
          requirements: ['Valid Philippine Government Photo ID', 'Official Application Form'],
          content: `${agencyData.description} Key Programs: ${(agencyData.headings || []).join('; ')}. Details: ${(agencyData.paragraphs || []).join(' ')}`,
          sourceUrl: `https://${domain}`,
          rawItem: agencyData,
        });
      }
    });
  }

  // 4. Authoritative Statutory Benefits
  (AUTHORITATIVE_BENEFITS || []).forEach((b) => {
    const bText = `${b.program_name} ${b.agency} ${b.benefit_type} ${b.amount_cap_summary} ${b.covered_expenses.join(' ')} ${b.required_documents.join(' ')}`.toLowerCase();
    let score = 0;
    queryTokens.forEach((t) => {
      if (bText.includes(t)) score += 10;
    });
    if (score > 0) {
      scoredChunks.push({
        score,
        title: b.program_name,
        agency: b.agency,
        category: b.benefit_type,
        shortDesc: b.amount_cap_summary,
        fullDesc: b.amount_cap_summary,
        benefits: b.covered_expenses,
        requirements: b.required_documents,
        content: `${b.program_name} (${b.agency}): ${b.amount_cap_summary}. Covered: ${b.covered_expenses.join(', ')}. Documents: ${b.required_documents.join(', ')}. Where to Apply: ${b.where_to_apply}. Processing: ${b.processing_time}.`,
        sourceUrl: 'https://www.gov.ph',
        rawItem: b,
      });
    }
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks;
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

  let rag = '\n\n## VERIFIED REAL-TIME SCRAPED GOVERNMENT KNOWLEDGE BASE (OFFICIAL .GOV.PH DATA):\n';

  if (retrievedChunks.length > 0) {
    retrievedChunks.slice(0, 6).forEach((chunk, i) => {
      rag += `[Scraped Source ${i + 1}] ${chunk.title} (${chunk.agency} - ${chunk.category})\n`;
      rag += `• Details: ${chunk.content}\n`;
      rag += `• Official Link: ${chunk.sourceUrl}\n\n`;
    });
  } else {
    Object.entries(OFFICIAL_AGENCY_DIRECTORY || {})
      .slice(0, 5)
      .forEach(([dom, info], i) => {
        rag += `[Agency Directory ${i + 1}] ${info.name}\n`;
        rag += `• Description: ${info.description}\n`;
        rag += `• Key Services: ${(info.headings || []).join(', ')}\n`;
        rag += `• Portal: https://${dom}\n\n`;
      });
  }

  // Citizen Profile Context
  if (user) {
    const age = calculateCitizenAge(user);
    rag += `### CITIZEN PROFILE CONTEXT:\n`;
    rag += `• Citizen Name: ${user.firstName || 'Adones'} ${user.lastName || 'Santos'}\n`;
    rag += `• Age: ${age} years old ${age >= 60 ? '(Senior Citizen - RA 9994 Entitled)' : ''}\n`;
    rag += `• Resident Status: ${user.isVerified ? 'eGov PH Verified Citizen' : 'Citizen'}\n`;
    if (userDocs && userDocs.length > 0) {
      rag += `• Uploaded Verified Documents in Vault: ${userDocs.map((d) => d.name).join(', ')}\n`;
    }
    rag += '\n';
  }

  return rag;
}

/**
 * Intelligent Dynamic Question Answering Engine (Generates direct, context-aware answers without forced robotic templates)
 */
function synthesizeDynamicAnswer(cleanQ, chunk, userDocs = [], user = {}) {
  const normQ = normalizeQueryString(cleanQ);
  const item = chunk?.rawItem || chunk || {};
  const title = chunk?.title || item.title || item.name || 'Government Program';
  const agency = chunk?.agency || item.agency || item.agency_name || 'Government Agency';
  const desc = item.fullDesc || item.shortDesc || item.description || chunk?.content || '';
  const benefits = Array.isArray(item.benefits) ? item.benefits : Array.isArray(item.covered_expenses) ? item.covered_expenses : [];
  const requirements = Array.isArray(item.requirements) ? item.requirements : Array.isArray(item.required_documents) ? item.required_documents : [];
  const sourceUrl = chunk?.sourceUrl || item.officialSource?.url || 'https://www.gov.ph';

  // 1. INTENT ANALYSIS: VALIDITY / EXPIRATION / DURATION (Checked first if query asks for validity)
  const isValidityQuery =
    normQ.includes('validity') ||
    normQ.includes('expire') ||
    normQ.includes('expiration');

  if (isValidityQuery) {
    if (normQ.includes('barangay') || normQ.includes('clearance') || normQ.includes('indigen') || normQ.includes('residency')) {
      return (
        `The validity period of a **Barangay Clearance** (and Barangay Certificate of Residency / Indigency) is **six (6) months (180 days)** from its date of issuance under DILG standards.\n\n` +
        `**Key Validity & Renewal Details:**\n` +
        `• **Validity Duration:** Exactly 6 months for employment onboarding, local business licensing, and government transactions.\n` +
        `• **Re-issuance / Renewal:** Same-day release at your local Barangay Hall upon presenting 1 valid ID and proof of address.\n` +
        `• **Statutory Fee Waiver:** **100% Free of charge** for all first-time jobseekers presenting a Barangay First-Time Jobseeker Certificate pursuant to Republic Act No. 11261.\n\n` +
        `Official Reference: https://dilg.gov.ph`
      );
    }

    if (normQ.includes('nbi')) {
      return (
        `The validity period of an NBI Clearance in the Philippines is **one (1) year (365 days)** from its date of issuance.\n\n` +
        `**Key Validity & Renewal Details:**\n` +
        `• **Validity Duration:** Exactly 1 year for all employment, visa, and government clearance purposes.\n` +
        `• **Quick Online Renewal:** If your previous NBI Clearance was issued from 2014 onwards, you can avail of the NBI Quick Renewal service via clearance.nbi.gov.ph without re-capturing biometrics.\n` +
        `• **Statutory Fee Waiver:** 100% Free for first-time jobseekers presenting a Barangay First-Time Jobseeker Certificate pursuant to Republic Act No. 11261.\n\n` +
        `Official Portal: https://clearance.nbi.gov.ph`
      );
    }

    if (normQ.includes('philsys') || normQ.includes('national id')) {
      return (
        `The PhilSys National ID (and digital ePhilID) has **lifetime / permanent validity** for Filipino citizens.\n\n` +
        `**Key Validity Details:**\n` +
        `• **Resident Aliens:** Valid for 1 year (renewable annually).\n` +
        `• **Re-issuance:** Free replacement if biometric or demographic updates (e.g. change of civil status or address) are requested.\n\n` +
        `Official Portal: https://philsys.gov.ph`
      );
    }

    if (normQ.includes('birth') || normQ.includes('psa')) {
      return (
        `PSA Birth Certificates have **permanent validity and do not expire** pursuant to Republic Act No. 11909 (Permanent Validity of Birth Certificates Act).\n\n` +
        `All government and private entities are mandated to accept PSA Birth Certificates regardless of the issuance date, provided the security features and text remain clear and legible.\n\n` +
        `Official Reference: https://psa.gov.ph`
      );
    }

    if (normQ.includes('police')) {
      return (
        `A National Police Clearance (NPCS) is valid for **six (6) months** from the date of issuance.\n\n` +
        `You can apply or renew online via pnpclearance.ph and pick up the clearance at any designated police station.\n\n` +
        `Official Portal: https://pnpclearance.ph`
      );
    }

    if (normQ.includes('medical') || normQ.includes('abstract')) {
      return (
        `A Medical Certificate or Clinical Abstract is generally valid for **three (3) months (90 days)** for government medical subsidy claims (such as DSWD AICS and Malasakit Centers).\n\n` +
        `For acute hospitalizations, an updated Clinical Abstract and Itemized Statement of Account (SOA) within 30 days of hospital discharge is recommended.\n\n` +
        `Official Reference: https://doh.gov.ph`
      );
    }
  }

  // 2. INTENT ANALYSIS: BARANGAY CERTIFICATE / INDIGENCY / CLEARANCE (DILG)
  const isBarangayQuery =
    normQ.includes('barangay') ||
    normQ.includes('indigen') ||
    normQ.includes('residency') ||
    normQ.includes('cedula');

  if (isBarangayQuery && (normQ.includes('apply') || normQ.includes('cert') || normQ.includes('clearance') || normQ.includes('indigency') || normQ.includes('residency') || normQ.includes('avail'))) {
    return (
      `**Step-by-Step Guide: How to Avail a Barangay Certificate, Indigency, or Clearance** (DILG / Local Barangay Hall)\n\n` +
      `Barangay Certificates and Indigency Certifications are officially issued by the **Office of the Barangay Secretary and Punong Barangay** at your local Barangay Hall.\n\n` +
      `**Key Types of Barangay Documents:**\n` +
      `• **Barangay Certificate of Residency:** Proof of physical residence for job applications, school enrollment, and bank accounts.\n` +
      `• **Barangay Certificate of Indigency:** 100% free certification for medical subsidy claims (Malasakit Centers/DSWD AICS), public attorney (PAO), and tuition waivers.\n` +
      `• **Barangay Clearance:** For employment onboarding, local business permits, and police clearance prerequisites.\n\n` +
      `**Prerequisites & Required Documents:**\n` +
      `1. One (1) Valid Government Issued Photo ID (PhilSys ID, Voter's ID, School ID, or Driver's License).\n` +
      `2. Proof of Address (Meralco/water utility bill or landlord certification).\n` +
      `3. Community Tax Certificate (Cedula) — obtainable directly at the Barangay / City Treasurer desk.\n\n` +
      `**Step-by-Step Application Procedure:**\n` +
      `1. Step 1 (Barangay Hall Visit): Proceed to your local Barangay Hall / Office of the Barangay Secretary during office hours (8:00 AM - 5:00 PM, Monday to Friday).\n` +
      `2. Step 2 (Fill Request Form): State the purpose of your certification (e.g. Employment, Malasakit Hospital Assistance, DSWD Cash Grant, Scholarship, or PhilSys ID).\n` +
      `3. Step 3 (Residency Verification): Present your ID to the desk officer for quick record verification.\n` +
      `4. Step 4 (Claiming): Receive your signed certificate with the official Barangay dry seal.\n\n` +
      `**Processing Time & Fees:**\n` +
      `• **Fee Waiver (RA 11261):** **100% Free of charge** for all first-time jobseekers and indigent assistance applicants. (Nominal ₱20-₱50 administrative fee for general commercial requests).\n` +
      `• **Processing Time:** **Same-day release (15 to 30 minutes)**.\n\n` +
      `Official Portal: https://dilg.gov.ph`
    );
  }

  // 2.5 INTENT ANALYSIS: PHILHEALTH MRF / PMRF / MEMBER REGISTRATION
  const isPhilHealthMrfQuery =
    normQ.includes('mrf') ||
    normQ.includes('pmrf') ||
    (normQ.includes('philhealth') && (normQ.includes('registration') || normQ.includes('register') || normQ.includes('member data record') || normQ.includes('mdr') || normQ.includes('form')));

  if (isPhilHealthMrfQuery) {
    return (
      `**How to Get Your PhilHealth Member Registration Form (PMRF)**\n\n` +
      `The PMRF is the official form used to register as a new PhilHealth member or update your existing membership details. It is issued and processed by the **Philippine Health Insurance Corporation (PhilHealth)**.\n\n` +
      `**Where to Get the PMRF:**\n` +
      `• **Online:** Register directly through the PhilHealth Member Portal at member.philhealth.gov.ph — no physical PMRF needed for new online registrations.\n` +
      `• **Download:** A fillable PMRF PDF is available at philhealth.gov.ph under Member Registration.\n` +
      `• **Walk-in:** Free copies are available at any PhilHealth Local Health Insurance Office (LHIO) or Malasakit Center desk.\n\n` +
      `**Step-by-Step Procedure:**\n` +
      `1. Step 1 (Choose Channel): Register online via the Member Portal, or get a physical PMRF copy from a PhilHealth LHIO.\n` +
      `2. Step 2 (Fill Out Form): Provide your complete personal details, employment status, and at least one valid government ID.\n` +
      `3. Step 3 (Submit): Submit online, or in person at the nearest PhilHealth office together with a valid ID.\n` +
      `4. Step 4 (Get Your PIN): Receive your PhilHealth Identification Number (PIN) and Member Data Record (MDR), which serves as proof of active membership.\n\n` +
      `**Processing Time & Fees:**\n` +
      `• **Fee:** 100% Free of charge.\n` +
      `• **Turnaround:** Immediate for online registration; same-day for walk-in applications.\n\n` +
      `Official Portal: https://www.philhealth.gov.ph`
    );
  }

  // 3. INTENT ANALYSIS: SENIOR CITIZEN ID / OSCA / RA 9994
  const isSeniorIdQuery =
    normQ.includes('senior') ||
    normQ.includes('osca') ||
    normQ.includes('elderly');

  if (isSeniorIdQuery && (normQ.includes('id') || normQ.includes('apply') || normQ.includes('benefits') || normQ.includes('discount') || normQ.includes('requirements'))) {
    return (
      `**OSCA Senior Citizen ID Registration & Statutory Benefits (Republic Act No. 9994)**\n\n` +
      `The **Senior Citizen ID** is officially issued free of charge by the **Office for Senior Citizens Affairs (OSCA)** in your City or Municipal Hall to all Filipino citizens aged 60 years old and above.\n\n` +
      `Key Statutory Benefits & Privileges (RA 9994 & RA 10645):\n` +
      `• **20% Statutory Discount + 12% VAT Exemption:** On prescription medicines, diagnostic laboratory tests, public land/air/sea transport fares, hotel accommodations, and restaurant dining.\n` +
      `• **Mandatory Free PhilHealth Coverage (RA 10645):** 100% covered inpatient ward confinement and PhilHealth Konsulta consultations with zero required premium payments.\n` +
      `• **Free Maintenance Medicines:** Access to free hypertension, diabetes, and cardiovascular maintenance medicines at local Barangay Health Centers.\n` +
      `• **DSWD Social Pension:** ₱1,000 monthly cash stipend for indigent senior citizens without regular income or institutional pension.\n\n` +
      `Requirements to Get an OSCA Senior Citizen ID:\n` +
      `1. Proof of Age: PSA Birth Certificate, Philippine Passport, or any valid government photo ID showing birth date.\n` +
      `2. Proof of Residency: Barangay Certificate of Residency in your municipality.\n` +
      `3. ID Photos: Two (2) recent 1x1 ID pictures with white background.\n` +
      `4. Application: Duly filled OSCA Registration Form (available at your City/Municipal OSCA desk).\n\n` +
      `Processing Time & Fee:\n` +
      `• Fee: **100% Free of charge**.\n` +
      `• Turnaround: Same-day immediate issuance (15 to 30 minutes at City/Municipal OSCA Hall).\n\n` +
      `Official Portal: https://ncsc.gov.ph`
    );
  }

  // 4. INTENT ANALYSIS: COST / FEES / MAGKANO / LIBRE
  const isCostQuery =
    normQ.includes('how much') ||
    normQ.includes('magkano') ||
    normQ.includes('fee') ||
    normQ.includes('cost') ||
    normQ.includes('price') ||
    normQ.includes('bayad') ||
    normQ.includes('libre') ||
    normQ.includes('free');

  if (isCostQuery) {
    return (
      `Here is the official cost and fee breakdown for ${title} (${agency}):\n\n` +
      `${desc}\n\n` +
      `Financial Details & Statutory Waivers:\n` +
      `• Standard Fee: Official government application forms and public assistance grants are 100% free of processing fees.\n` +
      `• First-Time Jobseekers Waiver (RA 11261): Initial issuances of government clearances (NBI, Police, Barangay, Medical Cert) are 100% Free when presenting a Barangay First-Time Jobseeker Certificate.\n` +
      (benefits.length > 0 ? `• Entitlements / Benefits: ${benefits.slice(0, 3).join('; ')}\n` : '') +
      `\nOfficial Verified Portal: ${sourceUrl}`
    );
  }

  // 5. INTENT ANALYSIS: PROCEDURAL / STEP-BY-STEP / HOW OR WHERE TO GET
  const isProceduralQuery =
    normQ.includes('how to apply') ||
    normQ.includes('how to get') ||
    normQ.includes('where to get') ||
    normQ.includes('where can i get') ||
    normQ.includes('paano kumuha') ||
    normQ.includes('saan kukuha') ||
    normQ.includes('process') ||
    normQ.includes('step') ||
    normQ.includes('procedure');

  if (isProceduralQuery) {
    const reqChecklist = requirements.map((r) => {
      const rName = typeof r === 'string' ? r : r.name;
      const isFound = checkUserDocMatch(rName, userDocs);
      return isFound ? `• ${rName} — ✓ Verified in Vault` : `• ${rName} — ✗ Action Required`;
    });

    let answer = `Step-by-Step Guide for ${title} (${agency}):\n\n${desc}\n\n`;

    if (reqChecklist.length > 0) {
      answer += `Prerequisites & Required Credentials:\n${reqChecklist.join('\n')}\n\n`;
    }

    answer +=
      `Step-by-Step Procedure:\n` +
      `1. Step 1 (Document Preparation): Verify and prepare your required credentials in your Alalay Digital Vault.\n` +
      `2. Step 2 (Submission): Access the official portal at ${sourceUrl} or visit the nearest ${agency} field office.\n` +
      `3. Step 3 (Identity Verification): Present your PhilSys National ID or primary government photo ID.\n` +
      `4. Step 4 (Claiming): Complete the process without paying any unofficial third-party or fixer fees.\n\n` +
      `Official Verified Portal: ${sourceUrl}`;

    return answer;
  }

  // 5. GENERAL / EXPLANATORY INQUIRY (Natural contextual response answering the user's specific topic)
  let generalAnswer = `**${title}** (${agency})\n\n${desc}\n\n`;

  if (benefits.length > 0) {
    generalAnswer += `Key Entitlements & Highlights:\n${benefits.map((b) => `• ${b}`).join('\n')}\n\n`;
  }

  if (requirements.length > 0) {
    generalAnswer += `Required Qualifications & Documents:\n${requirements.map((r) => `• ${typeof r === 'string' ? r : r.name}`).join('\n')}\n\n`;
  }

  generalAnswer += `Official Verified Source: ${sourceUrl}`;
  return generalAnswer;
}

/**
 * Autonomous Grounded Reasoning Engine (Generates dynamic, accurate answers from scraped web data)
 */
export function generateAutonomousGroundedAnswer(cleanQ, options = {}) {
  const { opp, user, opportunities = [], userDocs = [] } = options;
  const firstName = user?.firstName || 'Citizen';

  // 1. If an opportunity was explicitly passed in context, synthesize directly from it
  if (opp) {
    return synthesizeDynamicAnswer(cleanQ, { ...opp, sourceUrl: opp.officialSource?.url, rawItem: opp }, userDocs, user);
  }

  // 2. Dynamically retrieve the highest scoring scraped knowledge chunks across all government agencies
  const chunks = retrieveRelevantKnowledgeChunks(cleanQ, { opportunities, opp, userDocs });

  // 3. If relevant scraped chunks are found, synthesize a custom, tailored response answering the query
  if (chunks.length > 0) {
    const topChunk = chunks[0];
    return synthesizeDynamicAnswer(cleanQ, topChunk, userDocs, user);
  }

  // 4. Default Fallback if no specific chunk matched
  return (
    `ALALAY Autonomous Citizen Navigator & Step-by-Step Guide:\n\n` +
    `Hello ${firstName}! I am your autonomous AI government assistant grounded in official Philippine Citizen's Charters, scraped agency websites, and statutory circulars.\n\n` +
    `You can ask me any specific question about government programs, including:\n` +
    `• Document validity and requirements (NBI Clearance, PhilSys, OSCA Senior ID, Barangay Indigency)\n` +
    `• Loans & Cash Assistance (SSS Salary & Calamity Loans, Pag-IBIG Multi-Purpose Loans, DSWD AICS)\n` +
    `• Healthcare & Hospital Coverage (PhilHealth Konsulta, Malasakit Center Zero-Balance Billing, DOH Medical Aid)\n` +
    `• Education & Student Grants (UniFAST TES, CHED Scholarships, DOLE SPES)\n` +
    `• Employment & Livelihood (PhilJobNet Job Vacancies, DOLE TUPAD)\n\n` +
    `Official Portal: https://www.gov.ph`
  );
}

/**
 * Autonomous Ask Alalay AI Engine with Flash 3.6 & Live Scraped Web Grounding
 */
export async function askAlalayAI(userQuestion, options = {}) {
  const cleanQ = (userQuestion || '').trim().toLowerCase();
  const contextOptions = typeof options === 'string' ? { contextType: options } : options;

  // 1. Build comprehensive dynamic RAG context from all scraped government websites & database
  const ragContext = buildGroundingContext(userQuestion, contextOptions);

  const systemPrompt =
    'You are ALALAY, an autonomous, highly intelligent, and authoritative Philippine Government AI Assistant and Citizen Charter Navigator.\n' +
    'CRITICAL AGENCY INTEGRITY RULES:\n' +
    '- Senior Citizen OSCA ID & 20% + 12% VAT Discounts: Handled by City/Municipal OSCA (Office for Senior Citizens Affairs) and NCSC (ncsc.gov.ph), NOT SSS.\n' +
    '- Mandatory Healthcare & Zero-Balance Billing: Handled by PhilHealth (philhealth.gov.ph) and DOH Malasakit Centers (doh.gov.ph).\n' +
    '- Social Pension for Indigent Seniors: Handled by DSWD (dswd.gov.ph).\n' +
    '- Social Security Salary & Calamity Loans: Handled by SSS (sss.gov.ph).\n' +
    'RESPONSE FORMAT RULE: Whenever the citizen asks how or where to get, apply for, renew, claim, or process ANY government document or benefit ' +
    '(this includes phrasings like "how to get X", "where to get X", "paano kumuha ng X", not only the literal word "procedure"), ' +
    'you MUST include a "Prerequisites & Required Credentials:" section followed by a "Step-by-Step Procedure:" section — these are two SEPARATE ' +
    'sections and must be formatted differently:\n' +
    '  - Prerequisites & Required Credentials: list each item as a BULLET ("• Requirement Name — ✓ Verified in Vault" if it matches an uploaded ' +
    'document in the CITIZEN PROFILE CONTEXT, otherwise "• Requirement Name — ✗ Action Required"). Never number this list.\n' +
    '  - Step-by-Step Procedure: list each action as a NUMBERED step ("1. Step 1 (Title): ...", "2. Step 2 (Title): ..."), covering where to go, ' +
    'what to bring, and how to submit. Never answer with only a one-paragraph agency description.\n' +
    'SCOPE GUARDRAIL (STRICT): You ONLY answer questions about Philippine government services, benefits, documents, and civic processes. ' +
    'If the citizen asks anything unrelated to this scope — math problems, coding/programming requests, general trivia, or any other off-topic request — ' +
    'you MUST politely decline and redirect them to ask about a government service instead. Do not solve, compute, or write code under any circumstance, ' +
    'even if asked directly or asked to "just this once".\n' +
    'MULTI-DIALECT LANGUAGE GUARDRAIL: Detect the language/dialect of the citizen\'s inquiry and reply in that SAME language. Support all major ' +
    'Philippine dialects — Bisaya/Cebuano, Ilocano, Hiligaynon/Ilonggo, Waray-Waray, Bikol, Kapampangan, Pangasinense, Chavacano, and Tagalog/Filipino — ' +
    'in addition to English. Keep proper nouns, statute citations (e.g. "RA 9994"), agency names, and official document names in their original form ' +
    'even when the surrounding sentence is in a dialect. If the inquiry is in a language that is NOT English or a Philippine dialect, reply in English. ' +
    'Never mix dialects within a single response, and never refuse to answer solely because the citizen wrote in a dialect other than English or Filipino.\n\n' +
    getDictionaryContext() +
    ragContext;

  // 2. Check for Gemini API key
  const apiKey = getApiKey();

  // If no API key, use autonomous local grounded reasoning engine
  if (!apiKey) {
    return generateAutonomousGroundedAnswer(cleanQ, contextOptions);
  }

  // Prioritized model sequence: Flash 3.6 as main model
  const models = [
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ];

  await limiter.acquireSlot();

  for (const model of models) {
    try {
      const isApiKey = apiKey.startsWith('AIza');
      const url = isApiKey
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

      const headers = {
        'Content-Type': 'application/json',
      };

      if (!isApiKey) {
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
              parts: [
                {
                  text: `${systemPrompt}\n\nCitizen Inquiry: "${userQuestion}"\n\nInstructions: Answer the inquiry directly and concisely based on the scraped context above. If the citizen is asking how/where to get, apply for, or process something, structure the answer as numbered steps (Step 1, Step 2...) — do not just describe the agency. If the inquiry is unrelated to Philippine government services, decline per the SCOPE GUARDRAIL instead of answering it.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text;

        if (rawText && rawText.trim().length > 15) {
          return cleanMarkdownText(rawText);
        }
      } else {
        const errStatus = response.status;
        if (errStatus === 401) {
          console.warn('[GeminiService] API Key is unauthorized or unsupported token type. Falling back to autonomous grounded engine.');
          break; // Stop attempting other models with the unauthorized key
        }
        if (errStatus === 429) {
          switchKeyToReserveIfAvailable('Rate Limited (429)');
          break;
        }
      }
    } catch (err) {
      // Continue or fallback
    }
  }

  // Fallback to autonomous local grounded reasoning engine
  return generateAutonomousGroundedAnswer(cleanQ, contextOptions);
}
