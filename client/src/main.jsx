import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

/**
 * Entry point.
 * BrowserRouter wraps App so every provider and page below it can use
 * routing hooks (useNavigate, useLocation, NavLink, ...).
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);