import React, { useEffect, useState } from "react";

const NotificacionesList = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  // Cargar las notificaciones desde el backend
  const fetchNotificaciones = async () => {
    try {
      const res = await fetch("http://localhost:3000/notificaciones");
      const data = await res.json();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  return (
    <div className="container">
      <h2>📨 Notificaciones enviadas</h2>
      {notificaciones.length === 0 ? (
        <p>No hay notificaciones enviadas aún.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Docente</th>
              <th>Correo</th>
              <th>Mensaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {notificaciones.map((n) => (
              <tr key={n._id}>
                <td>{n.docente?.nombre || "Desconocido"}</td>
                <td>{n.docente?.correo || "Sin correo"}</td>
                <td>{n.mensaje}</td>
                <td>{new Date(n.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NotificacionesList;
