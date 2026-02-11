import { ShieldCheck, Award, CheckCircle2 } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Award,
      text: "1,200+ Happy Customers",
      description: "Trusted by professionals",
    },
    {
      icon: CheckCircle2,
      text: "Instant Digital Delivery",
      description: "Access immediately after download",
    },
    {
      icon: ShieldCheck,
      text: "100% Free",
      description: "No credit card required",
    },
  ];

  return (
    <div className="py-12 px-4 bg-secondary/30">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all w-full sm:w-auto sm:min-w-[200px]"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-sm mb-1">{badge.text}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;



