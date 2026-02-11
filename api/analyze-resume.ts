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
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  serverLog.info(`Request received [${requestId}]`, {
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
    },
  });

  if (req.method !== 'POST') {
    serverLog.warn(`Invalid method [${requestId}]`, { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    serverLog.debug(`Parsing request body [${requestId}]`);
    const { base64, filename, extractedText } = req.body;

    serverLog.info(`Request body parsed [${requestId}]`, {
      filename: filename || 'unknown',
      hasBase64: !!base64,
      base64Length: base64?.length || 0,
      hasExtractedText: !!extractedText,
      extractedTextLength: extractedText?.length || 0,
    });

    if (!base64 && !extractedText) {
      serverLog.warn(`No PDF data provided [${requestId}]`);
      return res.status(400).json({ error: 'No PDF data or text provided' });
    }

    // OpenAI API Key - Read from environment variables
    serverLog.debug(`Checking OpenAI API key [${requestId}]`);
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      serverLog.error(`OpenAI API key not configured [${requestId}]`);
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in your environment variables'
      });
    }
    
    serverLog.info(`OpenAI API key found [${requestId}]`, {
      keyLength: OPENAI_API_KEY.length,
      keyPrefix: OPENAI_API_KEY.substring(0, 10) + '...',
    });

    // For Vercel serverless, we'll send the base64 to OpenAI Vision API
    // or use a PDF parsing service. For now, we'll extract text using OpenAI
    
    // Convert base64 to buffer
    serverLog.debug(`Converting base64 to buffer [${requestId}]`);
    const pdfBuffer = Buffer.from(base64, 'base64');
    serverLog.info(`PDF buffer created [${requestId}]`, {
      bufferSize: pdfBuffer.length,
      bufferSizeMB: (pdfBuffer.length / 1024 / 1024).toFixed(2),
    });
    
    // For Vercel, we'll send the PDF directly to OpenAI for analysis
    // OpenAI can handle PDFs in some formats, but we'll use a text-based approach
    // In production, consider using pdf-parse library
    
    // Use extracted text if available, otherwise try to extract from PDF
    let resumeText = extractedText || "";
    serverLog.info(`Text extraction status [${requestId}]`, {
      hasExtractedText: !!extractedText,
      extractedTextLength: extractedText?.length || 0,
      willExtractFromPDF: !extractedText && !!base64,
    });
    
    if (!resumeText && base64) {
      serverLog.info(`Extracting text from PDF [${requestId}]`);
      resumeText = await extractTextFromPDF(pdfBuffer, OPENAI_API_KEY, requestId);
      serverLog.info(`Text extraction completed [${requestId}]`, {
        extractedLength: resumeText.length,
      });
    }
    
    // Analyze with OpenAI using the extracted text
    serverLog.info(`Starting OpenAI analysis [${requestId}]`, {
      textLength: resumeText.length,
      textPreview: resumeText.substring(0, 100) + '...',
    });
    
    const analysis = await analyzeResumeWithOpenAI(resumeText, OPENAI_API_KEY, base64, requestId);
    
    const duration = Date.now() - startTime;
    serverLog.info(`Analysis completed successfully [${requestId}]`, {
      duration: `${duration}ms`,
      score: analysis.score,
      issuesCount: analysis.issues?.length || 0,
      strengthsCount: analysis.strengths?.length || 0,
    });
    
    return res.status(200).json(analysis);
  } catch (error) {
    const duration = Date.now() - startTime;
    serverLog.error(`Analysis failed [${requestId}]`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    });
    
    return res.status(500).json({ 
      error: 'Analysis failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function extractTextFromPDF(buffer: Buffer, apiKey: string, requestId: string): Promise<string> {
  serverLog.debug(`PDF extraction started [${requestId}]`, {
    bufferSize: buffer.length,
  });
  
  try {
    // Use OpenAI to extract text from PDF image/PDF
    // Note: OpenAI API can handle PDFs in some cases, but for better results
    // we'll use a text extraction approach
    
    // For now, return a placeholder - in production you'd use pdf-parse or similar
    // For Vercel, you might need to install pdf-parse as a dependency
    serverLog.warn(`PDF extraction using placeholder [${requestId}]`, {
      note: 'Client-side extraction should provide text',
    });
    return "Resume content will be extracted and analyzed";
  } catch (error) {
    serverLog.error(`PDF extraction failed [${requestId}]`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return "Unable to extract text from PDF";
  }
}

async function analyzeResumeWithOpenAI(resumeText: string, apiKey: string, pdfBase64: string | undefined, requestId: string) {
  serverLog.debug(`Preparing OpenAI request [${requestId}]`, {
    resumeTextLength: resumeText.length,
    hasPdfBase64: !!pdfBase64,
  });
  
  // If we have PDF base64, we could use vision API, but for now use text analysis
  // Reduced from 4000 to 3000 chars to save on input tokens
  const resumeContent = resumeText && resumeText !== "Resume content will be extracted and analyzed" 
    ? resumeText.substring(0, 3000) + (resumeText.length > 3000 ? '...' : '')
    : "Please analyze this resume PDF for ATS compatibility. Focus on structure, formatting, keywords, and missing elements.";

  serverLog.debug(`Resume content prepared [${requestId}]`, {
    contentLength: resumeContent.length,
    truncated: resumeText.length > 4000,
  });

  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the following resume and provide a comprehensive analysis.

${resumeContent}

Please provide a detailed JSON analysis with the following structure:
{
  "score": <number between 0-100>,
  "overallAssessment": "<brief assessment>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "issues": [
    {
      "type": "error" | "warning" | "info" | "success",
      "category": "<category name>",
      "title": "<issue title>",
      "description": "<detailed description>",
      "suggestion": "<actionable suggestion>",
      "priority": "high" | "medium" | "low"
    }
  ],
  "recommendations": ["<recommendation1>", "<recommendation2>", ...]
}

Focus on:
- ATS compatibility (formatting, structure, keywords)
- Missing sections (contact info, experience, education, skills)
- Keyword optimization
- Quantifiable achievements
- Formatting issues
- Section organization
- Action verbs and impact statements

Return ONLY valid JSON, no markdown formatting.`;

  const requestBody = {
    model: 'gpt-4o-mini', // Much cheaper: ~$0.15/$0.60 per 1M tokens vs $10-30 for turbo
    messages: [
      {
        role: 'system',
        content: 'You are an expert ATS resume analyzer. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1500, // Reduced from 2000 to save costs
  };

  serverLog.info(`Calling OpenAI API [${requestId}]`, {
    model: requestBody.model,
    promptLength: prompt.length,
    maxTokens: requestBody.max_tokens,
  });

  const openAIStartTime = Date.now();
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const openAIDuration = Date.now() - openAIStartTime;
  serverLog.info(`OpenAI API response received [${requestId}]`, {
    status: response.status,
    statusText: response.statusText,
    duration: `${openAIDuration}ms`,
  });

  if (!response.ok) {
    const error = await response.text();
    serverLog.error(`OpenAI API error [${requestId}]`, {
      status: response.status,
      statusText: response.statusText,
      error,
    });
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  serverLog.debug(`OpenAI response parsed [${requestId}]`, {
    hasChoices: !!data.choices,
    choicesCount: data.choices?.length || 0,
    usage: data.usage,
  });

  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    serverLog.error(`No content in OpenAI response [${requestId}]`, {
      response: JSON.stringify(data).substring(0, 500),
    });
    throw new Error('No response from OpenAI');
  }

  serverLog.debug(`OpenAI content received [${requestId}]`, {
    contentLength: content.length,
    contentPreview: content.substring(0, 200) + '...',
  });

  // Parse JSON response
  try {
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    serverLog.debug(`Parsing JSON response [${requestId}]`);
    const parsed = JSON.parse(jsonContent);
    serverLog.info(`JSON parsed successfully [${requestId}]`, {
      score: parsed.score,
      issuesCount: parsed.issues?.length || 0,
    });
    return parsed;
  } catch (parseError) {
    serverLog.warn(`JSON parsing failed, using fallback [${requestId}]`, {
      error: parseError instanceof Error ? parseError.message : String(parseError),
      contentPreview: content.substring(0, 500),
    });
    // Fallback: create a structured response from the text
    return createFallbackAnalysis(resumeText, requestId);
  }
}

function createFallbackAnalysis(resumeText: string, requestId: string) {
  serverLog.info(`Creating fallback analysis [${requestId}]`, {
    resumeTextLength: resumeText.length,
  });
  
  // Fallback analysis if JSON parsing fails
  const text = resumeText.toLowerCase();
  let score = 70;
  const issues = [];
  const strengths = [];
  
  // Basic checks
  if (resumeText.length > 500) strengths.push("Resume has adequate length");
  else issues.push({
    type: "warning" as const,
    category: "Content",
    title: "Resume too short",
    description: "Your resume may be too brief to effectively showcase your experience.",
    suggestion: "Add more detail about your work experience, achievements, and skills.",
    priority: "medium" as const,
  });
  
  if (text.includes('experience') || text.includes('work')) {
    strengths.push("Work experience section present");
  } else {
    score -= 20;
    issues.push({
      type: "error" as const,
      category: "Structure",
      title: "Missing experience section",
      description: "No clear work experience section found.",
      suggestion: "Add a detailed 'Work Experience' section with job titles, companies, dates, and achievements.",
      priority: "high" as const,
    });
  }
  
  const fallbackResult = {
    score: Math.max(0, Math.min(100, score)),
    overallAssessment: "Your resume has been analyzed. Review the issues below to improve your ATS compatibility.",
    strengths,
    issues,
    recommendations: [
      "Review and address all high-priority issues",
      "Add quantifiable achievements to your experience",
      "Ensure all sections are clearly labeled",
      "Use relevant keywords from job descriptions",
    ],
  };
  
  serverLog.info(`Fallback analysis created [${requestId}]`, {
    score: fallbackResult.score,
    issuesCount: fallbackResult.issues.length,
    strengthsCount: fallbackResult.strengths.length,
  });
  
  return fallbackResult;
}
