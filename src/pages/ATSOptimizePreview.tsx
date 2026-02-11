import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2,
  TrendingUp,
  FileText,
  Loader2,
  Eye,
  Sparkles,
  CheckSquare
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { logger } from "@/lib/logger";
import { trackEvent } from "@/lib/analytics";
import jsPDF from "jspdf";
import { diffWords, diffLines, Change } from "diff";

interface ChangeHighlight {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

const ATSOptimizePreview = () => {
  const navigate = useNavigate();
  const [optimizedText, setOptimizedText] = useState<string>("");
  const [originalText, setOriginalText] = useState<string>("");
  const [newScore, setNewScore] = useState<number | null>(null);
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [highlightedChanges, setHighlightedChanges] = useState<ChangeHighlight[]>([]);
  const [activeTab, setActiveTab] = useState<"preview" | "comparison">("preview");
  const [contentSimilarity, setContentSimilarity] = useState<number>(1);
  const [changeSummary, setChangeSummary] = useState<{
    addedCount: number;
    removedCount: number;
    formattingChanges: number;
    characterDiff: number;
  } | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showOnlyFormatting, setShowOnlyFormatting] = useState(false);
  const [showOnlyKeywords, setShowOnlyKeywords] = useState(false);
  const [formattingChanges, setFormattingChanges] = useState<ChangeHighlight[]>([]);
  const [contentChanges, setContentChanges] = useState<ChangeHighlight[]>([]);
  const [keywordChanges, setKeywordChanges] = useState<ChangeHighlight[]>([]);
  const [keywordAdditions, setKeywordAdditions] = useState<string[]>([]);
  const [verbChanges, setVerbChanges] = useState<ChangeHighlight[]>([]);
  const [achievementSuggestions, setAchievementSuggestions] = useState<string[]>([]);
  const [approvedChanges, setApprovedChanges] = useState<{
    formatting: boolean;
    keywords: boolean;
    verbs: boolean;
    all: boolean;
  }>({
    formatting: true,
    keywords: true,
    verbs: true,
    all: true,
  });
  const [finalOptimizedText, setFinalOptimizedText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logger.info("ATSOptimizePreview", "Preview page mounted");
    
    const loadData = async () => {
      try {
        // Get optimized resume from sessionStorage
        const optimizedData = sessionStorage.getItem("ats_optimized_resume");
        const fileData = sessionStorage.getItem("ats_analysis_file");
        const analysisData = sessionStorage.getItem("ats_analysis_results");

        if (!optimizedData || !fileData) {
          logger.warn("ATSOptimizePreview", "Missing data, redirecting");
          navigate("/ats-analysis/results");
          return;
        }

        const { optimizedResume, newScore: optScore, improvements: optImprovements } = JSON.parse(optimizedData);
        const { extractedText } = JSON.parse(fileData);
        const analysis = analysisData ? JSON.parse(analysisData) : null;

        const originalTextValue = extractedText || "";
        
        // Validation: Check if optimized resume is valid
        if (!optimizedResume || typeof optimizedResume !== 'string') {
          logger.error("ATSOptimizePreview", "Invalid optimized resume data");
          throw new Error("Invalid optimized resume data");
        }

        // Validation: Check if optimized text is not prompt text or empty
        const isPromptText = optimizedResume.toLowerCase().includes('critical instructions') ||
                            optimizedResume.toLowerCase().includes('you are an expert') ||
                            optimizedResume.toLowerCase().includes('return only valid json') ||
                            optimizedResume.toLowerCase().includes('optimization requirements');
        
        if (isPromptText || optimizedResume.trim().length < 50) {
          logger.error("ATSOptimizePreview", "Optimized resume appears to be prompt text or too short", {
            length: optimizedResume.length,
            preview: optimizedResume.substring(0, 100),
          });
          throw new Error("Optimized resume appears to be invalid. Please try optimizing again.");
        }

        // Validation: Check content similarity (should be >80% similar)
        const similarity = calculateTextSimilarity(originalTextValue, optimizedResume);
        if (similarity < 0.8 && originalTextValue.length > 100) {
          logger.warn("ATSOptimizePreview", "Optimized resume is significantly different from original", {
            similarity,
            originalLength: originalTextValue.length,
            optimizedLength: optimizedResume.length,
          });
        }

        setOptimizedText(optimizedResume);
        setOriginalText(originalTextValue);
        setOriginalScore(analysis?.score || null);
        setNewScore(optScore);
        setImprovements(optImprovements || []);

        // Generate text diff for highlighting
        const changes = generateTextDiff(originalTextValue, optimizedResume);
        setHighlightedChanges(changes);

        // Separate formatting changes from content changes and keyword additions
        const formattingImprovements = optImprovements.filter(i => 
          i.toLowerCase().includes('format') || 
          i.toLowerCase().includes('spacing') ||
          i.toLowerCase().includes('header') ||
          i.toLowerCase().includes('date') ||
          i.toLowerCase().includes('bullet') ||
          i.toLowerCase().includes('capitalization')
        );

        const keywordImprovements = optImprovements.filter(i => 
          i.toLowerCase().includes('keyword') ||
          i.toLowerCase().includes('added') && i.toLowerCase().includes('ats-friendly')
        );

        // Extract keyword additions from improvements
        const extractedKeywords: string[] = [];
        keywordImprovements.forEach(imp => {
          const match = imp.match(/keyword[s]?:?\s*(.+)/i);
          if (match) {
            extractedKeywords.push(match[1].trim());
          }
        });
        setKeywordAdditions(extractedKeywords);

        // Filter changes by type (formatting vs keywords vs content)
        const formattingChangesList: ChangeHighlight[] = [];
        const keywordChangesList: ChangeHighlight[] = [];
        const contentChangesList: ChangeHighlight[] = [];

        // Common ATS keywords to identify keyword additions
        const commonATSKeywords = [
          'management', 'leadership', 'strategy', 'analysis', 'development',
          'implementation', 'optimization', 'collaboration', 'communication',
          'project', 'team', 'process', 'improvement', 'efficiency', 'results'
        ];

        changes.forEach(change => {
          if (change.type === 'added' || change.type === 'removed') {
            const isFormattingChange = 
              change.value.trim().length === 0 || // Whitespace only
              /^[A-Z\s]+$/.test(change.value.trim()) && change.value.length < 50 || // Headers
              /\d{4}\s*[-–—]\s*(\d{4}|\w+)/.test(change.value) || // Dates
              /^[•·▪▫-\s]+$/.test(change.value); // Bullets/spacing

            const isKeywordAddition = change.type === 'added' && 
              (commonATSKeywords.some(kw => change.value.toLowerCase().includes(kw)) ||
               extractedKeywords.some(kw => change.value.toLowerCase().includes(kw.toLowerCase())));

            if (isFormattingChange) {
              formattingChangesList.push(change);
            } else if (isKeywordAddition) {
              keywordChangesList.push(change);
            } else {
              contentChangesList.push(change);
            }
          } else {
            // Unchanged content goes to all lists
            formattingChangesList.push(change);
            keywordChangesList.push(change);
            contentChangesList.push(change);
          }
        });

        // Extract verb changes and achievement suggestions from improvements
        const verbImprovements = optImprovements.filter(i => 
          i.toLowerCase().includes('verb') || 
          i.toLowerCase().includes('enhanced')
        );
        const achievementImps = optImprovements.filter(i => 
          i.toLowerCase().includes('suggestion') ||
          i.toLowerCase().includes('quantifiable') ||
          i.toLowerCase().includes('metric') ||
          i.toLowerCase().includes('percentage')
        );
        setAchievementSuggestions(achievementImps.map(i => i.replace(/^suggestion:\s*/i, '')));

        // Identify verb changes (words that were likely replaced)
        const verbChangesList: ChangeHighlight[] = [];
        if (verbImprovements.length > 0) {
          // Mark added content that might be verb replacements
          changes.forEach(change => {
            if (change.type === 'added' && change.value.match(/\b(managed|developed|implemented|led|created|achieved|executed|performed|collaborated|supported|facilitated|utilized|maintained)\b/gi)) {
              verbChangesList.push(change);
            } else if (change.type === 'unchanged') {
              verbChangesList.push(change);
            }
          });
        }
        setVerbChanges(verbChangesList.length > 0 ? verbChangesList : changes);

        setFormattingChanges(formattingChangesList);
        setKeywordChanges(keywordChangesList);
        setContentChanges(contentChangesList);
        
        // Initialize final optimized text
        setFinalOptimizedText(optimizedResume);

        // Calculate change summary
        const addedCount = changes.filter(c => c.type === 'added').length;
        const removedCount = changes.filter(c => c.type === 'removed').length;
        const formattingChanges = improvements.filter(i => 
          i.toLowerCase().includes('format') || 
          i.toLowerCase().includes('spacing') ||
          i.toLowerCase().includes('header') ||
          i.toLowerCase().includes('date')
        ).length;
        const characterDiff = optimizedResume.length - originalTextValue.length;

        setChangeSummary({
          addedCount,
          removedCount,
          formattingChanges,
          characterDiff,
        });

        // Set similarity and warning
        setContentSimilarity(similarity);
        setShowWarning(similarity < 0.85 && originalTextValue.length > 100);

        // Use the estimated score from optimization (skip expensive re-analysis)
        setIsAnalyzing(false);
        logger.info("ATSOptimizePreview", "Data loaded successfully", {
          estimatedScore: optScore,
          originalScore: analysis?.score || null,
          similarity,
          originalLength: originalTextValue.length,
          optimizedLength: optimizedResume.length,
          changeSummary: { addedCount, removedCount, formattingChanges, characterDiff },
        });

      } catch (error) {
        logger.error("ATSOptimizePreview", "Failed to load data", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        
        // Show user-friendly error message
        const errorMessage = error instanceof Error ? error.message : "Failed to load optimized resume";
        
        // Try to show error in UI instead of alert
        setError(errorMessage);
        setIsAnalyzing(false);
        
        // Redirect after a delay to show error
        setTimeout(() => {
          navigate("/ats-analysis/results");
        }, 3000);
      }
    };

    loadData();
  }, [navigate]);

