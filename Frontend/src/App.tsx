import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./routes/index";
import AppLayout from "./routes/app";
import Login from "./routes/login";
import Registro from "./routes/registro";
import AppIndex from "./routes/app.index";
import Configuracion from "./routes/app.configuracion";
import Agendar from "./routes/app.agendar";
import CitaDetalle from "./routes/app.cita.$citaId";

/**
 * Componente principal de la aplicación.
 * Define la jerarquía de rutas utilizando React Router.
 * Divide la aplicación en zonas públicas (Landing, Login, Registro) y privadas (AppLayout).
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas Privadas (Bajo protección de AppLayout) */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<AppIndex />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="agendar" element={<Agendar />} />
          <Route path="cita/:citaId" element={<CitaDetalle />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
