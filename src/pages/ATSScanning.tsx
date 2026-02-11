import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Loader2, FileText, CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { logger } from "@/lib/logger";

const ATSScanning = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { label: "Reading PDF", icon: FileText },
    { label: "Extracting Text", icon: FileText },
    { label: "Analyzing Structure", icon: Zap },
    { label: "Checking ATS Compatibility", icon: CheckCircle2 },
    { label: "Generating Report", icon: CheckCircle2 },
  ];

  useEffect(() => {
    logger.info("ATSScanning", "Scanning page mounted, starting animation");
    
    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          logger.info("ATSScanning", "Scanning animation complete, navigating to results");
          
          // Navigate to results after a brief delay
          setTimeout(() => {
            logger.info("ATSScanning", "Navigating to results page");
            navigate("/ats-analysis/results");
          }, 1500);
          return 100;
        }
        
        // Log progress milestones
        if (newProgress % 25 === 0) {
          logger.debug("ATSScanning", `Scanning progress: ${newProgress}%`);
        }
        
        return newProgress;
      });
    }, 60);

    // Update current step based on progress
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const newStep = Math.floor((progress / 100) * steps.length);
        const actualStep = Math.min(newStep, steps.length - 1);
        
        if (actualStep !== prev && actualStep < steps.length) {
          logger.info("ATSScanning", `Step ${actualStep + 1}/${steps.length}: ${steps[actualStep].label}`);
        }
        
        return actualStep;
      });
    }, 200);

    return () => {
      logger.debug("ATSScanning", "Cleaning up intervals");
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [navigate, progress, steps.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Header />
      
      <main className="pt-32 pb-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-2xl">
            <CardContent className="pt-12 pb-12 px-8">
              <div className="text-center space-y-8">
                {/* Animated Scanner Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                      <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    </div>
                    {/* Scanning lines animation */}
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan"
                        style={{
                          animation: "scan 2s ease-in-out infinite",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">
                    Analyzing Your Resume
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Our AI is scanning your resume for ATS compatibility...
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
                    {progress}% Complete
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

                {isComplete && (
                  <div className="pt-4 animate-fade-in">
                    <p className="text-success font-semibold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Analysis Complete!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <style>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(400%);
            opacity: 0;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ATSScanning;
