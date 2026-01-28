from passlib.hash import bcrypt
from datetime import datetime, timedelta
import jwt

SECRET_KEY = "change_this_to_a_random_secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24

def hash_password(password: str) -> str:
    return bcrypt.hash(password[:72])

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.verify(password[:72], hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_access_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
