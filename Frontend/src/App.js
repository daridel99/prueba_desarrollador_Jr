import logo from './favicon.jpg';//logo.svg
import './App.css';
import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Upload from './pages/Upload';
import ViewData from './pages/ViewData';
import Login from './pages/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [recargarColecciones, setRecargarColecciones] = useState(false);

  // Llamado desde upload para indicar recarga
  const notificarNuevaColeccion = () => {
    setRecargarColecciones(prev => !prev); // para que viewdata se entere
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        {/*mostrar Login si no hay token*/}
        {!token ? (
          <Login setToken={setToken} />
        ) : (
          <>
            <p>🔐 Sesión iniciada</p>
            <button onClick={() => {
                setToken("");
                localStorage.removeItem("token");
                window.location.reload();
              }}>
                Cerrar sesión
            </button>

          </>
        )}
        <br />
      </header>

      {/* mostrar contenido si hay token */}
      {token && (
        <>
          <Home />
          <hr />
          <Upload onUploadSuccess={notificarNuevaColeccion} token={token} />
          <hr />
          <ViewData actualizar={recargarColecciones} token={token}/>
        </>
      )}

    </div>
  );
}

export default App;
