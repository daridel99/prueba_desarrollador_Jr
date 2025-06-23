import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Home = () => {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    API.get("/api/hola")
      .then(response => setMensaje(response.data.mensaje))
      .catch(error => console.error("Error al conectar:", error));
  }, []);

  return (
    <div>
      <h1>Prueba de conexión</h1>
      <p>{mensaje}</p>
    </div>
  );
};

export default Home;
