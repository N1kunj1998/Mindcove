import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
}

const TestimonialCard = ({ name, role, location, content, rating }: TestimonialCardProps) => {
  return (
    <div className="p-6 rounded-xl bg-card shadow-card border border-border">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? "fill-accent text-accent" : "text-muted"}`}
          />
        ))}
      </div>
      <p className="text-foreground mb-4 leading-relaxed italic">"{content}"</p>
      <div>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
        <p className="text-xs text-muted-foreground/70">{location}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
