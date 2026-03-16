FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl nodejs npm && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY server/requirements.txt ./
RUN pip install -r requirements.txt

COPY . .
RUN npm run build

# Copy server/.env if it exists, otherwise use Railway env vars
COPY server/.env .env 2>/dev/null || true

EXPOSE 8000

ENV PORT=8000
CMD ["python", "server/main.py"]
