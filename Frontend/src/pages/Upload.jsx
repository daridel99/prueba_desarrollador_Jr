import React, { useState } from 'react';
import axios from 'axios';

const Upload = ({ onUploadSuccess , token }) => {
  const [mensaje, setMensaje] = useState("");
  const [info, setInfo] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();

    const file = e.target.elements.csvFile.files[0]; // validacion de existencia de un archivo
    if (!file) {
      alert("Por favor selecciona un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/api/upload-csv", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
        }
      });

      setMensaje(response.data.mensaje);
      setInfo(response.data);

      // notificar que se subio exitosamente
      if (onUploadSuccess) onUploadSuccess();

    } catch (error) {

      if (error.response?.status === 401) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      setMensaje("Error: " + (error.response?.data?.detail || error.message));
      setInfo(null);
      
    }
  };

  return (
    <div>
      <h2>Subir CSV</h2>
      <form onSubmit={handleUpload}>
        <input type="file" name="csvFile" accept=".csv" />
        <button type="submit">Subir</button>
      </form>

      <p>{mensaje}</p>

      {info && (
        <div>
          <p>Registros insertados: {info.registros_insertados}</p>
          <p>Columnas detectadas: {info.columnas.join(", ")}</p>
          <p>Nombre de la colección: <strong>{info.coleccion}</strong></p>
        </div>
      )}
    </div>
  );
};

export default Upload;
