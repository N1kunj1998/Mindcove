import type { VercelRequest, VercelResponse } from '@vercel/node';

// Server-side logging utility
const serverLog = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] [API] ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] [API] ${message}`, data || '');
  },
  error: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [API] ${message}`, data || '');
  },
  debug: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] [DEBUG] [API] ${message}`, data || '');
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  serverLog.info(`Optimization request received [${requestId}]`, {
    method: req.method,
    url: req.url,
  });

  if (req.method !== 'POST') {
    serverLog.warn(`Invalid method [${requestId}]`, { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64, filename, extractedText, analysis } = req.body;

    serverLog.info(`Request body parsed [${requestId}]`, {
      filename: filename || 'unknown',
      hasBase64: !!base64,
      hasExtractedText: !!extractedText,
      hasAnalysis: !!analysis,
      issuesCount: analysis?.issues?.length || 0,
    });

    // Validation: Check for required data
    if (!base64 && !extractedText) {
      serverLog.warn(`No resume data provided [${requestId}]`);
      return res.status(400).json({ error: 'No resume data provided' });
    }

    // Validation: Check extracted text is valid
    if (extractedText && (typeof extractedText !== 'string' || extractedText.trim().length < 50)) {
      serverLog.warn(`Invalid extracted text [${requestId}]`, {
        type: typeof extractedText,
        length: extractedText?.length || 0,
      });
      return res.status(400).json({ error: 'Invalid resume text. Please ensure your resume was uploaded correctly.' });
    }

    // Validation: Check for prompt text contamination
    if (extractedText && (
      extractedText.toLowerCase().includes('critical instructions') ||
      extractedText.toLowerCase().includes('you are an expert') ||
      extractedText.toLowerCase().includes('return only valid json')
    )) {
      serverLog.error(`Prompt text detected in resume [${requestId}]`);
      return res.status(400).json({ error: 'Invalid resume content detected. Please upload a valid resume.' });
    }

    // Validation: Check analysis data
    if (analysis && (!analysis.score || typeof analysis.score !== 'number' || analysis.score < 0 || analysis.score > 100)) {
      serverLog.warn(`Invalid analysis score [${requestId}]`, { score: analysis?.score });
      // Continue with default score instead of failing
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      serverLog.error(`OpenAI API key not configured [${requestId}]`);
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in your environment variables'
      });
    }

    serverLog.info(`Starting resume optimization [${requestId}]`, {
      originalScore: analysis?.score || 0,
      issuesCount: analysis?.issues?.length || 0,
    });

    // Optimize resume using OpenAI
    const optimizedResume = await optimizeResumeWithOpenAI(
      extractedText || "",
      analysis,
      OPENAI_API_KEY,
      requestId
    );

    const duration = Date.now() - startTime;
    serverLog.info(`Optimization completed successfully [${requestId}]`, {
      duration: `${duration}ms`,
      newScore: optimizedResume.newScore || 0,
      contentLength: optimizedResume.content.length,
    });

    // Final validation: Ensure optimized resume is valid
    if (!optimizedResume.content || optimizedResume.content.trim().length < 50) {
      serverLog.error(`Optimization produced invalid output [${requestId}]`, {
        contentLength: optimizedResume.content?.length || 0,
      });
      return res.status(500).json({ 
        error: 'Optimization failed',
        message: 'The optimization produced invalid results. Please try again.'
      });
    }

    // Final validation: Check for prompt text in output
    if (optimizedResume.content.toLowerCase().includes('critical instructions') ||
        optimizedResume.content.toLowerCase().includes('you are an expert')) {
      serverLog.error(`Prompt text detected in optimized output [${requestId}]`);
      return res.status(500).json({ 
        error: 'Optimization failed',
        message: 'Invalid output detected. Please try optimizing again.'
      });
    }

    // Final validation: Content similarity check
    const finalSimilarity = calculateContentSimilarity(extractedText || '', optimizedResume.content);
    if (finalSimilarity < 0.80 && (extractedText || '').length > 100) {
      serverLog.warn(`Final optimization has low similarity [${requestId}]`, {
        similarity: finalSimilarity,
        originalLength: (extractedText || '').length,
        optimizedLength: optimizedResume.content.length,
      });
      // Continue but log warning - user can review in preview
    }

    return res.status(200).json({
      success: true,
      optimizedResume: optimizedResume.content,
      newScore: optimizedResume.newScore || analysis?.score || 0,
      improvements: optimizedResume.improvements || [],
      originalScore: analysis?.score || 0,
      similarity: finalSimilarity,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    serverLog.error(`Optimization failed [${requestId}]`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    });
    
    return res.status(500).json({ 
      error: 'Optimization failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Rule-based formatting fixes (preserves all content)
function applyFormattingFixes(resumeText: string, analysis: any): { optimized: string; improvements: string[]; changes: any[] } {
  if (!resumeText || typeof resumeText !== 'string') {
    serverLog.warn('Invalid resume text provided to applyFormattingFixes');
    return { optimized: resumeText || '', improvements: [], changes: [] };
  }

  let optimized = resumeText;
  const improvements: string[] = [];
  const changes: Array<{ type: string; description: string; before?: string; after?: string }> = [];
  const originalLength = resumeText.length;

  // Fix 1: Normalize line breaks (remove excessive blank lines, but keep structure)
  const beforeLineBreaks = optimized;
  optimized = optimized.replace(/\n{4,}/g, '\n\n\n');
  if (optimized !== beforeLineBreaks) {
    improvements.push("Normalized excessive blank lines");
    changes.push({ type: 'formatting', description: 'Removed excessive blank lines' });
  }

  // Fix 2: Ensure consistent spacing around section headers
  const commonHeaders = [
    'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE',
    'EDUCATION', 'ACADEMIC BACKGROUND',
    'SKILLS', 'TECHNICAL SKILLS', 'CORE SKILLS',
    'SUMMARY', 'PROFESSIONAL SUMMARY', 'EXECUTIVE SUMMARY',
    'OBJECTIVE', 'CAREER OBJECTIVE',
    'PROJECTS', 'PROJECT EXPERIENCE',
    'CERTIFICATIONS', 'CERTIFICATES', 'LICENSES',
    'AWARDS', 'ACHIEVEMENTS', 'HONORS',
    'LANGUAGES', 'LANGUAGE SKILLS'
  ];

  commonHeaders.forEach(header => {
    // Match header with various formats (with/without dashes, different cases, etc.)
    const patterns = [
      new RegExp(`\\s*${header}\\s*`, 'gi'),
      new RegExp(`\\s*${header.replace(/\s+/g, '[\\s-]+')}\\s*`, 'gi'),
      new RegExp(`^\\s*${header}\\s*$`, 'gmi'),
    ];

    patterns.forEach((regex, idx) => {
      if (regex.test(optimized)) {
        // Check if header is already properly formatted
        const properFormat = `\n\n${header.toUpperCase()}\n`;
        if (!optimized.includes(properFormat)) {
          optimized = optimized.replace(regex, properFormat);
          if (!improvements.includes(`Standardized ${header} section header`)) {
            improvements.push(`Standardized ${header} section header`);
            changes.push({
              type: 'formatting',
              description: `Standardized ${header} section header`,
              before: optimized.match(regex)?.[0] || '',
              after: properFormat.trim()
            });
          }
        }
      }
    });
  });

  // Fix 3: Fix inconsistent date formats (but preserve original dates)
  const beforeDates = optimized;
  optimized = optimized.replace(/(\d{4})\s*[-–—]\s*(\d{4}|\w+)/g, '$1 - $2');
  optimized = optimized.replace(/(\w+)\s+(\d{4})\s*[-–—]\s*(\w+|\d{4})/gi, (match) => {
    // Format: "Month YYYY - Month YYYY" or "Month YYYY - Present"
    return match.replace(/\s*[-–—]\s*/g, ' - ');
  });
  if (optimized !== beforeDates) {
    improvements.push("Standardized date formats");
    changes.push({ type: 'formatting', description: 'Standardized date separators' });
  }
  
  // Fix 4: Remove trailing spaces and normalize whitespace
  const beforeTrim = optimized;
  optimized = optimized.split('\n').map(line => line.trimEnd()).join('\n');
  // Normalize multiple spaces to single space (but preserve intentional spacing)
  optimized = optimized.replace(/[ \t]+/g, ' ');
  if (optimized !== beforeTrim) {
    improvements.push("Removed trailing spaces");
    changes.push({ type: 'formatting', description: 'Removed trailing whitespace' });
  }
  
  // Fix 5: Ensure contact info formatting (but don't change content)
  const beforeContact = optimized;
  optimized = optimized.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match) => {
    return match.trim();
  });
  // Format phone numbers consistently
  optimized = optimized.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, (match) => {
    return match.trim();
  });
  if (optimized !== beforeContact) {
    improvements.push("Normalized contact information formatting");
    changes.push({ type: 'formatting', description: 'Normalized contact info spacing' });
  }

  // Fix 6: Ensure consistent capitalization in section headers (already handled above, but add check)
  // Fix 7: Ensure bullet points are consistent
  const beforeBullets = optimized;
  optimized = optimized.replace(/^[\s]*[•·▪▫-]\s+/gm, '• ');
  if (optimized !== beforeBullets) {
    improvements.push("Standardized bullet points");
    changes.push({ type: 'formatting', description: 'Standardized bullet point characters' });
  }

  // Fix 8: Ensure proper spacing after periods (but don't change content)
  optimized = optimized.replace(/\.([A-Z])/g, '. $1');

  // Validation: Ensure output is valid
  if (!optimized || optimized.trim().length < 10) {
    serverLog.error('Formatting fixes resulted in invalid output', {
      originalLength,
      optimizedLength: optimized.length,
    });
    return { optimized: resumeText, improvements: ['Formatting fixes skipped due to validation error'], changes: [] };
  }

  // Validation: Content similarity check
  const contentSimilarity = calculateContentSimilarity(resumeText, optimized);
  if (contentSimilarity < 0.95) {
    serverLog.warn('Formatting fixes may have changed content significantly', {
      similarity: contentSimilarity,
      originalLength,
      optimizedLength: optimized.length,
    });
  }

  serverLog.info('Formatting fixes applied', {
    improvementsCount: improvements.length,
    changesCount: changes.length,
    originalLength,
    optimizedLength: optimized.length,
    similarity: contentSimilarity,
  });

  return { optimized, improvements, changes };
}

// Calculate content similarity (0-1) between original and optimized text
function calculateContentSimilarity(original: string, optimized: string): number {
  if (!original || !optimized) return 0;
  if (original === optimized) return 1;

  // Word-based similarity
  const originalWords = new Set(original.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const optimizedWords = new Set(optimized.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  const intersection = new Set([...originalWords].filter(w => optimizedWords.has(w)));
  const union = new Set([...originalWords, ...optimizedWords]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Extract keyword suggestions from analysis issues
function extractKeywordSuggestions(analysis: any, resumeText: string, requestId: string): {
  suggestions: string[];
  insertionPoints: Array<{ section: string; keywords: string[] }>;
} {
  serverLog.info(`Extracting keyword suggestions [${requestId}]`);

  const suggestions: string[] = [];
  const insertionPoints: Array<{ section: string; keywords: string[] }> = [];

  if (!analysis || !analysis.issues) {
    return { suggestions: [], insertionPoints: [] };
  }

  // Extract keyword-related issues
  const keywordIssues = analysis.issues.filter((issue: any) => 
    issue.category?.toLowerCase().includes('keyword') ||
    issue.title?.toLowerCase().includes('keyword') ||
    (issue.priority === 'high' && issue.suggestion && issue.suggestion.toLowerCase().includes('keyword'))
  );

  // Extract keywords from suggestions
  keywordIssues.forEach((issue: any) => {
    if (issue.suggestion) {
      // Extract keywords from suggestion text
      const keywordMatches = issue.suggestion.match(/(?:add|include|use|consider)[\s]+(?:keywords?[\s]+)?(?:like[\s]+)?["']?([^"',.]+)["']?/gi);
      if (keywordMatches) {
        keywordMatches.forEach((match: string) => {
          const keyword = match.replace(/(?:add|include|use|consider)[\s]+(?:keywords?[\s]+)?(?:like[\s]+)?["']?/gi, '').trim();
          if (keyword && keyword.length > 2 && !suggestions.includes(keyword)) {
            suggestions.push(keyword);
          }
        });
      } else {
        // If no pattern match, try to extract the suggestion itself
        const cleanSuggestion = issue.suggestion.replace(/^(?:add|include|use|consider)[\s]+(?:keywords?[\s]+)?(?:like[\s]+)?/gi, '').trim();
        if (cleanSuggestion && cleanSuggestion.length < 50 && !suggestions.includes(cleanSuggestion)) {
          suggestions.push(cleanSuggestion);
        }
      }
    }
  });

  // Identify insertion points by section
  const sections = ['skills', 'experience', 'summary', 'education'];
  sections.forEach(section => {
    const sectionKeywords = suggestions.filter(kw => {
      // Simple heuristic: if resume mentions the section, these keywords might fit there
      return resumeText.toLowerCase().includes(section);
    });
    if (sectionKeywords.length > 0) {
      insertionPoints.push({
        section: section.charAt(0).toUpperCase() + section.slice(1),
        keywords: sectionKeywords.slice(0, 5), // Limit to 5 per section
      });
    }
  });

  serverLog.info(`Keyword extraction completed [${requestId}]`, {
    suggestionsCount: suggestions.length,
    insertionPointsCount: insertionPoints.length,
  });

  return { suggestions: suggestions.slice(0, 20), insertionPoints }; // Limit to 20 total suggestions
}

// Apply keyword optimization using AI (additions only, no replacements)
async function applyKeywordOptimization(
  resumeText: string,
  keywordAnalysis: { suggestions: string[]; insertionPoints: Array<{ section: string; keywords: string[] }> },
  apiKey: string,
  requestId: string
): Promise<{ optimized: string; improvements: string[]; changes: any[] }> {
  serverLog.info(`Starting keyword optimization [${requestId}]`, {
    keywordCount: keywordAnalysis.suggestions.length,
  });

  if (keywordAnalysis.suggestions.length === 0) {
    return { optimized: resumeText, improvements: [], changes: [] };
  }

  const keywordsList = keywordAnalysis.suggestions.slice(0, 10).join(', '); // Limit to 10 for prompt
  const insertionPointsText = keywordAnalysis.insertionPoints.map(ip => 
    `${ip.section}: ${ip.keywords.join(', ')}`
  ).join('\n');

  const prompt = `You are a resume keyword optimizer. Your ONLY job is to ADD keywords naturally to the resume. DO NOT replace or remove any existing text.

