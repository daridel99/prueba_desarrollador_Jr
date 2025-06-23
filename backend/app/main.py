from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.auth import crear_token, verificar_token, fake_user
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from app.db import db
from uuid import uuid4
from fastapi import HTTPException
from bson import json_util
import json
import csv
from io import StringIO


app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def saludo():
    return {"mensaje": "Hola"}

# Ruta para login
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    print("Login recibido:", form_data.username, form_data.password)
    if form_data.username == fake_user["username"] and form_data.password == fake_user["password"]:
        print('hola')
        token = crear_token({"sub": form_data.username})
        print(token)
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Credenciales inválidas")

@app.get("/api/hola")
def hola():
    return {"mensaje": "Hola desde FastAPI"}

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos CSV")

    contents = await file.read()
    try:

        # Detectar delimitador
        sample = contents.decode("utf-8").splitlines()[0]
        dialect = csv.Sniffer().sniff(sample)

        # Convertir a DataFrame
        df = pd.read_csv(pd.io.common.BytesIO(contents), sep=dialect.delimiter)
        print(df)
        # Insertar en MongoDB como lista de diccionarios
        records = df.to_dict(orient="records")
        
        collection_name = f"csv_{uuid4().hex[:8]}"
        db[collection_name].insert_many(records)
        
        return {
            "mensaje": "Archivo cargado con éxito",
            "registros_insertados": len(records),
            "coleccion": collection_name,
            "columnas": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar el CSV: {str(e)}")

@app.get("/api/colecciones")
def listar_colecciones():
    return db.list_collection_names()

@app.get("/api/registros/{coleccion}")
def obtener_registros(coleccion: str, limite: int = 100):
    if coleccion not in db.list_collection_names():
        raise HTTPException(status_code=404, detail="Colección no encontrada")

    datos = list(db[coleccion].find())#.limit(limite)
    
    # Convertimos los datos para que puedan ser serializados por JSON
    return json.loads(json_util.dumps(datos))