  // Calculate text similarity between original and optimized (0-1)
  const calculateTextSimilarity = (original: string, optimized: string): number => {
    if (!original || !optimized) return 0;
    
    // Simple word-based similarity
    const originalWords = new Set(original.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const optimizedWords = new Set(optimized.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    
    const intersection = new Set([...originalWords].filter(w => optimizedWords.has(w)));
    const union = new Set([...originalWords, ...optimizedWords]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  };

  // Removed reanalyzeOptimizedResume function to save costs
  // Now using estimated score from optimization instead of making another API call

  const generateTextDiff = (original: string, optimized: string): ChangeHighlight[] => {
    // Use diff library for line-level comparison first, then word-level for changed lines
    const changes: ChangeHighlight[] = [];
    
    if (!original || !optimized) {
      return changes;
    }

    // First, do line-level diff to identify major changes
    const lineDiff = diffLines(original, optimized);
    
    lineDiff.forEach((part: Change) => {
      if (part.added) {
        // This is new content - highlight it
        const lines = part.value.split('\n');
        lines.forEach((line, index) => {
          if (line.trim()) {
            // Do word-level diff for added lines to show exactly what was added
            const wordDiff = diffWords('', line, { ignoreWhitespace: false });
            wordDiff.forEach((wordPart: Change) => {
              if (wordPart.added) {
                changes.push({ type: 'added', value: wordPart.value });
              } else if (wordPart.value) {
                changes.push({ type: 'added', value: wordPart.value });
              }
            });
          }
          if (index < lines.length - 1) {
            changes.push({ type: 'added', value: '\n' });
          }
        });
      } else if (part.removed) {
        // Removed content - show in red strikethrough
        const lines = part.value.split('\n');
        lines.forEach((line, index) => {
          if (line.trim()) {
            changes.push({ type: 'removed', value: line });
          }
          if (index < lines.length - 1) {
            changes.push({ type: 'removed', value: '\n' });
          }
        });
      } else {
        // Unchanged content
        changes.push({ type: 'unchanged', value: part.value });
      }
    });
    
    return changes;
  };

  const generateWordLevelDiff = (original: string, optimized: string): ChangeHighlight[] => {
    // Word-level diff for more granular highlighting
    const changes: ChangeHighlight[] = [];
    const wordDiff = diffWords(original, optimized);
    
    wordDiff.forEach((part: Change) => {
      if (part.added) {
        changes.push({ type: 'added', value: part.value });
      } else if (part.removed) {
        // Skip removed parts in preview
      } else {
        changes.push({ type: 'unchanged', value: part.value });
      }
    });
    
    return changes;
  };

  const handleDownload = () => {
    // Validation: Check if optimized text is available
    if (!optimizedText || optimizedText.trim().length < 50) {
      logger.error("ATSOptimizePreview", "Cannot download: invalid optimized text", {
        textLength: optimizedText?.length || 0,
      });
      setError("Optimized resume is not available. Please try optimizing again.");
      return;
    }

    // Validation: Check for prompt text contamination
    if (optimizedText.toLowerCase().includes('critical instructions') ||
        optimizedText.toLowerCase().includes('you are an expert')) {
      logger.error("ATSOptimizePreview", "Cannot download: prompt text detected");
      setError("Invalid resume content detected. Please try optimizing again.");
      return;
    }

    // Use approved changes to generate final resume
    let textToDownload = optimizedText;
    
    // If not all changes are approved, we'd need to reconstruct the resume
    // For now, download the optimized version
    // TODO: Implement selective change application in Phase 5
    
    if (!textToDownload || textToDownload.trim().length < 50) {
      setError("Resume content is too short. Please try optimizing again.");
      return;
    }

    logger.info("ATSOptimizePreview", "Downloading optimized resume", {
      approvedChanges,
      approvedScore,
    });
    trackEvent("optimized_resume_downloaded_from_preview", {
      approvedFormatting: approvedChanges.formatting,
      approvedKeywords: approvedChanges.keywords,
      approvedVerbs: approvedChanges.verbs,
      score: approvedScore,
    });

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      const lineHeight = 7;
      let yPosition = margin;

      const lines = textToDownload.split('\n');
      
      lines.forEach((line: string) => {
        const wrappedLines = doc.splitTextToSize(line.trim(), maxWidth);
        
        wrappedLines.forEach((wrappedLine: string) => {
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          
          doc.text(wrappedLine, margin, yPosition);
          yPosition += lineHeight;
        });
        
        if (line.trim() === '') {
          yPosition += lineHeight * 0.5;
        }
      });

      const filename = `optimized-resume-${Date.now()}.pdf`;
      doc.save(filename);
      
      logger.info("ATSOptimizePreview", "PDF downloaded successfully", { filename });
    } catch (error) {
      logger.error("ATSOptimizePreview", "PDF generation failed", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      // Fallback to text file download
      try {
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `optimized-resume-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        logger.info("ATSOptimizePreview", "Fallback text file downloaded");
      } catch (fallbackError) {
        logger.error("ATSOptimizePreview", "Fallback download also failed", {
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        });
        setError("Download failed. Please try again or contact support.");
      }
    }
  };

  const scoreImprovement = newScore && originalScore ? newScore - originalScore : 0;

  // Calculate score based on approved changes
  const calculateApprovedScore = () => {
    if (!originalScore) return newScore || 0;
    let improvement = 0;
    if (approvedChanges.formatting) improvement += 3;
    if (approvedChanges.keywords) improvement += Math.min(5, keywordAdditions.length);
    if (approvedChanges.verbs) improvement += 2;
    return Math.min(100, originalScore + improvement);
  };

  const approvedScore = approvedChanges.all ? (newScore || originalScore || 0) : calculateApprovedScore();

  // Handle change approval toggle
  const handleChangeApproval = (category: 'formatting' | 'keywords' | 'verbs' | 'all', approved: boolean) => {
    setApprovedChanges(prev => {
      const newState = { ...prev, [category]: approved };
      if (category === 'all') {
        return {
          formatting: approved,
          keywords: approved,
          verbs: approved,
          all: approved,
        };
      } else {
        // Update 'all' based on individual checkboxes
        const allApproved = newState.formatting && newState.keywords && newState.verbs;
        return { ...newState, all: allApproved };
      }
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/ats-analysis/optimize")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">
              Preview Your Optimized Resume
            </h1>
            <p className="text-base md:text-lg text-muted-foreground px-4">
              Review the improvements and see your new ATS score
            </p>
          </div>

          {/* Score Comparison Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {/* Original Score */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Original Score</p>
                  <div className={`text-5xl font-bold ${originalScore && originalScore < 60 ? "text-destructive" : originalScore && originalScore < 80 ? "text-yellow-500" : "text-success"}`}>
                    {originalScore || "—"}/100
                  </div>
                </div>

                {/* Improvement */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Improvement</p>
                    <div className={`text-3xl font-bold ${scoreImprovement > 0 ? "text-success" : "text-muted-foreground"}`}>
                      {scoreImprovement > 0 ? "+" : ""}{scoreImprovement}
                    </div>
                  </div>
                </div>

                {/* New Score */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">New Score</p>
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-muted-foreground">Analyzing...</span>
                    </div>
                  ) : (
                    <div className={`text-5xl font-bold ${approvedScore >= 80 ? "text-success" : approvedScore >= 60 ? "text-yellow-500" : "text-destructive"}`}>
                      {approvedScore || newScore || "—"}/100
                    </div>
                  )}
                </div>
              </div>

              {!isAnalyzing && approvedScore && originalScore && (
                <div className="mt-6">
                  <Progress value={approvedScore} className="h-4" />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Original: {originalScore}/100</span>
                    <span className="font-semibold text-success">New: {approvedScore}/100</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Banner */}
          {error && (
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-3">
                  <div className="text-destructive text-xl">❌</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive mb-2">Error Loading Resume</h3>
                    <p className="text-sm text-destructive/80">{error}</p>
                    <Button
                      onClick={() => navigate("/ats-analysis/results")}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      Go Back to Results
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning Banner */}
          {showWarning && !error && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                      Content Similarity Warning
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      The optimized resume is {Math.round((1 - contentSimilarity) * 100)}% different from your original. 
                      Please review carefully to ensure all your information is preserved correctly.
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                      Similarity: {Math.round(contentSimilarity * 100)}% | 
                      Original: {originalText.length} chars | 
                      Optimized: {optimizedText.length} chars
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Change Approval System */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Select Changes to Apply
              </CardTitle>
              <CardDescription>
                Choose which improvements to include in your final resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-changes"
                    checked={approvedChanges.all}
                    onCheckedChange={(checked) => handleChangeApproval('all', checked === true)}
                  />
                  <label
                    htmlFor="all-changes"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Apply All Changes
                  </label>
                </div>
                
                <div className="ml-6 space-y-3 border-l-2 border-primary/20 pl-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="formatting-changes"
                      checked={approvedChanges.formatting}
                      onCheckedChange={(checked) => handleChangeApproval('formatting', checked === true)}
                      disabled={approvedChanges.all}
                    />
                    <label
                      htmlFor="formatting-changes"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Formatting Improvements ({changeSummary?.formattingChanges || 0} changes)
                      <span className="text-xs text-muted-foreground ml-2">+3 points</span>
                    </label>
                  </div>

                  {keywordAdditions.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="keyword-changes"
                        checked={approvedChanges.keywords}
                        onCheckedChange={(checked) => handleChangeApproval('keywords', checked === true)}
                        disabled={approvedChanges.all}
                      />
                      <label
                        htmlFor="keyword-changes"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Keyword Additions ({keywordAdditions.length} keywords)
                        <span className="text-xs text-muted-foreground ml-2">+{Math.min(5, keywordAdditions.length)} points</span>
                      </label>
                    </div>
                  )}

                  {improvements.some(i => i.toLowerCase().includes('verb')) && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verb-changes"
                        checked={approvedChanges.verbs}
                        onCheckedChange={(checked) => handleChangeApproval('verbs', checked === true)}
                        disabled={approvedChanges.all}
                      />
                      <label
                        htmlFor="verb-changes"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Action Verb Enhancements
                        <span className="text-xs text-muted-foreground ml-2">+2 points</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated ATS Score:</span>
                    <span className={`text-2xl font-bold ${approvedScore >= 80 ? 'text-success' : approvedScore >= 60 ? 'text-yellow-500' : 'text-destructive'}`}>
                      {approvedScore}/100
                    </span>
                  </div>
                  {originalScore && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Original: {originalScore}/100 | Improvement: +{approvedScore - originalScore}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Summary */}
          {changeSummary && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Change Summary
                </CardTitle>
                <CardDescription>
                  Overview of changes made to your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{changeSummary.addedCount}</div>
                    <div className="text-xs text-muted-foreground">Additions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{changeSummary.removedCount}</div>
                    <div className="text-xs text-muted-foreground">Removals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{changeSummary.formattingChanges}</div>
                    <div className="text-xs text-muted-foreground">Formatting</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${changeSummary.characterDiff >= 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      {changeSummary.characterDiff >= 0 ? '+' : ''}{changeSummary.characterDiff}
                    </div>
                    <div className="text-xs text-muted-foreground">Characters</div>
                  </div>
                </div>

                {/* Formatting Improvements Breakdown */}
                {changeSummary.formattingChanges > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-2 text-primary">Formatting Improvements:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {improvements.filter(i => 
                        i.toLowerCase().includes('format') || 
                        i.toLowerCase().includes('spacing') ||
                        i.toLowerCase().includes('header') ||
                        i.toLowerCase().includes('date') ||
                        i.toLowerCase().includes('bullet') ||
                        i.toLowerCase().includes('capitalization') ||
                        i.toLowerCase().includes('normalized') ||
                        i.toLowerCase().includes('standardized')
                      ).map((improvement, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          <span>{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Content Similarity: <strong>{Math.round(contentSimilarity * 100)}%</strong> | 
                    {contentSimilarity >= 0.95 ? ' ✅ Excellent preservation' : contentSimilarity >= 0.85 ? ' ⚠️ Good preservation' : ' ❌ Significant changes'}
                  </p>
                  {changeSummary.formattingChanges > 0 && (
                    <p className="text-xs text-primary mt-1">
                      📝 Most changes are formatting improvements (headers, spacing, dates). Your content is preserved.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Improvements List */}
          {improvements.length > 0 && (
            <Card className="bg-success/5 border-success/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Sparkles className="w-5 h-5" />
                  Improvements Made
                </CardTitle>
                <CardDescription>
                  Review the changes made to your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Formatting Improvements */}
                {improvements.filter(i => 
                  i.toLowerCase().includes('format') || 
                  i.toLowerCase().includes('spacing') ||
                  i.toLowerCase().includes('header') ||
                  i.toLowerCase().includes('date') ||
                  i.toLowerCase().includes('bullet')
                ).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-primary">Formatting Improvements:</h4>
                    <ul className="space-y-1">
                      {improvements.filter(i => 
                        i.toLowerCase().includes('format') || 
                        i.toLowerCase().includes('spacing') ||
                        i.toLowerCase().includes('header') ||
                        i.toLowerCase().includes('date') ||
                        i.toLowerCase().includes('bullet')
                      ).map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Keyword Improvements */}
                {improvements.filter(i => i.toLowerCase().includes('keyword')).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-primary">Keyword Additions:</h4>
                    <ul className="space-y-1">
                      {improvements.filter(i => i.toLowerCase().includes('keyword')).map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Verb Enhancements */}
                {improvements.filter(i => i.toLowerCase().includes('verb') || i.toLowerCase().includes('enhanced')).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-primary">Action Verb Enhancements:</h4>
                    <ul className="space-y-1">
                      {improvements.filter(i => i.toLowerCase().includes('verb') || i.toLowerCase().includes('enhanced')).map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Achievement Suggestions */}
                {achievementSuggestions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-yellow-600 dark:text-yellow-400">Achievement Suggestions:</h4>
                    <ul className="space-y-1">
                      {achievementSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-yellow-600 dark:text-yellow-400">💡</span>
                          <span className="text-foreground">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: These are suggestions only. Add quantifiable metrics if you have them.
                    </p>
                  </div>
                )}

                {/* Other Improvements */}
                {improvements.filter(i => 
                  !i.toLowerCase().includes('format') && 
                  !i.toLowerCase().includes('spacing') &&
                  !i.toLowerCase().includes('header') &&
                  !i.toLowerCase().includes('date') &&
                  !i.toLowerCase().includes('bullet') &&
                  !i.toLowerCase().includes('keyword') &&
                  !i.toLowerCase().includes('verb') &&
                  !i.toLowerCase().includes('enhanced') &&
                  !i.toLowerCase().includes('suggestion')
                ).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-success">Other Improvements:</h4>
                    <ul className="space-y-1">
                      {improvements.filter(i => 
                        !i.toLowerCase().includes('format') && 
                        !i.toLowerCase().includes('spacing') &&
                        !i.toLowerCase().includes('header') &&
                        !i.toLowerCase().includes('date') &&
                        !i.toLowerCase().includes('bullet') &&
                        !i.toLowerCase().includes('keyword') &&
                        !i.toLowerCase().includes('verb') &&
                        !i.toLowerCase().includes('enhanced') &&
                        !i.toLowerCase().includes('suggestion')
                      ).map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resume Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Optimized Resume Preview
              </CardTitle>
              <CardDescription>
                Review your optimized resume. Changes are highlighted in green.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Toggles for different change types */}
              {(formattingChanges.length > 0 || keywordChanges.length > 0) && (
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  {formattingChanges.filter(c => c.type !== 'unchanged').length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyFormatting && !showOnlyKeywords}
                        onChange={(e) => {
                          setShowOnlyFormatting(e.target.checked);
                          if (e.target.checked) setShowOnlyKeywords(false);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">
                        Show only formatting
                      </span>
                    </label>
                  )}
                  {keywordChanges.filter(c => c.type !== 'unchanged').length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyKeywords && !showOnlyFormatting}
                        onChange={(e) => {
                          setShowOnlyKeywords(e.target.checked);
                          if (e.target.checked) setShowOnlyFormatting(false);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-muted-foreground">
                        Show only keywords
                      </span>
                    </label>
                  )}
                  <span className="text-xs text-muted-foreground">
                    ({formattingChanges.filter(c => c.type !== 'unchanged').length} formatting, {keywordChanges.filter(c => c.type !== 'unchanged').length} keywords, {contentChanges.filter(c => c.type !== 'unchanged').length} content)
                  </span>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "comparison")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Optimized Resume</TabsTrigger>
                  <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-6">
                  {!optimizedText ? (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                      <p className="text-destructive font-semibold mb-2">No optimized resume available</p>
                      <p className="text-sm text-muted-foreground">Please go back and optimize your resume again.</p>
                      <Button
                        onClick={() => navigate("/ats-analysis/results")}
                        variant="outline"
                        className="mt-4"
                      >
                        Go Back to Results
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-4 md:p-6 border border-border max-h-[500px] md:max-h-[600px] overflow-y-auto scroll-smooth">
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-xs md:text-sm leading-relaxed">
                        {(showOnlyFormatting ? formattingChanges : showOnlyKeywords ? keywordChanges : highlightedChanges).length > 0 ? (
                          (showOnlyFormatting ? formattingChanges : showOnlyKeywords ? keywordChanges : highlightedChanges).map((change, index) => {
                            if (change.type === 'added') {
                              return (
                                <mark
                                  key={index}
                                  className="bg-success/40 text-success-foreground px-1 py-0.5 rounded font-medium"
                                  title="Added/Improved content"
                                >
                                  {change.value}
                                </mark>
                              );
                            } else if (change.type === 'removed') {
                              return (
                                <mark
                                  key={index}
                                  className="bg-destructive/20 text-destructive-foreground line-through px-1 py-0.5 rounded"
                                  title="Removed content"
                                >
                                  {change.value}
                                </mark>
                              );
                            }
                            return (
                              <span key={index} className="text-foreground">
                                {change.value}
                              </span>
                            );
                          })
                        ) : (
                          <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">
                            {optimizedText}
                          </pre>
                        )}
                      </div>
                      {(showOnlyFormatting ? formattingChanges : showOnlyKeywords ? keywordChanges : highlightedChanges).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border space-y-2">
                          {showOnlyFormatting && (
                            <p className="text-xs text-primary font-semibold mb-2">
                              📝 Showing only formatting changes. Uncheck the box above to see all changes.
                            </p>
                          )}
                          {showOnlyKeywords && (
                            <p className="text-xs text-primary font-semibold mb-2">
                              🔑 Showing only keyword additions. Uncheck the box above to see all changes.
                            </p>
                          )}
                          {keywordAdditions.length > 0 && (
                            <div className="mb-2 p-2 bg-primary/5 rounded border border-primary/20">
                              <p className="text-xs font-semibold text-primary mb-1">Keywords Added:</p>
                              <div className="flex flex-wrap gap-1">
                                {keywordAdditions.map((kw, idx) => (
                                  <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="inline-block w-4 h-4 bg-success/40 rounded"></span>
                            <strong>Green highlights:</strong> {
                              showOnlyFormatting ? 'Formatting improvements' : 
                              showOnlyKeywords ? 'Keyword additions' : 
                              'Improvements and additions'
                            }
                          </p>
                          {(showOnlyFormatting ? formattingChanges : showOnlyKeywords ? keywordChanges : highlightedChanges).some(c => c.type === 'removed') && (
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <span className="inline-block w-4 h-4 bg-destructive/20 rounded line-through"></span>
                              <strong>Red strikethrough:</strong> Removed content
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 <strong>Review carefully:</strong> Make sure all your information is preserved and improvements look correct before downloading.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comparison" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                        <FileText className="w-4 h-4" />
                        Original Resume
                        {originalScore !== null && (
                          <span className="ml-auto text-sm font-normal text-muted-foreground">
                            Score: {originalScore}/100
                          </span>
                        )}
                      </h3>
                      <div 
                        id="original-resume"
                        className="bg-muted/30 rounded-lg p-4 border border-border max-h-[500px] overflow-y-auto scroll-smooth"
                        style={{ scrollBehavior: 'smooth' }}
                      >
                        <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
                          {originalText || "No original text available"}
                        </pre>
                      </div>
                    </div>

                    {/* Optimized */}
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-success mb-3 flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                        <Sparkles className="w-4 h-4" />
                        Optimized Resume
                        {approvedScore !== null && !isAnalyzing && (
                          <span className="ml-auto text-sm font-normal text-success">
                            Score: {approvedScore}/100
                            {scoreImprovement > 0 && (
                              <span className="ml-1">(+{scoreImprovement})</span>
                            )}
                          </span>
                        )}
                        {isAnalyzing && (
                          <span className="ml-auto text-sm font-normal text-muted-foreground flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Analyzing...
                          </span>
                        )}
                      </h3>
                      <div 
                        id="optimized-resume"
                        className="bg-success/5 rounded-lg p-4 border border-success/20 max-h-[500px] overflow-y-auto scroll-smooth"
                        style={{ scrollBehavior: 'smooth' }}
                        onScroll={(e) => {
                          // Sync scroll with original resume
                          const originalEl = document.getElementById('original-resume');
                          if (originalEl) {
                            const scrollPercent = e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);
                            originalEl.scrollTop = scrollPercent * (originalEl.scrollHeight - originalEl.clientHeight);
                          }
                        }}
                      >
                        <pre className="text-sm whitespace-pre-wrap font-mono text-foreground leading-relaxed">
                          {optimizedText}
                        </pre>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Tip:</strong> Scroll is synchronized between both versions. Compare side-by-side to see the improvements. The optimized version includes better keywords, formatting, and ATS-friendly structure.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="bg-hero-gradient text-primary-foreground border-0">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Download?</h3>
              <p className="mb-6 opacity-90">
                {showWarning 
                  ? "Please review the changes carefully. If everything looks good, you can download your optimized resume."
                  : "Your resume has been optimized and is ready to use. Download your improved resume now."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
                <Button
                  onClick={handleDownload}
                  size="lg"
                  variant="secondary"
                  className="font-semibold text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Accept & Download PDF
                </Button>
                <Button
                  onClick={() => {
                    logger.info("ATSOptimizePreview", "User rejected changes, going back");
                    trackEvent("optimized_resume_rejected");
                    navigate("/ats-analysis/results");
                  }}
                  size="lg"
                  variant="outline"
                  className="font-semibold text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-background/10 border-background/20 text-primary-foreground hover:bg-background/20 w-full sm:w-auto"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Reject & Go Back
                </Button>
              </div>
              {showWarning && (
                <p className="text-xs opacity-75 mt-4">
                  ⚠️ If you're not satisfied with the changes, you can go back and try optimizing again.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ATSOptimizePreview;
