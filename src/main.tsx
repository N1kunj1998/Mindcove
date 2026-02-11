import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

// Initialize Analytics (replace with your Measurement ID)
// Get your ID from: https://analytics.google.com/
// Format: G-XXXXXXXXXX
const GA_MEASUREMENT_ID = "G-X6WYHNXL14"

if (GA_MEASUREMENT_ID) {
  initAnalytics(GA_MEASUREMENT_ID);
}

createRoot(document.getElementById("root")!).render(<App />);
