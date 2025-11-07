import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DocentesList from "./components/DocentesList";
import NotificacionesList from "./components/NotificacionesList"; // 👈 importamos el nuevo componente

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocentesList />} />
        <Route path="/notificaciones" element={<NotificacionesList />} /> {/* 👈 nueva ruta */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

