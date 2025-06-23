import React, { useState } from "react";
import axios from "axios";

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/login", new URLSearchParams({
        username,
        password
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      setToken(res.data.access_token);
      alert("Inicio de sesión exitoso");

    } catch (error) {
      console.error("Error de login:", error.response?.data || error.message);
      alert("Login fallido: " + (error.response?.data?.detail || "Error desconocido"));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Usuario"
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Contraseña"
        type="password"
      />
      <button type="submit">Entrar</button>
    </form>
  );
};

export default Login;