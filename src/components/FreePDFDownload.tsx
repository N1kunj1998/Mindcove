import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trackEvent } from "@/lib/analytics";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface FreePDFDownloadProps {
  pdfUrl?: string; // URL to the PDF file
  pdfTitle?: string; // Title of the PDF
  description?: string; // Description of what the PDF contains
}

const FreePDFDownload = ({
  pdfUrl = "#", // Default placeholder - replace with actual PDF URL
  pdfTitle = "Free Resume Template & Interview Prep Guide",
  description = "Get instant access to our free ATS-optimized resume template and interview preparation checklist. Perfect for getting started on your job search journey.",
}: FreePDFDownloadProps) => {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    
    try {
      // Store email in localStorage
      const existingEmails = JSON.parse(localStorage.getItem("freePdfEmails") || "[]");
      if (!existingEmails.includes(data.email)) {
        existingEmails.push(data.email);
        localStorage.setItem("freePdfEmails", JSON.stringify(existingEmails));
      }

      // Track email capture event
      trackEvent("free_pdf_email_captured", {
        email: data.email,
        pdf_title: pdfTitle,
      });

      // TODO: Send email to your backend/email service
      // Example: await fetch('/api/capture-email', { method: 'POST', body: JSON.stringify(data) })
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSubmittedEmail(data.email);
      setEmailSubmitted(true);
      
      // Track successful download
      trackEvent("free_pdf_download_ready", {
        email: data.email,
      });
    } catch (error) {
      console.error("Error submitting email:", error);
      // Still show download link even if API fails
      setSubmittedEmail(data.email);
      setEmailSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    trackEvent("free_pdf_downloaded", {
      email: submittedEmail,
      pdf_title: pdfTitle,
    });
    
    // Open PDF in new tab
    window.open(pdfUrl, "_blank");
  };

  // Check if email was already submitted (for returning users)
  useEffect(() => {
    const storedEmails = JSON.parse(localStorage.getItem("freePdfEmails") || "[]");
    if (storedEmails.length > 0) {
      setSubmittedEmail(storedEmails[storedEmails.length - 1]);
      setEmailSubmitted(true);
    }
  }, []);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10" aria-labelledby="free-pdf-heading">
      <div className="container max-w-3xl mx-auto">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              100% FREE - No Credit Card Required
            </div>
            <h2 id="free-pdf-heading" className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Get Your Free Career Guide
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              {description}
            </p>
          </div>

          {!emailSubmitted ? (
            /* Email Capture Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Enter your email to get instant access
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10 h-12 text-base"
                      {...register("email")}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-hero-gradient hover:opacity-90 text-primary-foreground font-semibold px-8 h-12 whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <FileText className="w-5 h-5 mr-2" />
                        Get Free PDF
                      </>
                    )}
                  </Button>
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>

              {/* What's Included */}
              <div className="bg-secondary/50 rounded-lg p-6 border border-border">
                <p className="font-semibold text-foreground mb-3">What's included:</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>ATS-optimized resume template (Word & PDF)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Interview preparation checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Common interview questions & answers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Salary negotiation tips</span>
                  </li>
                </ul>
              </div>
            </form>
          ) : (
            /* Download Section */
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
              </div>
              
              <div>
                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-2">
                  Check Your Email!
                </h3>
                <p className="text-muted-foreground mb-6">
                  We've sent the download link to <span className="font-semibold text-foreground">{submittedEmail}</span>
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-6 border border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find the email? Download directly here:
                </p>
                <Button
                  onClick={handleDownload}
                  size="lg"
                  className="bg-hero-gradient hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 w-full sm:w-auto"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Free PDF Now
                </Button>
              </div>

            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FreePDFDownload;
