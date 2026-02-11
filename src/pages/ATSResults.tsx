import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  ArrowLeft, 
  Download,
  TrendingUp,
  FileText,
  Loader2,
  Sparkles,
  Zap
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { logger } from "@/lib/logger";

interface ATSIssue {
  type: "error" | "warning" | "info" | "success";
  category: string;
  title: string;
  description: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

interface ATSResults {
  score: number;
  issues: ATSIssue[];
  strengths: string[];
  overallAssessment: string;
  recommendations: string[];
}

const ATSResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ATSResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const analyzeResume = async () => {
      logger.info("ATSResults", "Component mounted, starting analysis");
      
      try {
        const fileData = sessionStorage.getItem("ats_analysis_file");
        if (!fileData) {
          logger.warn("ATSResults", "No file data found in sessionStorage, redirecting to home");
          navigate("/");
          return;
        }

        logger.debug("ATSResults", "File data retrieved from sessionStorage");
        const { name, base64, extractedText } = JSON.parse(fileData);
        
        logger.info("ATSResults", "Preparing API request", {
          filename: name,
          hasBase64: !!base64,
          base64Length: base64?.length || 0,
          extractedTextLength: extractedText?.length || 0,
        });

        const requestBody = {
          filename: name,
          base64: base64,
          extractedText: extractedText || "",
        };

        logger.apiCall("/api/analyze-resume", "POST", {
          filename: name,
          payloadSize: JSON.stringify(requestBody).length,
        });

        // Call API to analyze resume
        const startTime = Date.now();
        const response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const duration = Date.now() - startTime;
        logger.info("ATSResults", "API response received", {
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.apiError("/api/analyze-resume", {
            status: response.status,
            statusText: response.statusText,
            errorText,
          });
          throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        logger.apiResponse("/api/analyze-resume", response.status, {
          score: data.score,
          issuesCount: data.issues?.length || 0,
          strengthsCount: data.strengths?.length || 0,
        });

        logger.info("ATSResults", "Analysis completed successfully", {
          score: data.score,
          issuesCount: data.issues?.length || 0,
          strengthsCount: data.strengths?.length || 0,
          recommendationsCount: data.recommendations?.length || 0,
        });

        setResults(data);
        setIsLoading(false);

        // Store analysis results for optimization
        sessionStorage.setItem("ats_analysis_results", JSON.stringify(data));

        trackEvent("ats_analysis_completed", {
          score: data.score,
          issues_count: data.issues.length,
        });
      } catch (err) {
        logger.error("ATSResults", "Analysis failed", {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
      }
    };

    analyzeResume();
  }, [navigate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-16 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your analysis results...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <XCircle className="w-16 h-16 text-destructive mx-auto" />
                  <h2 className="text-2xl font-bold text-foreground">Analysis Failed</h2>
                  <p className="text-muted-foreground">{error}</p>
                  <Button onClick={() => navigate("/")} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="font-display text-4xl md:text-5xl text-foreground">
              Your ATS Analysis Results
            </h1>
            <p className="text-lg text-muted-foreground">
              AI-powered analysis of your resume's ATS compatibility
            </p>
          </div>

          {/* Score Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className={`text-7xl font-bold mb-2 ${getScoreColor(results.score)}`}>
                  {results.score}/100
                </div>
                <div className="text-2xl font-semibold text-foreground mb-2">
                  {getScoreLabel(results.score)} ATS Score
                </div>
                <Progress value={results.score} className="h-4 mb-4" />
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {results.overallAssessment}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          {results.strengths.length > 0 && (
            <Card className="border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <TrendingUp className="w-5 h-5" />
                  What's Working Well
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Issues */}
          {results.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Issues & Recommendations
                </CardTitle>
                <CardDescription>
                  {results.issues.length} issue{results.issues.length !== 1 ? "s" : ""} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.issues
                    .sort((a, b) => {
                      const priorityOrder = { high: 0, medium: 1, low: 2 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((issue, index) => (
                      <Alert
                        key={index}
                        className={`border-2 ${getPriorityColor(issue.priority)}`}
                      >
                        <div className="flex items-start gap-4">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground">{issue.title}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(issue.priority)}`}>
                                {issue.priority.toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground">• {issue.category}</span>
                            </div>
                            <AlertDescription className="text-foreground">
                              {issue.description}
                            </AlertDescription>
                            <div className="bg-muted/50 rounded-lg p-3 mt-2">
                              <p className="text-sm font-medium text-foreground mb-1">💡 Suggestion:</p>
                              <p className="text-sm text-muted-foreground">{issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      </Alert>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Info className="w-5 h-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 list-decimal list-inside">
                  {results.recommendations.map((rec, index) => (
                    <li key={index} className="text-foreground">
                      {rec}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Optimize Resume Section */}
          <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/30 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-hero-gradient flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    AI-Powered Resume Optimization
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
                    Let our AI optimize your resume based on the analysis above. We'll fix all the issues and create an ATS-optimized version ready to download.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Fix formatting issues
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Optimize keywords
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Improve structure
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      Add quantifiable achievements
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    logger.info("ATSResults", "Optimize resume button clicked", {
                      score: results.score,
                      issuesCount: results.issues.length,
                    });
                    trackEvent("optimize_resume_clicked", {
                      score: results.score,
                      issues_count: results.issues.length,
                    });
                    navigate("/ats-analysis/optimize");
                  }}
                  disabled={isOptimizing}
                  size="lg"
                  className="bg-hero-gradient hover:opacity-90 text-primary-foreground font-semibold text-lg px-8 py-6 shadow-button"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Optimize My Resume with AI
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  ⚡ Takes 30-60 seconds • Free optimization • Download as PDF
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-hero-gradient text-primary-foreground border-0">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Want More Resources?</h3>
              <p className="mb-6 opacity-90">
                Get our free ATS-optimized resume templates and interview preparation guides
              </p>
              <Button
                onClick={() => {
                  trackEvent("ats_results_cta_clicked", {
                    score: results.score,
                  });
                  navigate("/");
                }}
                variant="secondary"
                size="lg"
                className="font-semibold"
              >
                Get Free Templates
                <Download className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};


export default ATSResults;
