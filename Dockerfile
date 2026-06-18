FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 3007
CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "3007"]
