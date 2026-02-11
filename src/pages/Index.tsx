import { FileText, Target, Award, Users, Clock, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCard from "@/components/TestimonialCard";
import FAQ from "@/components/FAQ";
import TrustBadges from "@/components/TrustBadges";
import TrustedBy from "@/components/TrustedBy";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import ATSScoreAnalyzer from "@/components/ATSScoreAnalyzer";
import FreePDFDownload from "@/components/FreePDFDownload";
import { trackWhatsAppClick, trackScrollDepth, trackTimeOnPage } from "@/lib/analytics";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: FileText,
      title: "ATS-Optimized Templates",
      description: "Get 50+ resume templates designed to pass Applicant Tracking Systems and land more interviews.",
    },
    {
      icon: Target,
      title: "Interview Mastery",
      description: "Master the STAR method with our complete interview preparation system, including winning answer frameworks for common and tough questions.",
    },
    {
      icon: Award,
      title: "Salary Negotiation",
      description: "Proven scripts and strategies to negotiate better offers and increase your earning potential.",
    },
    {
      icon: Clock,
      title: "Quick Results",
      description: "Step-by-step guides that help you create a professional resume and prepare for interviews in hours, not weeks.",
    },
    {
      icon: Users,
      title: "1,200+ Career Upgrades",
      description: "Join professionals who've landed jobs at top product companies, unicorns, and Fortune 500 companies.",
    },
    {
      icon: Shield,
      title: "Lifetime Access",
      description: "Get all future updates and new templates included at no extra cost. Your career resource, forever.",
    },
  ];

  const testimonials = [
    {
      name: "Aditya Kulkarni",
      role: "Backend Developer at Freshworks",
      location: "Bangalore",
      content: "Was struggling to get callbacks for 3 months. Used the ATS templates and got 4 interview calls in the first week itself. Finally landed my dream role at a product-based company!",
      rating: 5,
    },
    {
      name: "Megha Joshi",
      role: "Product Manager at PhonePe",
      location: "Mumbai",
      content: "The STAR Story Builder framework alone is worth it. Used the winning answer frameworks for common and tough questions and felt so prepared. Negotiated 35% higher than initial offer using the India-friendly salary negotiation scripts.",
      rating: 4,
    },
    {
      name: "Karthik Rajan",
      role: "Senior Data Engineer at BigBasket",
      location: "Hyderabad",
      content: "Switched from service-based to product company after 4 years of trying. The resume tips on quantifying achievements made all the difference.",
      rating: 5,
    },
  ];


  // Track scroll depth
  useEffect(() => {
    const scrollTracked: Record<number, boolean> = { 25: false, 50: false, 75: false, 100: false };
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;

      if (scrollPercent >= 25 && !scrollTracked[25]) {
        trackScrollDepth(25);
        scrollTracked[25] = true;
      }
      if (scrollPercent >= 50 && !scrollTracked[50]) {
        trackScrollDepth(50);
        scrollTracked[50] = true;
      }
      if (scrollPercent >= 75 && !scrollTracked[75]) {
        trackScrollDepth(75);
        scrollTracked[75] = true;
      }
      if (scrollPercent >= 100 && !scrollTracked[100]) {
        trackScrollDepth(100);
        scrollTracked[100] = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent === 30 || timeSpent === 60 || timeSpent === 120) {
        trackTimeOnPage(timeSpent);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <Header />

      <main>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 overflow-hidden" aria-labelledby="hero-heading">
        {/* Background effects */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />

        <div className="container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            1,200+ professionals landed their dream jobs
          </div>

          <h1 id="hero-heading" className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            LAND YOUR{" "}
            <span className="text-gradient">DREAM JOB</span>
            <br />
            FASTER THAN EVER
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in font-body" style={{ animationDelay: "0.2s" }}>
            The ultimate career bundle: Resume Builder Tips + Interview Mastery Guide. Everything you need to stand out and get hired.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-secondary/50" aria-labelledby="problem-heading">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 id="problem-heading" className="font-display text-4xl md:text-5xl text-foreground mb-6">
            TIRED OF SENDING RESUMES INTO THE VOID?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 font-body">
            75% of resumes never get seen by human eyes. They get rejected by ATS systems before anyone even reads them. And even when you get an interview, unprepared candidates lose out to those who know exactly what to say.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-4xl font-display text-urgent mb-2">75%</p>
              <p className="text-muted-foreground">of resumes are rejected by ATS before a human sees them</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-4xl font-display text-urgent mb-2">33%</p>
              <p className="text-muted-foreground">of candidates fail interviews due to poor preparation</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-4xl font-display text-urgent mb-2">6 sec</p>
              <p className="text-muted-foreground">average time recruiters spend on each resume</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 scroll-mt-20" aria-labelledby="features-heading">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="font-display text-4xl md:text-5xl text-foreground mb-4">
              EVERYTHING YOU NEED TO SUCCEED
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              A complete career toolkit designed to help you stand out, impress interviewers, and negotiate better offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <TrustedBy />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-secondary/50 scroll-mt-20" aria-labelledby="testimonials-heading">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="testimonials-heading" className="font-display text-4xl md:text-5xl text-foreground mb-4">
              REAL PEOPLE, REAL RESULTS
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              See what our community has achieved with these resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <TrustBadges />

      {/* ATS Score Analyzer - Free Tool */}
      <ATSScoreAnalyzer />

      {/* Free PDF Download - Email Capture */}
      <FreePDFDownload
        pdfUrl="https://drive.google.com/file/d/YOUR_PDF_FILE_ID/view" // Replace with your actual PDF URL
        pdfTitle="Free Resume Template & Interview Prep Guide"
        description="Get instant access to our free ATS-optimized resume template and interview preparation checklist. Perfect for getting started on your job search journey."
      />

      {/* FAQ Section */}
      <FAQ />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container max-w-4xl mx-auto text-center text-muted-foreground text-sm">
          <p className="font-semibold text-foreground text-lg mb-2">mindcove.io</p>
          <p>© {new Date().getFullYear()} Mindcove. All rights reserved.</p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <p>
              Questions? Contact us at{" "}
              <a href="mailto:hello@mindcove.io" className="text-primary hover:underline">
                hello@mindcove.io
              </a>
            </p>
            <span className="hidden sm:inline">•</span>
            <WhatsAppButton variant="inline" className="text-sm" />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/privacy-policy" className="text-primary hover:underline text-sm">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Link to="/privacy-policy#returns-policy" className="text-primary hover:underline text-sm">
              Returns Policy
            </Link>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">
              IMPORTANT This site is not a part of the FaceBook website or FaceBook INC. Additionally, this site is NOT endorsed by FaceBook in ANY WAY. FACEBOOK is a trademark of FaceBook INC.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <WhatsAppButton variant="floating" />
    </div>
  );
};

export default Index;
