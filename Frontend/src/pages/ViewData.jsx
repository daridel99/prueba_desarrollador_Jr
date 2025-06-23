import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewData = ({ actualizar , token}) => {
  const [colecciones, setColecciones] = useState([]);
  const [seleccionada, setSeleccionada] = useState("");
  const [datos, setDatos] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [orden, setOrden] = useState({ columna: null, direccion: null });
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 50;

 useEffect(() => {// Obtener colecciones al cargar o al actualizar
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
  
    axios.get("http://localhost:8000/api/colecciones", config)
      .then(res => setColecciones(res.data))
      .catch(err => {
        console.error("Error al obtener colecciones:", err);
        if (err.response?.status === 401) {
          alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
          localStorage.removeItem("token");
          window.location.reload();
        }
      });
  }, [actualizar , token]);

  // Obtener datos al cambiar colección
  useEffect(() => {
    if (seleccionada) {
      axios.get(`http://localhost:8000/api/registros/${seleccionada}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          setDatos(res.data);
          if (res.data.length > 0) {
            setColumnas(Object.keys(res.data[0]).filter(col => col !== "_id"));
          }
          setPaginaActual(1); // Reiniciar paginación
        })
        .catch(err => console.error("Error al obtener datos:", err));
    }
  }, [seleccionada, token]);

  // Cambiar orden
  const manejarOrden = (columna) => {
    setOrden(prev => {
      if (prev.columna === columna) {
        if (prev.direccion === "asc") return { columna, direccion: "desc" };
        if (prev.direccion === "desc") return { columna: null, direccion: null };
      }
      return { columna, direccion: "asc" };
    });
  };

  // Aplicar orden
  const datosOrdenados = [...datos];
  if (orden.columna && orden.direccion) {
    datosOrdenados.sort((a, b) => {
      const valA = a[orden.columna]?.$numberDouble || a[orden.columna];
      const valB = b[orden.columna]?.$numberDouble || b[orden.columna];

      const strA = typeof valA === "string" ? valA : valA?.toString() || "";
      const strB = typeof valB === "string" ? valB : valB?.toString() || "";

      const numA = parseFloat(strA);
      const numB = parseFloat(strB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return orden.direccion === "asc" ? numA - numB : numB - numA;
      } else {
        return orden.direccion === "asc"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });
  }

  // Paginación
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const datosPaginados = datosOrdenados.slice(inicio, fin);
  const totalPaginas = Math.ceil(datosOrdenados.length / registrosPorPagina);

  return (
    <div>
      <h2>Visualizar Datos</h2>

      <label>Selecciona una colección: </label>
      <select onChange={e => setSeleccionada(e.target.value)} value={seleccionada}>
        <option value="">-- Elige una colección --</option>
        {colecciones.map((col) => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>

      {seleccionada && datos.length > 0 && (
        <>
          <table border="1" style={{ marginTop: "20px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {columnas.map((col) => (
                  <th
                    key={col}
                    onClick={() => manejarOrden(col)}
                    style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}
                  >
                    {col}
                    {orden.columna === col && (
                      orden.direccion === "asc" ? " 🔼" :
                      orden.direccion === "desc" ? " 🔽" :
                      ""
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datosPaginados.map((row, i) => (
                <tr key={i}>
                  {columnas.map((col) => (
                    <td key={col}>
                      {typeof row[col] === "object" && row[col]?.$numberDouble
                        ? Number(row[col].$numberDouble)
                        : row[col]?.toString?.() || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
              disabled={paginaActual === 1}
            >
              Anterior
            </button>

            <span style={{ margin: "0 10px" }}>
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {seleccionada && datos.length === 0 && <p>No hay datos en esta colección.</p>}
    </div>
  );
};

export default ViewData;
