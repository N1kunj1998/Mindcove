import { useState, useRef } from "react";
import { FileText, Upload, Sparkles, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { logger } from "@/lib/logger";
import * as pdfjsLib from "pdfjs-dist";

// Set worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ATSScoreAnalyzer = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    logger.info("ATSScoreAnalyzer", "File dropped", { fileCount: files.length });
    
    if (files.length > 0 && files[0].type === "application/pdf") {
      logger.info("ATSScoreAnalyzer", "PDF file selected via drag & drop", {
        filename: files[0].name,
        size: files[0].size,
        type: files[0].type,
      });
      setSelectedFile(files[0]);
    } else {
      logger.warn("ATSScoreAnalyzer", "Invalid file type dropped", {
        type: files[0]?.type,
        expected: "application/pdf",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    logger.info("ATSScoreAnalyzer", "File selected via input", { fileCount: files?.length || 0 });
    
    if (files && files.length > 0 && files[0].type === "application/pdf") {
      logger.info("ATSScoreAnalyzer", "PDF file selected", {
        filename: files[0].name,
        size: files[0].size,
        type: files[0].type,
      });
      setSelectedFile(files[0]);
    } else {
      logger.warn("ATSScoreAnalyzer", "Invalid file type selected", {
        type: files?.[0]?.type,
        expected: "application/pdf",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      logger.warn("ATSScoreAnalyzer", "Analyze clicked but no file selected");
      return;
    }

    logger.info("ATSScoreAnalyzer", "Starting resume analysis", {
      filename: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    });

    trackEvent("ats_analyzer_pdf_uploaded", {
      filename: selectedFile.name,
      size: selectedFile.size,
    });

    try {
      logger.debug("ATSScoreAnalyzer", "Converting PDF to ArrayBuffer");
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      logger.debug("ATSScoreAnalyzer", "Loading PDF document");
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      logger.info("ATSScoreAnalyzer", "PDF loaded successfully", {
        pageCount: pdf.numPages,
      });
      
      let extractedText = "";
      logger.debug("ATSScoreAnalyzer", "Extracting text from PDF pages");
      
      for (let i = 1; i <= pdf.numPages; i++) {
        logger.debug("ATSScoreAnalyzer", `Extracting text from page ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        extractedText += pageText + "\n\n";
      }
      
      logger.info("ATSScoreAnalyzer", "Text extraction completed", {
        textLength: extractedText.length,
        pageCount: pdf.numPages,
      });

      // Convert PDF to base64 for storage
      logger.debug("ATSScoreAnalyzer", "Converting PDF to base64");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];
        
        const fileData = {
          name: selectedFile.name,
          size: selectedFile.size,
          base64: base64Data,
          extractedText: extractedText.substring(0, 10000), // Limit text length
        };
        
        logger.info("ATSScoreAnalyzer", "Storing file data in sessionStorage", {
          filename: fileData.name,
          base64Length: base64Data.length,
          extractedTextLength: fileData.extractedText.length,
        });
        
        sessionStorage.setItem("ats_analysis_file", JSON.stringify(fileData));

        logger.info("ATSScoreAnalyzer", "Navigating to scanning page");
        navigate("/ats-analysis/scanning");
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      logger.error("ATSScoreAnalyzer", "PDF parsing failed", {
        error: error instanceof Error ? error.message : String(error),
        filename: selectedFile.name,
      });
      // Fallback: still navigate but without extracted text
      logger.warn("ATSScoreAnalyzer", "Using fallback: storing file without extracted text");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];
        
        const fileData = {
          name: selectedFile.name,
          size: selectedFile.size,
          base64: base64Data,
          extractedText: "",
        };
        
        logger.info("ATSScoreAnalyzer", "Storing file data (fallback mode)", {
          filename: fileData.name,
          base64Length: base64Data.length,
        });
        
        sessionStorage.setItem("ats_analysis_file", JSON.stringify(fileData));

        logger.info("ATSScoreAnalyzer", "Navigating to scanning page (fallback)");
        navigate("/ats-analysis/scanning");
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    logger.info("ATSScoreAnalyzer", "File removed by user");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30" id="ats-analyzer">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            FREE AI-POWERED TOOL
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Check Your Resume's ATS Score
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your resume PDF and get an instant AI-powered ATS compatibility analysis. 
            Discover what's working and what needs improvement.
          </p>
        </div>

        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-primary" />
              Resume Analyzer
            </CardTitle>
            <CardDescription className="text-base">
              Upload your resume PDF to get started with AI-powered ATS analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
                  ${isDragging 
                    ? "border-primary bg-primary/5 scale-[1.02]" 
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                  }
                  cursor-pointer
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                    ${isDragging ? "bg-primary/20 scale-110" : "bg-primary/10"}
                  `}>
                    <Upload className={`w-10 h-10 text-primary transition-transform duration-300 ${isDragging ? "scale-110" : ""}`} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-2">
                      {isDragging ? "Drop your PDF here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF files only (Max 10MB)
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </Button>
                </div>
                <Button
                  onClick={handleAnalyze}
                  className="w-full bg-hero-gradient hover:opacity-90 text-primary-foreground font-semibold text-lg py-6 shadow-button"
                  size="lg"
                >
                  Analyze My Resume
                  <FileText className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">
                <strong className="text-foreground">🔒 Privacy First:</strong> Your resume is analyzed securely and never stored. 
                We use advanced AI to provide comprehensive ATS optimization recommendations.
              </p>
              <p>
                💡 <strong className="text-foreground">Pro Tip:</strong> Make sure your PDF is readable and not password-protected 
                for the best analysis results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ATSScoreAnalyzer;
