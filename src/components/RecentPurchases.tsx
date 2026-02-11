import { useState, useEffect } from "react";
import { MapPin, CheckCircle2, TrendingUp, Users } from "lucide-react";

interface Purchase {
  location: string;
  timeAgo: string;
  id: number;
}

const RecentPurchases = () => {
  const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Gurgaon", "Noida"];

  const generatePurchase = (id: number): Purchase => {
    const location = cities[Math.floor(Math.random() * cities.length)];
    return { location, timeAgo: "just now", id };
  };

  const [purchases, setPurchases] = useState<Purchase[]>([
    generatePurchase(1),
    generatePurchase(2),
    generatePurchase(3),
    generatePurchase(4),
  ]);

  const [totalPurchases] = useState(1247);
  const [todayCount] = useState(12);

  useEffect(() => {
    // Simulate new purchases every 18-25 seconds
    const interval = setInterval(() => {
      const newPurchase = generatePurchase(Date.now());
      
      setPurchases((prev) => {
        // Update time ago for existing purchases
        const updated = prev.map((p, i) => {
          if (i === 0) return { ...p, timeAgo: "1 min ago" };
          if (i === 1) return { ...p, timeAgo: "3 mins ago" };
          if (i === 2) return { ...p, timeAgo: "7 mins ago" };
          if (i === 3) return { ...p, timeAgo: "12 mins ago" };
          return { ...p, timeAgo: "18 mins ago" };
        });
        
        // Add new purchase at the top, remove last one
        return [newPurchase, ...updated.slice(0, 3)];
      });
    }, 22000); // Update every 22 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-12 px-4 bg-gradient-to-b from-primary/5 to-transparent border-y border-border/50">
      <div className="container max-w-5xl mx-auto">
        {/* Header with stats */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Recent Activity</p>
              <p className="text-xs text-muted-foreground">Showing purchase locations</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalPurchases.toLocaleString()}+</p>
              <p className="text-xs text-muted-foreground">Total Customers</p>
            </div>
            <div className="h-12 w-px bg-border"></div>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              <div>
                <p className="text-sm font-semibold">+{todayCount} today</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Cards - Location Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {purchases.map((purchase, index) => (
            <div
              key={purchase.id}
              className="group relative bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* New badge for most recent */}
              {index === 0 && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  NEW
                </div>
              )}
              
              <div className="flex items-start gap-3">
                {/* Location Icon */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground text-sm">
                      Purchase Completed
                    </p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Users className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate font-medium text-foreground">{purchase.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {purchase.timeAgo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Join <span className="font-semibold text-foreground">{totalPurchases.toLocaleString()}+ professionals</span> from across India who've upgraded their careers
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Privacy protected • We respect customer anonymity
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecentPurchases;

