import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

/**
 * Punto de entrada principal de la aplicación para el navegador.
 * Inicializa el root de React y monta el componente <App /> en el elemento con id 'root'.
 */
const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
