from dataclasses import dataclass
import sys

from dotenv import load_dotenv, find_dotenv
from fastapi import FastAPI, HTTPException, status, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, RedirectResponse
import eel
import os

from pydantic import BaseModel
from starlette.responses import FileResponse
from starlette.status import HTTP_201_CREATED
from typing_extensions import Callable

from models.certificate import Certificate, initialize_db


load_dotenv()
TOKEN_COOKIE_NAME = "auth_token"
VALID_TOKEN = os.environ.get('ACCESS_TOKEN')

initialize_db()
app = FastAPI()
app.mount('/static', StaticFiles(directory='static'), name='static')


@app.middleware("http")
async def auth_token(request: Request, call_next: Callable):
    token = request.cookies.get(TOKEN_COOKIE_NAME)

    if request.url.path.startswith("/static"):
        response = await call_next(request)
        return response

    if request.url.path == "/auth":
        if token == VALID_TOKEN:
            return RedirectResponse(url="/")
        else:
            response = await call_next(request)
            return response

    if token == VALID_TOKEN:
        response = await call_next(request)
        return response
    else:
        return RedirectResponse(url="/auth")


@app.get('/')
def get_index() -> FileResponse:
    return FileResponse(os.path.join('index.html'))


@app.get('/auth')
def get_auth() -> FileResponse:
    return FileResponse(os.path.join('auth.html'))


@app.get('/api/v1/get_certificates')
def get_certificates() -> list[dict[str, str]]:
    return Certificate.get_all_certificates_as_dictionaries()


class CreateCertificateRequest(BaseModel):
    holder: str
    phone: str
    service_type: str


@app.post('/api/v1/create_certificate', status_code=status.HTTP_201_CREATED)
async def create_certificate(request: CreateCertificateRequest) -> None:
    holder, phone, service_type = request.holder, request.phone, request.service_type

    (service, value) = {
        'dry-cleaning': ("Химчистка мягкой мебели и ковров", 500),
        'spring-cleaning': ("Генеральная уборка", 1000),
    }[service_type]

    Certificate.create_certificate(service, holder, phone, value)


@app.delete('/api/v1/delete_certificate', status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate(id: int) -> None:
    Certificate.delete_certificate_by_id(id)


@app.get("/api/v1/protected_resource")
async def protected_resource(request: Request):
    token_from_cookie = request.cookies.get(TOKEN_COOKIE_NAME)

    if not token_from_cookie:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Token not found. Please authenticate first.")

    if token_from_cookie != VALID_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token. Access denied.")

    return JSONResponse(content={"message": "You have access to the protected resource!"})


@app.get("/api/v1/first_access")
async def first_access(response: Response, token: str):
    if token != VALID_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token. Access denied.")

    response.set_cookie(TOKEN_COOKIE_NAME, VALID_TOKEN, max_age=31536000, expires=31536000)
    return JSONResponse(content={"message": "Token is correct! Access granted and cookie has been set."})