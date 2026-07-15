import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { isFirebaseConfigured } from "./lib/firebase/env";
import "./index.css";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

if (!isFirebaseConfigured()) {
  root.render(
    <StrictMode>
      <ConfigurationNeeded />
    </StrictMode>
  );
} else {
  bootstrap();
}

async function bootstrap() {
  const [{ default: App }, { registerSW }] = await Promise.all([import("./App"), import("virtual:pwa-register")]);
  registerSW({ immediate: true });
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

function ConfigurationNeeded() {
  return (
    <div
      style={{
        maxWidth: 420,
        margin: "10vh auto",
        padding: "0 24px",
        fontFamily: "system-ui, sans-serif",
        color: "#0f172a"
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>AGORA precisa do Firebase configurado</h1>
      <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>
        Copie <code>.env.example</code> para <code>.env.local</code> e preencha com as chaves do seu projeto
        Firebase (veja <code>docs/FIREBASE_SETUP.md</code>). Depois, reinicie o servidor de desenvolvimento ou
        gere um novo build.
      </p>
    </div>
  );
}
