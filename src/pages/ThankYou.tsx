import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 md:pt-28 pb-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-success" />
              </div>
            </div>

            {/* Main Message */}
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Thank You!
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-body">
              Your free download is ready
            </p>

            {/* Download Link */}
            <div className="mb-8">
              <a
                href="https://drive.google.com/drive/folders/1Wv2N827xKS-VdA71UU0oC7zeKC_n6Dum?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-hero-gradient hover:opacity-90 text-primary-foreground font-semibold text-lg px-8 py-6 w-full sm:w-auto"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Link to Resume + Interview Mastery Course
                </Button>
              </a>
            </div>

            {/* Details */}
            <div className="bg-card rounded-xl p-8 border border-border shadow-sm mb-8">
              <div className="flex items-center justify-center gap-2 text-primary mb-4">
                <Sparkles className="w-5 h-5" />
                <p className="font-semibold text-lg">What's Next?</p>
              </div>
              <div className="space-y-3 text-left text-muted-foreground">
                <p>
                  Click the button above to access your free Resume + Interview Mastery Kit directly from Google Drive.
                </p>
                <p>
                  You should also receive an email shortly with download link and access instructions. Check your inbox (and spam folder) for the confirmation email.
                </p>
                <p className="pt-2 text-foreground font-medium">
                  If you have any issues accessing the download, please contact us at{" "}
                  <a href="mailto:hello@mindcove.io" className="text-primary hover:underline">
                    hello@mindcove.io
                  </a>
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <Link to="/">
              <Button
                size="lg"
                variant="outline"
                className="font-semibold text-lg px-8 py-6"
              >
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container max-w-4xl mx-auto text-center text-muted-foreground text-sm">
          <p className="font-semibold text-foreground text-lg mb-2">mindcove.io</p>
          <p>© {new Date().getFullYear()} Mindcove. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ThankYou;