CRITICAL RULES:
1. ADD keywords only - never replace existing words
2. DO NOT change any existing content
3. DO NOT remove any information
4. Add keywords naturally where they fit contextually
5. Preserve ALL original text exactly

ORIGINAL RESUME (preserve ALL content, only ADD keywords):
${resumeText.substring(0, 5000)}${resumeText.length > 5000 ? '\n\n[... resume continues ...]' : ''}

KEYWORDS TO ADD (add these naturally, don't force them):
${keywordsList}

SUGGESTED INSERTION POINTS:
${insertionPointsText || 'Add keywords naturally in relevant sections'}

TASK: Return the resume with keywords added naturally. Only ADD keywords, never replace or remove text.

Return ONLY the resume text with keywords added, no explanations, no JSON, no markdown.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a resume keyword optimizer. You ONLY add keywords. You NEVER replace words, remove text, or change content. Always preserve all original text exactly and only add keywords naturally.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2, // Low temperature for consistent additions
        max_tokens: Math.min(4000, resumeText.length + 500), // Allow some room for additions
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      serverLog.warn(`Keyword optimization failed [${requestId}]`, {
        status: response.status,
        error: error.substring(0, 200),
      });
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    const data = await response.json();
    const keywordOptimized = data.choices[0]?.message?.content?.trim() || '';

    if (!keywordOptimized || keywordOptimized.length < 50) {
      serverLog.warn(`AI returned invalid keyword optimization [${requestId}]`);
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    // Validation: Check content similarity (should be >90% - keywords add content)
    const similarity = calculateContentSimilarity(resumeText, keywordOptimized);
    if (similarity < 0.85) {
      serverLog.warn(`Keyword optimization changed content too much [${requestId}]`, {
        similarity,
        originalLength: resumeText.length,
        optimizedLength: keywordOptimized.length,
      });
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    // Check if it's prompt text
    const isPromptText = keywordOptimized.toLowerCase().includes('critical instructions') ||
                        keywordOptimized.toLowerCase().includes('you are an expert');
    if (isPromptText) {
      serverLog.warn(`AI returned prompt text instead of optimized resume [${requestId}]`);
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    // Check that original content is still present
    const originalWords = resumeText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const optimizedWords = keywordOptimized.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const preservedWords = originalWords.filter(w => optimizedWords.includes(w));
    const preservationRate = originalWords.length > 0 ? preservedWords.length / originalWords.length : 0;

    if (preservationRate < 0.90) {
      serverLog.warn(`Keyword optimization removed too much original content [${requestId}]`, {
        preservationRate,
      });
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    serverLog.info(`Keyword optimization completed successfully [${requestId}]`, {
      similarity,
      preservationRate,
      originalLength: resumeText.length,
      optimizedLength: keywordOptimized.length,
      keywordsAdded: keywordOptimized.length - resumeText.length,
    });

    return {
      optimized: keywordOptimized,
      improvements: [`Added ${keywordAnalysis.suggestions.length} ATS-friendly keywords`],
      changes: [{ type: 'keyword_addition', description: `Added keywords: ${keywordsList}` }],
    };

  } catch (error) {
    serverLog.error(`Keyword optimization error [${requestId}]`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return { optimized: resumeText, improvements: [], changes: [] };
  }
}

// Enhance action verbs (replace weak verbs with strong ATS-friendly verbs)
async function enhanceActionVerbs(
  resumeText: string,
  analysis: any,
  apiKey: string,
  requestId: string
): Promise<{ optimized: string; improvements: string[]; changes: any[] }> {
  serverLog.info(`Starting action verb enhancement [${requestId}]`);

  // Weak verbs to replace
  const weakVerbs = ['did', 'made', 'worked', 'helped', 'got', 'was', 'were', 'had', 'used'];
  const hasWeakVerbs = weakVerbs.some(verb => 
    new RegExp(`\\b${verb}\\b`, 'gi').test(resumeText)
  );

  if (!hasWeakVerbs) {
    serverLog.info(`No weak verbs found, skipping enhancement [${requestId}]`);
    return { optimized: resumeText, improvements: [], changes: [] };
  }

  const prompt = `You are a resume action verb optimizer. Your ONLY job is to replace weak action verbs with stronger, ATS-friendly verbs. DO NOT change any other content.

CRITICAL RULES:
1. ONLY replace weak action verbs (did, made, worked, helped, got, was, were, had, used)
2. Replace with stronger verbs (managed, developed, implemented, led, created, achieved, etc.)
3. DO NOT change any other words or content
4. DO NOT add new information
5. DO NOT remove any information
6. Preserve ALL original text exactly, except for verb replacements

WEAK VERBS TO REPLACE:
- did → managed, executed, performed
- made → created, developed, produced
- worked → collaborated, operated, functioned
- helped → supported, assisted, facilitated
- got → achieved, obtained, acquired
- was/were → served as, acted as, functioned as
- had → maintained, possessed, managed
- used → utilized, implemented, applied

ORIGINAL RESUME (only replace weak verbs, preserve everything else):
${resumeText.substring(0, 5000)}${resumeText.length > 5000 ? '\n\n[... resume continues ...]' : ''}

TASK: Return the resume with weak verbs replaced by stronger verbs. Only replace verbs, never change other content.

Return ONLY the resume text with verb replacements, no explanations, no JSON, no markdown.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a resume action verb optimizer. You ONLY replace weak action verbs with stronger verbs. You NEVER change other words, add information, or remove information. Always preserve all original content exactly except for verb replacements.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // Very low temperature for consistent verb replacements
        max_tokens: Math.min(4000, resumeText.length + 200), // Minimal token increase
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      serverLog.warn(`Verb enhancement failed [${requestId}]`, {
        status: response.status,
        error: error.substring(0, 200),
      });
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    const data = await response.json();
    const verbEnhanced = data.choices[0]?.message?.content?.trim() || '';

    if (!verbEnhanced || verbEnhanced.length < 50) {
      serverLog.warn(`AI returned invalid verb enhancement [${requestId}]`);
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    // Validation: Check content similarity (should be >92% - only verbs changed)
    const similarity = calculateContentSimilarity(resumeText, verbEnhanced);
    if (similarity < 0.92) {
      serverLog.warn(`Verb enhancement changed content too much [${requestId}]`, {
        similarity,
        originalLength: resumeText.length,
        enhancedLength: verbEnhanced.length,
      });
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    // Check if it's prompt text
    const isPromptText = verbEnhanced.toLowerCase().includes('critical instructions') ||
                        verbEnhanced.toLowerCase().includes('you are an expert');
    if (isPromptText) {
      serverLog.warn(`AI returned prompt text instead of enhanced resume [${requestId}]`);
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    // Count verb replacements made
    const verbReplacements = countVerbReplacements(resumeText, verbEnhanced);

    serverLog.info(`Verb enhancement completed successfully [${requestId}]`, {
      similarity,
      originalLength: resumeText.length,
      enhancedLength: verbEnhanced.length,
      verbReplacements,
    });

    return {
      optimized: verbEnhanced,
      improvements: verbReplacements > 0 ? [`Enhanced ${verbReplacements} action verb${verbReplacements > 1 ? 's' : ''}`] : [],
      changes: verbReplacements > 0 ? [{ type: 'verb_enhancement', description: `Replaced ${verbReplacements} weak action verbs` }] : [],
    };

  } catch (error) {
    serverLog.error(`Verb enhancement error [${requestId}]`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return { optimized: resumeText, improvements: [], changes: [] };
  }
}

// Count verb replacements between original and enhanced text
function countVerbReplacements(original: string, enhanced: string): number {
  const weakVerbs = ['did', 'made', 'worked', 'helped', 'got', 'was', 'were', 'had', 'used'];
  let replacements = 0;

  weakVerbs.forEach(verb => {
    const originalMatches = (original.match(new RegExp(`\\b${verb}\\b`, 'gi')) || []).length;
    const enhancedMatches = (enhanced.match(new RegExp(`\\b${verb}\\b`, 'gi')) || []).length;
    if (originalMatches > enhancedMatches) {
      replacements += originalMatches - enhancedMatches;
    }
  });

  return replacements;
}

// Suggest quantifiable achievements (suggestions only, no fabrication)
function suggestQuantifiableAchievements(
  resumeText: string,
  analysis: any,
  requestId: string
): string[] {
  serverLog.info(`Analyzing for quantifiable achievements [${requestId}]`);

  const suggestions: string[] = [];

  // Check if resume already has quantifiable achievements
  const hasNumbers = /\d+/.test(resumeText);
  const hasPercentages = /%\s*/.test(resumeText);
  const hasMetrics = /(increased|decreased|improved|reduced|saved|managed|led|grew|achieved).*\d+/gi.test(resumeText);

  // Extract achievement-related issues from analysis
  const achievementIssues = analysis?.issues?.filter((issue: any) => 
    issue.category?.toLowerCase().includes('achievement') ||
    issue.title?.toLowerCase().includes('quantifiable') ||
    issue.title?.toLowerCase().includes('metric') ||
    issue.suggestion?.toLowerCase().includes('number') ||
    issue.suggestion?.toLowerCase().includes('percentage')
  ) || [];

  if (achievementIssues.length > 0) {
    achievementIssues.forEach((issue: any) => {
      if (issue.suggestion && !suggestions.includes(issue.suggestion)) {
        suggestions.push(issue.suggestion);
      }
    });
  }

  // If no quantifiable achievements found, suggest adding them
  if (!hasNumbers && !hasPercentages && !hasMetrics) {
    suggestions.push('Consider adding quantifiable metrics (numbers, percentages, dollar amounts) to your achievements');
  }

  // Suggest specific improvements
  if (!hasPercentages) {
    suggestions.push('Consider adding percentage improvements (e.g., "increased sales by 25%")');
  }
  if (!hasNumbers && resumeText.toLowerCase().includes('team')) {
    suggestions.push('Consider adding team size (e.g., "managed a team of 5 people")');
  }
  if (!hasNumbers && resumeText.toLowerCase().includes('budget')) {
    suggestions.push('Consider adding budget amounts (e.g., "managed $500K budget")');
  }

  serverLog.info(`Achievement suggestions generated [${requestId}]`, {
    suggestionsCount: suggestions.length,
  });

  return suggestions.slice(0, 5); // Limit to 5 suggestions
}

// AI-powered formatting fixes (preserves ALL content, only fixes formatting)
async function applyAIFormattingFixes(
  resumeText: string,
  analysis: any,
  apiKey: string,
  requestId: string
): Promise<{ optimized: string; improvements: string[]; changes: any[] }> {
  serverLog.info(`Starting AI formatting fixes [${requestId}]`, {
    resumeTextLength: resumeText.length,
  });

  // Extract formatting issues from analysis
  const formattingIssues = analysis?.issues?.filter((issue: any) => 
    issue.category?.toLowerCase().includes('format') ||
    issue.category?.toLowerCase().includes('structure') ||
    issue.type === 'error'
  ) || [];

  if (formattingIssues.length === 0) {
    serverLog.info(`No formatting issues found, skipping AI formatting [${requestId}]`);
    return { optimized: resumeText, improvements: [], changes: [] };
  }

  const issuesList = formattingIssues.map((issue: any) => 
    `- ${issue.title}: ${issue.suggestion || issue.description}`
  ).join('\n');

  const prompt = `You are a resume formatting expert. Your ONLY job is to fix formatting issues while preserving ALL content exactly.

CRITICAL RULES:
1. DO NOT change any words, sentences, or content
2. DO NOT add new information
3. DO NOT remove any information
4. ONLY fix formatting: spacing, headers, dates, capitalization, structure
5. Preserve ALL original text exactly as written

ORIGINAL RESUME (preserve ALL content):
${resumeText.substring(0, 6000)}${resumeText.length > 6000 ? '\n\n[... resume continues ...]' : ''}

FORMATTING ISSUES TO FIX:
${issuesList}

TASK: Return ONLY the formatted resume text. Make it ATS-friendly by:
- Standardizing section headers (EXPERIENCE, EDUCATION, etc.)
- Fixing inconsistent spacing
- Standardizing date formats
- Fixing capitalization in headers
- Improving structure for ATS parsing

Return ONLY the formatted text, no explanations, no JSON, no markdown. Just the resume text with formatting fixes.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a resume formatting expert. You ONLY fix formatting. You NEVER change content, add information, or remove information. Always preserve all original text exactly.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for consistent formatting
        max_tokens: Math.min(4000, resumeText.length + 1000),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      serverLog.warn(`AI formatting failed [${requestId}]`, {
        status: response.status,
        error: error.substring(0, 200),
      });
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    const data = await response.json();
    const aiFormatted = data.choices[0]?.message?.content?.trim() || '';

    if (!aiFormatted || aiFormatted.length < 50) {
      serverLog.warn(`AI returned invalid formatting [${requestId}]`);
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    // Validation: Check content similarity (should be >95%)
    const similarity = calculateContentSimilarity(resumeText, aiFormatted);
    if (similarity < 0.95) {
      serverLog.warn(`AI formatting changed content too much [${requestId}]`, {
        similarity,
        originalLength: resumeText.length,
        formattedLength: aiFormatted.length,
      });
      // Return original if similarity is too low
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    // Check if it's prompt text
    const isPromptText = aiFormatted.toLowerCase().includes('critical instructions') ||
                        aiFormatted.toLowerCase().includes('you are an expert');
    if (isPromptText) {
      serverLog.warn(`AI returned prompt text instead of formatted resume [${requestId}]`);
      return { optimized: resumeText, improvements: [], changes: [] };
    }

    serverLog.info(`AI formatting completed successfully [${requestId}]`, {
      similarity,
      originalLength: resumeText.length,
      formattedLength: aiFormatted.length,
    });

    return {
      optimized: aiFormatted,
      improvements: ['AI-enhanced formatting applied'],
      changes: [{ type: 'ai_formatting', description: 'Applied AI formatting fixes' }],
    };

  } catch (error) {
    serverLog.error(`AI formatting error [${requestId}]`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return { optimized: resumeText, improvements: [], changes: [] };
  }
}

async function optimizeResumeWithOpenAI(
  resumeText: string,
  analysis: any,
  apiKey: string,
  requestId: string
) {
  serverLog.info(`Preparing resume optimization [${requestId}]`, {
    resumeTextLength: resumeText.length,
    issuesCount: analysis?.issues?.length || 0,
  });

  // Step 1: Apply rule-based formatting fixes
  const formattingFixes = applyFormattingFixes(resumeText, analysis);
  let optimizedText = formattingFixes.optimized;
  const improvements = [...formattingFixes.improvements];
  const allChanges = [...(formattingFixes.changes || [])];
  
  // Log all changes made for transparency
  if (formattingFixes.changes && formattingFixes.changes.length > 0) {
    serverLog.info(`Formatting changes made [${requestId}]`, {
      changes: formattingFixes.changes,
    });
  }

  // Step 2: Apply AI formatting fixes (if there are formatting issues)
  const formattingIssues = analysis?.issues?.filter((issue: any) => 
    issue.category?.toLowerCase().includes('format') ||
    issue.category?.toLowerCase().includes('structure')
  ) || [];

  if (formattingIssues.length > 0 && optimizedText.length > 100) {
    serverLog.info(`Applying AI formatting fixes [${requestId}]`);
    const aiFormatting = await applyAIFormattingFixes(optimizedText, analysis, apiKey, requestId);
    
    if (aiFormatting.optimized && aiFormatting.optimized !== optimizedText) {
      // Validate AI formatting didn't break anything
      const similarity = calculateContentSimilarity(optimizedText, aiFormatting.optimized);
      if (similarity >= 0.95) {
        optimizedText = aiFormatting.optimized;
        improvements.push(...aiFormatting.improvements);
        allChanges.push(...(aiFormatting.changes || []));
      } else {
        serverLog.warn(`AI formatting rejected due to low similarity [${requestId}]`, { similarity });
      }
    }
  }

  // Phase 3: Keyword Analysis and Extraction
  const keywordAnalysis = extractKeywordSuggestions(analysis, optimizedText, requestId);
  
  // Add keyword suggestions to improvements
  keywordAnalysis.suggestions.forEach((suggestion: string) => {
    improvements.push(`Consider adding keyword: ${suggestion}`);
  });

  // Phase 3: Apply smart keyword addition (if keywords are suggested)
  if (keywordAnalysis.suggestions.length > 0 && optimizedText.length > 100) {
    serverLog.info(`Applying keyword additions [${requestId}]`, {
      keywordCount: keywordAnalysis.suggestions.length,
    });
    const keywordOptimization = await applyKeywordOptimization(
      optimizedText,
      keywordAnalysis,
      apiKey,
      requestId
    );
    
    if (keywordOptimization.optimized && keywordOptimization.optimized !== optimizedText) {
      // Validate keyword additions didn't break content
      const similarity = calculateContentSimilarity(optimizedText, keywordOptimization.optimized);
      if (similarity >= 0.90) { // Slightly lower threshold for keyword additions
        optimizedText = keywordOptimization.optimized;
        improvements.push(...keywordOptimization.improvements);
        allChanges.push(...(keywordOptimization.changes || []));
      } else {
        serverLog.warn(`Keyword optimization rejected due to low similarity [${requestId}]`, { similarity });
      }
    }
  }

  // Phase 4: Action Verb Enhancement
  if (optimizedText.length > 100) {
    serverLog.info(`Applying action verb enhancement [${requestId}]`);
    const verbEnhancement = await enhanceActionVerbs(
      optimizedText,
      analysis,
      apiKey,
      requestId
    );
    
    if (verbEnhancement.optimized && verbEnhancement.optimized !== optimizedText) {
      // Validate verb enhancement didn't break content
      const similarity = calculateContentSimilarity(optimizedText, verbEnhancement.optimized);
      if (similarity >= 0.92) { // High threshold for verb replacements
        optimizedText = verbEnhancement.optimized;
        improvements.push(...verbEnhancement.improvements);
        allChanges.push(...(verbEnhancement.changes || []));
      } else {
        serverLog.warn(`Verb enhancement rejected due to low similarity [${requestId}]`, { similarity });
      }
    }
  }

  // Phase 4: Quantifiable Achievement Enhancement (suggestions only, no fabrication)
  const achievementSuggestions = suggestQuantifiableAchievements(optimizedText, analysis, requestId);
  if (achievementSuggestions.length > 0) {
    improvements.push(...achievementSuggestions.map(s => `Suggestion: ${s}`));
  }

  // Calculate estimated score improvement
  const baseScore = analysis?.score || 70;
  const scoreImprovement = Math.min(20, 
    formattingFixes.improvements.length * 2 + 
    keywordAnalysis.suggestions.length + 
    (formattingIssues.length > 0 ? 3 : 0) +
    (optimizedText !== resumeText ? 2 : 0) + // Bonus for verb enhancements
    (achievementSuggestions.length > 0 ? 1 : 0) // Bonus for achievement suggestions
  );
  const newScore = Math.min(100, baseScore + scoreImprovement);

  serverLog.info(`Optimization completed [${requestId}]`, {
    originalScore: baseScore,
    newScore: newScore,
    improvementsCount: improvements.length,
    contentLength: optimizedText.length,
    changesCount: allChanges.length,
  });

  return {
    content: optimizedText,
    newScore: newScore,
    improvements: improvements.length > 0 ? improvements : ['ATS formatting improvements applied'],
  };
}

