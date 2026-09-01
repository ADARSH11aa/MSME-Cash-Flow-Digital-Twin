# Combined backend + AI_models service, for a single Cloud Run deployment.
#
# These two run in one container on purpose: backend/src/aiModelsBridge.js
# and backend/src/routes/data.js read and write AI_models/invoices.csv
# directly off local disk, not only over HTTP. As two separate Cloud Run
# services they would have separate filesystems and every one of those
# reads/writes would break. This mirrors local dev instead - same relative
# directory layout, same http://127.0.0.1:8000 call target - just both
# processes launched by start.sh in one container rather than two terminals.
FROM python:3.13-slim

# tesseract-ocr / libgomp1: same reason as AI_models/Dockerfile (OCR engine,
# scikit-learn's OpenMP runtime). nodejs/npm: runs the backend gateway.
# wget: start.sh's readiness probe for the AI server.
RUN apt-get update && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        libgomp1 \
        nodejs \
        npm \
        wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependency layers first so a source-only change doesn't reinstall the
# ~360MB of Python packages or re-fetch node_modules.
COPY AI_models/requirements.txt AI_models/requirements.txt
RUN pip install --no-cache-dir -r AI_models/requirements.txt

COPY backend/package.json backend/package-lock.json backend/
RUN cd backend && npm ci --omit=dev

COPY AI_models AI_models
COPY backend backend
COPY start.sh start.sh
RUN chmod +x start.sh

ENV PYTHONUNBUFFERED=1
# Cloud Run injects PORT for whichever process must be publicly reachable -
# that's the Node gateway here. The Python AI server always listens on 8000
# internally regardless of this value; see start.sh.
ENV PORT=8080
EXPOSE 8080

CMD ["./start.sh"]
