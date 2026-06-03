FROM python:3.11-slim

WORKDIR /app

# İşletim sistemi bağımlılıklarını kur (gerekirse)
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Gereksinimleri kopyala ve kur
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Tüm backend kodunu kopyala
COPY . .

# FastAPI'yi başlat
# Render gibi platformlar PORT ortam değişkenini otomatik atar
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
