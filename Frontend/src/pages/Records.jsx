import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Records = ({ coleccion }) => {
  const [registros, setRegistros] = useState([]);
  const [columnas, setColumnas] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/registros/${coleccion}`)
      .then(res => {
        setRegistros(res.data);
        if (res.data.length > 0) {
          setColumnas(Object.keys(res.data[0]).filter(key => key !== "_id"));
        }
      })
      .catch(err => console.error(err));
  }, [coleccion]);

  return (
    <div>
      <h2>Registros de {coleccion}</h2>
      <table border="1">
        <thead>
          <tr>
            {columnas.map(col => <th key={col}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {registros.map((row, idx) => (
            <tr key={idx}>
              {columnas.map(col => 
            <td key={col}>
                {typeof row[col] === 'object' && row[col]?.$numberDouble
                    ? Number(row[col].$numberDouble)
                    : row[col]?.toString?.() || ""}
            </td>
)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Records;
