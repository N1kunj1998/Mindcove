import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Loader2, FileText, CheckCircle2, Zap, Sparkles, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { trackEvent } from "@/lib/analytics";
import jsPDF from "jspdf";

const ATSOptimize = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [optimizedResumeText, setOptimizedResumeText] = useState<string | null>(null);
  const [newScore, setNewScore] = useState<number | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { label: "Analyzing Issues", icon: FileText },
    { label: "Optimizing Content", icon: Zap },
    { label: "Improving Keywords", icon: Sparkles },
    { label: "Fixing Formatting", icon: CheckCircle2 },
    { label: "Generating PDF", icon: FileText },
  ];

  useEffect(() => {
    logger.info("ATSOptimize", "Optimization page mounted, starting process");
    
    const optimizeResume = async () => {
      try {
        const fileData = sessionStorage.getItem("ats_analysis_file");
        const analysisData = sessionStorage.getItem("ats_analysis_results");
        
        if (!fileData) {
          logger.warn("ATSOptimize", "No file data found, redirecting");
          navigate("/ats-analysis/results");
          return;
        }

        const { name, base64, extractedText } = JSON.parse(fileData);
        const analysis = analysisData ? JSON.parse(analysisData) : null;

        logger.info("ATSOptimize", "Starting optimization", {
          filename: name,
          hasAnalysis: !!analysis,
        });

        // Simulate progress while optimizing
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 1.5;
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              setIsComplete(true);
              return 100;
            }
            return newProgress;
          });
        }, 100);

        // Update current step based on progress
        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => {
            const newStep = Math.floor((progress / 100) * steps.length);
            const actualStep = Math.min(newStep, steps.length - 1);
            
            if (actualStep !== prev && actualStep < steps.length) {
              logger.info("ATSOptimize", `Step ${actualStep + 1}/${steps.length}: ${steps[actualStep].label}`);
            }
            
            return actualStep;
          });
        }, 200);

        // Call optimization API
        logger.apiCall("/api/optimize-resume", "POST", {
          filename: name,
        });

        const startTime = Date.now();
        const response = await fetch("/api/optimize-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: name,
            base64: base64,
            extractedText: extractedText || "",
            analysis: analysis,
          }),
        });

        const duration = Date.now() - startTime;
        logger.info("ATSOptimize", "Optimization API response received", {
          status: response.status,
          duration: `${duration}ms`,
        });

        clearInterval(progressInterval);
        clearInterval(stepInterval);

        if (!response.ok) {
          const errorText = await response.text();
          logger.apiError("/api/optimize-resume", {
            status: response.status,
            errorText,
          });
          throw new Error(`Optimization failed: ${response.status}`);
        }

        const data = await response.json();
        logger.info("ATSOptimize", "Optimization completed", {
          hasOptimizedResume: !!data.optimizedResume,
          newScore: data.newScore,
          improvementsCount: data.improvements?.length || 0,
        });

        // Store optimized resume data for preview page
        sessionStorage.setItem("ats_optimized_resume", JSON.stringify({
          optimizedResume: data.optimizedResume,
          newScore: data.newScore,
          improvements: data.improvements || [],
        }));

        setProgress(100);
        setIsComplete(true);
        setOptimizedResumeText(data.optimizedResume);
        setNewScore(data.newScore);
        setImprovements(data.improvements || []);

        trackEvent("resume_optimized", {
          originalScore: analysis?.score || 0,
          newScore: data.newScore || 0,
        });

        // Navigate to preview page after a brief delay
        setTimeout(() => {
          logger.info("ATSOptimize", "Navigating to preview page");
          navigate("/ats-analysis/preview");
        }, 2000);

      } catch (err) {
        logger.error("ATSOptimize", "Optimization failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        setError(err instanceof Error ? err.message : "Optimization failed");
        setIsComplete(true);
      }
    };

    optimizeResume();
  }, [navigate, progress, steps.length]);

  const handleDownload = () => {
    if (!optimizedResumeText) return;

    logger.info("ATSOptimize", "Generating and downloading PDF");
    trackEvent("optimized_resume_downloaded");

    try {
      // Create PDF using jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set font
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      // Split text into lines that fit the page width
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      const lineHeight = 7;
      let yPosition = margin;

      // Process the optimized resume text
      const lines = optimizedResumeText.split('\n');
      
      lines.forEach((line: string) => {
        // Handle long lines by wrapping them
        const wrappedLines = doc.splitTextToSize(line.trim(), maxWidth);
        
        wrappedLines.forEach((wrappedLine: string) => {
          // Check if we need a new page
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          
          // Add line to PDF
          doc.text(wrappedLine, margin, yPosition);
          yPosition += lineHeight;
        });
        
        // Add extra space after paragraphs
        if (line.trim() === '') {
          yPosition += lineHeight * 0.5;
        }
      });

      // Save PDF
      const filename = `optimized-resume-${Date.now()}.pdf`;
      doc.save(filename);
      
      logger.info("ATSOptimize", "PDF downloaded successfully", { filename });
    } catch (error) {
      logger.error("ATSOptimize", "PDF generation failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Fallback: download as text file
      const blob = new Blob([optimizedResumeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `optimized-resume-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Header />
      
      <main className="pt-32 pb-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-2xl">
            <CardContent className="pt-12 pb-12 px-8">
              {error ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Optimization Failed</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={() => navigate("/ats-analysis/results")} variant="outline">
                      Go Back
                    </Button>
                  </div>
                </div>
              ) : !isComplete ? (
                <div className="text-center space-y-8">
                  {/* Animated Icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                        <Zap className="w-16 h-16 text-primary animate-pulse" />
                      </div>
                      <div className="absolute inset-0 overflow-hidden rounded-full">
                        <div 
                          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">
                      Optimizing Your Resume
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Our AI is fixing issues and improving your resume...
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-4">
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-hero-gradient transition-all duration-300 ease-out rounded-full relative overflow-hidden"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {Math.round(progress)}% Complete
                    </p>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-3 pt-4">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = index === currentStep;
                      const isCompleted = index < currentStep;
                      
                      return (
                        <div
                          key={index}
                          className={`
                            flex items-center gap-4 p-4 rounded-lg transition-all duration-300
                            ${isActive 
                              ? "bg-primary/10 border-2 border-primary/30 scale-[1.02]" 
                              : isCompleted
                              ? "bg-success/10 border border-success/20"
                              : "bg-muted/30 border border-border opacity-50"
                            }
                          `}
                        >
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                            ${isActive 
                              ? "bg-primary text-primary-foreground animate-pulse" 
                              : isCompleted
                              ? "bg-success text-success-foreground"
                              : "bg-muted text-muted-foreground"
                            }
                          `}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <StepIcon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
                            )}
                          </div>
                          <span className={`
                            font-medium transition-colors duration-300
                            ${isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"}
                          `}>
                            {step.label}
                          </span>
                          {isActive && (
                            <Loader2 className="w-4 h-4 text-primary animate-spin ml-auto" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="w-12 h-12 text-success" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      Resume Optimized!
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Redirecting to preview page to review your optimized resume...
                    </p>
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground mt-4">
                      You'll be able to review all changes before downloading
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ATSOptimize;
