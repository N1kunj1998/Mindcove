// Analytics tracking utilities
// Replace 'G-XXXXXXXXXX' with your actual Google Analytics 4 Measurement ID

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Initialize Google Analytics
export const initAnalytics = (measurementId: string) => {
  // Load Google Analytics script
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    page_path: window.location.pathname,
  });
};

// Track page views
export const trackPageView = (path: string, measurementId?: string) => {
  if (typeof window.gtag !== "undefined" && measurementId) {
    window.gtag("config", measurementId, {
      page_path: path,
    });
  }
};

// Track events (button clicks, purchases, etc.)
export const trackEvent = (
  eventName: string,
  eventParams?: {
    [key: string]: string | number | boolean;
  }
) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", eventName, eventParams);
  }
};

// Track purchase button clicks
export const trackPurchaseClick = (source: string) => {
  trackEvent("purchase_click", {
    source: source, // e.g., "hero_button", "pricing_card", "footer"
    timestamp: new Date().toISOString(),
  });
};

// Track WhatsApp clicks
export const trackWhatsAppClick = () => {
  trackEvent("whatsapp_click", {
    timestamp: new Date().toISOString(),
  });
};

// Track scroll depth
export const trackScrollDepth = (depth: number) => {
  trackEvent("scroll_depth", {
    depth: depth,
    percentage: Math.round((depth / document.body.scrollHeight) * 100),
  });
};

// Track time on page
export const trackTimeOnPage = (seconds: number) => {
  trackEvent("time_on_page", {
    seconds: seconds,
  });
};

