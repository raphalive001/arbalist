import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0d0f14",
            color: "#fff",
            border: "1px solid rgba(163,230,53,0.2)",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "#a3e635", secondary: "#08090d" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#08090d" } },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
