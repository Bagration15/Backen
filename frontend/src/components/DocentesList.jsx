import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DocentesList = () => {
  const [docentes, setDocentes] = useState([]);
  const [nuevoDocente, setNuevoDocente] = useState({ nombre: "", correo: "", asistio: false });
  const navigate = useNavigate(); // 👈 para navegar a otra ruta

  // Cargar docentes desde el backend
  const fetchDocentes = async () => {
    try {
      const res = await fetch("http://localhost:3000/docentes");
      const data = await res.json();
      setDocentes(data);
    } catch (error) {
      console.error("Error cargando docentes:", error);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  // Guardar o actualizar docente
  const guardarDocente = async () => {
    try {
      const res = await fetch("http://localhost:3000/docentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoDocente),
      });

      if (res.ok) {
        setNuevoDocente({ nombre: "", correo: "", asistio: false });
        fetchDocentes();
      }
    } catch (error) {
      console.error("Error guardando docente:", error);
    }
  };

  // Notificar si el docente no asistió
  const notificarFalta = async (docente) => {
    try {
      await fetch("http://localhost:3000/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docenteId: docente._id,
          mensaje: `El docente ${docente.nombre} no asistió a su clase.`,
        }),
      });
      alert(`Notificación enviada a ${docente.nombre}`);
    } catch (error) {
      console.error("Error enviando notificación:", error);
    }
  };

  return (
    <div className="container">
      <h2>👩‍🏫 Lista de Docentes</h2>

      {/* Botón para ir a ver las notificaciones */}
      <button
        onClick={() => navigate("/notificaciones")}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "8px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "15px",
        }}
      >
        📨 Ver Notificaciones
      </button>

      {/* Formulario para agregar docente */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoDocente.nombre}
          onChange={(e) => setNuevoDocente({ ...nuevoDocente, nombre: e.target.value })}
        />
        <input
          type="email"
          placeholder="Correo"
          value={nuevoDocente.correo}
          onChange={(e) => setNuevoDocente({ ...nuevoDocente, correo: e.target.value })}
        />
        <button onClick={guardarDocente}>Guardar</button>
      </div>

      {/* Tabla de docentes */}
      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Asistió</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((d) => (
            <tr key={d._id}>
              <td>{d.nombre}</td>
              <td>{d.correo}</td>
              <td>{d.asistio ? "✅ Sí" : "❌ No"}</td>
              <td>
                {!d.asistio && (
                  <button
                    onClick={() => notificarFalta(d)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Notificar Falta
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocentesList;
