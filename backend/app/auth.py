from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Configuración
SECRET_KEY = "clave-secreta-super-segura" # Cámbiala por una más segura
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Usuario de prueba
fake_user = {
    "username": "admin",
    "password": "1234"
}

# Receptor de tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Crear token JWT
def crear_token(data: dict):

    to_encode = data.copy()
    expira = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expira})
    token_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(token_jwt)
    return token_jwt

# Verificar token en rutas protegidas
def verificar_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")