import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Default to dark theme on first load
const rootElement = document.documentElement;
if (!rootElement.classList.contains("dark")) {
  rootElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
