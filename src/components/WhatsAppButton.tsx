import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trackWhatsAppClick } from "@/lib/analytics";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  variant?: "floating" | "inline";
  className?: string;
}

const WhatsAppButton = ({
  phoneNumber = "917567071072", // Your WhatsApp number: +91 7567071072 (remove + and spaces)
  message = "Hi! I have a question about the Resume + Interview Mastery Kit.",
  variant = "floating",
  className = "",
}: WhatsAppButtonProps) => {
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Construct WhatsApp URL (format: https://wa.me/PHONENUMBER?text=MESSAGE)
  // Phone number should be: country code + number (no +, no spaces, no dashes)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    trackWhatsAppClick();
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (variant === "floating") {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleClick}
                size="lg"
                className="relative rounded-full w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer"
                aria-label="Chat on WhatsApp"
                type="button"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="sr-only">Chat on WhatsApp</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-[#25D366] text-white border-none">
              <p className="font-medium">Chat with us on WhatsApp</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* Pulse animation ring - outside button to avoid blocking clicks */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none -z-10"></div>
      </div>
    );
  }

  // Inline variant
  return (
    <Button
      onClick={handleClick}
      className={`bg-[#25D366] hover:bg-[#20BA5A] text-white ${className}`}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Chat on WhatsApp
    </Button>
  );
};

export default WhatsAppButton;

