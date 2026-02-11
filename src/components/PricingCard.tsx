import { Check, Zap, ShieldCheck, FileText, Target, Wallet, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./CountdownTimer";
import { trackPurchaseClick } from "@/lib/analytics";

const PricingCard = () => {
  const featureCategories = [
    {
      title: "Resume Mastery",
      icon: FileText,
      color: "text-blue-500",
      features: [
        "The 3-Gate Hiring System (ATS → Recruiter → Hiring Manager)",
        "ATS-Safe Resume Blueprint (One-Page, Clean, Proven)",
        "10–15 Minute Resume Tailoring System (Per Job)",
        "High-Impact Bullet Writing Framework (STAR / CAR)",
        "Project Proof Kit (Make Projects Look Real & Defendable)",
        "ATS Debugging & Score Improvement Workflow",
        "ChatGPT Prompt Pack (No Hallucinations, No Fluff)",
      ],
    },
    {
      title: "Interview Mastery",
      icon: Target,
      color: "text-green-500",
      features: [
        "Complete Interview Preparation System (3-Part Framework)",
        "Resume-to-Interview Bridge",
        "STAR Story Builder (Behavioral & Technical)",
        "Winning Answer Frameworks for Common & Tough Questions",
        "Interview Etiquette, Follow-Ups & Professional Communication",
      ],
    },
    {
      title: "Offer Stage & Negotiation",
      icon: Wallet,
      color: "text-amber-500",
      features: [
        "India-Friendly Salary Negotiation Scripts",
        "Offer Evaluation Checklist",
      ],
    },
    {
      title: "Action Workbook",
      icon: BookOpen,
      color: "text-purple-500",
      features: [
        "7-Day Guided Action Plan (30–60 mins/day)",
        "Checklists, Worksheets & Fill-in Templates",
      ],
    },
  ];

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Urgency badge */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-urgent-gradient text-urgent-foreground px-6 py-2 rounded-full font-semibold text-sm flex items-center gap-2 animate-bounce-subtle shadow-lg">
          <Zap className="w-4 h-4" />
          LIMITED TIME OFFER
        </div>
      </div>

      <div className="bg-card rounded-2xl p-8 pt-12 shadow-card border-2 border-primary/20 relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-8">
          <h3 className="font-display text-3xl text-foreground mb-2">RESUME + INTERVIEW MASTERY KIT</h3>
          <p className="text-muted-foreground">Everything you need to land your dream job</p>
        </div>

        {/* Price section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-2xl text-muted-foreground line-through">₹299</span>
            <span className="font-display text-6xl text-primary">₹99</span>
          </div>
          <div className="inline-block bg-success/10 text-success px-4 py-1 rounded-full text-sm font-medium">
            Save ₹200 (67% OFF)
          </div>
        </div>

        {/* Countdown */}
        <div className="mb-8">
          <p className="text-center text-sm text-muted-foreground mb-4 uppercase tracking-wider">
            Offer Expires In
          </p>
          <CountdownTimer />
        </div>

        {/* Features list by category */}
        <div className="space-y-6 mb-8">
          {featureCategories.map((category, catIndex) => (
            <div key={catIndex} className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <category.icon className={`w-5 h-5 ${category.color}`} />
                <h4 className="font-semibold text-foreground">{category.title}</h4>
              </div>
              <ul className="space-y-2">
                {category.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={() => {
            trackPurchaseClick("pricing_card");
            window.open("https://superprofile.bio/vp/resume---interview-mastery-kit", "_blank");
          }}
          className="w-full bg-hero-gradient hover:opacity-90 text-primary-foreground font-semibold text-lg py-6 shadow-button animate-pulse-glow transition-all duration-300 hover:scale-[1.02]"
        >
          Get Instant Access Now
        </Button>

        {/* <div className="mt-6 p-4 bg-success/5 rounded-xl border border-success/20">
          <div className="flex items-center justify-center gap-2 text-success font-medium">
            <ShieldCheck className="w-5 h-5" />
            7-Day Money-Back Guarantee
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Not satisfied? Get a full refund within 7 days. No questions asked.
          </p>
        </div> */}

        <p className="text-center text-sm text-muted-foreground mt-4">
          🔒 Secure checkout • Instant digital delivery
        </p>
      </div>
    </div>
  );
};

export default PricingCard;
