import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { I18nProvider } from "./i18n.jsx";
import "./styles.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 760, margin: "60px auto", padding: 24, fontFamily: "ui-monospace, Menlo, monospace", color: "#ff9b9b" }}>
          <h2 style={{ color: "#fff", fontFamily: "system-ui" }}>Framy: ошибка рендера</h2>
          <pre style={{ whiteSpace: "pre-wrap", background: "rgba(255,92,92,0.1)", padding: 16, borderRadius: 12, fontSize: 13 }}>
            {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
          </pre>
          <p style={{ color: "#97a0b2", fontFamily: "system-ui" }}>Скопируй этот текст — по нему сразу найдём причину. Затем обнови страницу (Cmd+Shift+R).</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
