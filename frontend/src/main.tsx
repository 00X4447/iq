import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CookiesProvider } from "react-cookie";
import ReduxProvider from "./providers/redux-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider>
      <CookiesProvider defaultSetOptions={{ path: "/" }}>
        <App />
      </CookiesProvider>
    </ReduxProvider>
  </StrictMode>
);
