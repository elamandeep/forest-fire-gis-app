FROM python:3.11.9-slim

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY . /app/

EXPOSE 8000

# RUN alembic revision --autogenerate -m "create account table" && alembic upgrade head 

CMD uvicorn main:app --host=0.0.0.0 --port=8000