import { getDictionaryContext, getLabReferenceContext } from './dictionaryService';

let isPrimaryKeyExhausted = false;
let activeKeyType = 'primary';

// 1. Dual-Key Management (Supporting Vite env variables & fallbacks)
export const getPrimaryApiKey = () => {
  return (
    import.meta.env.VITE_GEMINI_API ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
};

export const getReserveApiKey = () => {
  return (
    import.meta.env.VITE_GEMINI_API_RESERVE ||
    import.meta.env.VITE_GEMINI_API_KEY_RESERVE ||
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

// Switch active key to reserve if available (Layer 5: Dual-Key Failover)
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

// Clean markdown formatting & sanitize output (Layer 7: Output Sanitization)
export function cleanMarkdownText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove **bold**
    .replace(/\*(.*?)\*/g, '$1') // remove *italic*
    .replace(/^\s*\*\s+/gm, '• ') // convert * bullets to •
    .trim();
}

// Response cache for instant UI replies without redundant API consumption
const questionCache = new Map();

// Pre-seeded instant answers for suggested questions
export const PRESEEDED_ANSWERS = {
  'why do i still owe ₱12,700?': `You still owe ₱12,700.00 because that is your Net Amount Payable (the final out-of-pocket balance due) after PhilHealth and HMO coverage were subtracted from your total bill.

Here is how your remaining balance was calculated:
• Gross Hospital Charges: ₱45,200.00 (Total cost before any deductions)
• PhilHealth Deduction (CF1): -₱12,500.00
• HMO / Maxicare Deduction: -₱20,000.00

Your combined PhilHealth and HMO deductions total ₱32,500.00, which covered about 72% of your gross charges. Subtracting these coverage amounts from your total bill (₱45,200.00 - ₱32,500.00) leaves the remaining out-of-pocket balance of ₱12,700.00.`,

  'why do i still owe p12,700?': `You still owe ₱12,700.00 because that is your Net Amount Payable (the final out-of-pocket balance due) after PhilHealth and HMO coverage were subtracted from your total bill.

Here is how your remaining balance was calculated:
• Gross Hospital Charges: ₱45,200.00 (Total cost before any deductions)
• PhilHealth Deduction (CF1): -₱12,500.00
• HMO / Maxicare Deduction: -₱20,000.00

Your combined PhilHealth and HMO deductions total ₱32,500.00, which covered about 72% of your gross charges. Subtracting these coverage amounts from your total bill (₱45,200.00 - ₱32,500.00) leaves the remaining out-of-pocket balance of ₱12,700.00.`,

  'what is cf1?': `CF1 (Claim Form 1) refers to your PhilHealth benefit deduction. On this bill, PhilHealth CF1 covers ₱12,500.00 of your total ₱45,200.00 hospital charges.`,

  'what did my hmo cover?': `Your HMO (Maxicare) covered a deduction of ₱20,000.00. Combined with your PhilHealth deduction of ₱12,500.00, your total insurance/HMO coverage came to ₱32,500.00 (72% of your gross bill).`,

  'why is my wbc labeled high?': `Your White Blood Cell (WBC) count is 12.5 x10^9/L, which is labeled HIGH because it is above the standard hospital reference range of 4.5 - 11.0 x10^9/L.

• What WBC does: White blood cells are infection-fighting cells that form an essential part of your immune system.
• What this result means: Your result of 12.5 is slightly elevated compared to standard hospital reference baselines.
• Recommendation: Alalay does not diagnose medical conditions. Please discuss this result with your doctor for clinical correlation.`,

  'why is my wbc high?': `Your White Blood Cell (WBC) count is 12.5 x10^9/L, which is labeled HIGH because it is above the standard hospital reference range of 4.5 - 11.0 x10^9/L.

• What WBC does: White blood cells are infection-fighting cells that form an essential part of your immune system.
• What this result means: Your result of 12.5 is slightly elevated compared to standard hospital reference baselines.
• Recommendation: Alalay does not diagnose medical conditions. Please discuss this result with your doctor for clinical correlation.`,

  'is my hemoglobin in normal range?': `Yes, your Hemoglobin result is 14.2 g/dL, which is within the normal reference range for adult males (13.8 - 17.2 g/dL) and females (12.1 - 15.1 g/dL) in the hospital AI dictionary.

• What Hemoglobin does: It is the iron-rich protein in red blood cells responsible for carrying oxygen from your lungs to the rest of your body.
• Status: 14.2 g/dL is labeled NORMAL based on this laboratory report.`,

  'are my platelets normal?': `Yes, your Platelet count is 245 x10^9/L, which is within the normal reference range of 150 - 400 x10^9/L.

• What Platelets do: Platelets are specialized blood cells that help your blood clot and prevent excessive bleeding from cuts or injuries.
• Status: 245 x10^9/L is labeled NORMAL on your CBC report.`,

  'what do platelets do?': `Platelets (PLT) are blood clotting cells that help stop bleeding by clumping together when blood vessels are damaged.

• Your Result: 245 x10^9/L
• Normal Reference Range: 150 - 400 x10^9/L
• Status: Normal and within standard laboratory reference bounds.`,
};

// Seed initial cache
Object.entries(PRESEEDED_ANSWERS).forEach(([q, a]) => {
  questionCache.set(q.toLowerCase().trim(), a);
});

// Layer 2: Factual Billing Grounding Context (Anti-Hallucination)
const BILL_CONTEXT = `
You are a helpful assistant that answers questions about hospital bills. You have access to the following billing information:

GROSS HOSPITAL CHARGES: ₱45,200.00
- This is the total cost before any deductions

PHILHEALTH DEDUCTION (CF1): -₱12,500.00
- This is the PhilHealth deduction marked as applied on the bill

HMO / MAXICARE: -₱20,000.00
- This is the HMO / Maxicare deduction marked as applied on the bill

NET AMOUNT PAYABLE: ₱12,700.00
- This is the final out-of-pocket balance due

SUMMARY:
- The PhilHealth and HMO deductions total ₱32,500, which covers about 72% of the total hospital bill
- The remaining balance is ₱12,700

INSTRUCTIONS & SAFETY GUARDRAILS:
- Answer questions ONLY using the billing information provided above
- Be concise, clear, and direct
- DO NOT use markdown formatting (NO asterisks **, NO bold **, NO italics *)
- Use plain bullet points "• " instead of asterisks "*"
- If the question cannot be answered from the bill information provided, politely say you cannot answer that confidently from the information shown on this bill and suggest asking the billing office
- Always reference the specific amounts and deductions from the bill
- Use Philippine Peso (₱) currency format
`;

// Layer 3: Clinical Non-Diagnostic Boundary & Reference Grounding Context
const CBC_LAB_CONTEXT = `
You are a helpful, empathetic, and medically grounded assistant for Alalay that explains Complete Blood Count (CBC) lab results.
You have access to the patient's scanned CBC laboratory report with the following values:

PATIENT'S LAB REPORT VALUES:
• WHITE BLOOD CELLS (WBC): 12.5 x10^9/L (Status on report: HIGH)
  - Result: 12.5 x10^9/L
  - Baseline Normal Range: 4.5 - 11.0 x10^9/L
  - Note: 12.5 is above the hospital-provided reference range shown for this report.

• HEMOGLOBIN (HGB): 14.2 g/dL (Status on report: NORMAL)
  - Result: 14.2 g/dL
  - Baseline Normal Range: 13.8 - 17.2 g/dL (Male) / 12.1 - 15.1 g/dL (Female)
  - Note: 14.2 falls within the hospital-provided reference range shown for this report.

• PLATELETS (PLT): 245 x10^9/L (Status on report: NORMAL)
  - Result: 245 x10^9/L
  - Baseline Normal Range: 150 - 400 x10^9/L
  - Note: 245 falls within the hospital-provided reference range shown for this report.

STRICT MEDICAL SAFETY GUARDRAILS:
1. You are NOT a medical doctor. NEVER diagnose a medical condition, disease, or infection.
2. NEVER prescribe medication, treatments, or dosages.
3. NEVER tell a patient they definitely have an illness (e.g. DO NOT say "you have an infection"). Instead, explain that high WBC is labeled HIGH based on the hospital reference range and should be discussed with a physician.
4. Always explain what each blood component does in plain, empathetic layman terms.
5. NO asterisks (**) or markdown formatting. Use clean bullet points (• ).
6. Always include a brief reminder at the end that this is an informational summary and to consult their doctor.
`;

// Layer 6: Sliding Window Rate Limiter & Throttling
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

      // Clean requests older than 1 minute
      this.requestTimestamps = this.requestTimestamps.filter((t) => now - t < 60000);

      // Check RPM limit
      if (this.requestTimestamps.length >= this.maxPerMinute) {
        const oldest = this.requestTimestamps[0];
        const waitTime = 60000 - (now - oldest) + 200;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      // Check min delay between requests
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

function isQuotaOrAuthError(errorMsg) {
  if (!errorMsg) return false;
  const msg = errorMsg.toLowerCase();
  return (
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('resource_exhausted') ||
    msg.includes('api_key_invalid')
  );
}

/**
 * Ask Alalay AI with Full 8-Layer Guardrails Protection
 */
export async function askAlalayAI(userQuestion, contextType = 'general') {
  const cleanQ = userQuestion.trim().toLowerCase();

  // 1. Instant Cache Check
  if (questionCache.has(cleanQ)) {
    return questionCache.get(cleanQ);
  }

  // 2. Select Grounded Context (Anti-Hallucination)
  let systemPrompt = '';
  if (contextType === 'bill' || cleanQ.includes('bill') || cleanQ.includes('cost') || cleanQ.includes('owe')) {
    systemPrompt = BILL_CONTEXT;
  } else if (contextType === 'lab' || cleanQ.includes('wbc') || cleanQ.includes('blood') || cleanQ.includes('cbc')) {
    systemPrompt = CBC_LAB_CONTEXT + getLabReferenceContext();
  } else {
    systemPrompt =
      'You are ALALAY, an empathetic AI government and healthcare assistance navigator in the Philippines. ' +
      'Answer clearly in plain language without markdown symbols (**). Ground your responses in official citizen charters.' +
      getDictionaryContext();
  }

  // 3. Check for Gemini API key
  const apiKey = getApiKey();
  if (!apiKey) {
    return (
      PRESEEDED_ANSWERS[cleanQ] ||
      `ALALAY is operating in grounded deterministic mode. Your query "${userQuestion}" is recorded. For medical or hospital bill guidance, please consult with your healthcare provider or hospital Malasakit Center desk.`
    );
  }

  // 4. Rate-Limiter slot acquisition
  await limiter.acquireSlot();

  // 5. Call Google Gemini API (gemini-2.5-flash / gemini-1.5-flash)
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-pro'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${getApiKey()}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Question: ${userQuestion}\n\nRemember: No asterisks or bold formatting. Use clean bullet points (•) and Philippine Peso (₱).`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2, // Low temperature for deterministic anti-hallucination outputs
            maxOutputTokens: 800,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (isQuotaOrAuthError(errorText)) {
          switchKeyToReserveIfAvailable(`HTTP ${response.status} on ${model}`);
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const sanitizedOutput = cleanMarkdownText(rawText);

      if (sanitizedOutput) {
        questionCache.set(cleanQ, sanitizedOutput);
        return sanitizedOutput;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[GeminiService] Model ${model} call failed:`, err.message);
    }
  }

  // Fallback if API was unavailable
  return (
    PRESEEDED_ANSWERS[cleanQ] ||
    `Thank you for asking about "${userQuestion}". Alalay provides grounded assistance based on verified Citizen's Charters. For personalized evaluation, please check the Opportunities tab or visit the nearest Malasakit Center desk.`
  );
}
