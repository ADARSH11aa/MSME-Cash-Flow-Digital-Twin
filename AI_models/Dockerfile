# AI server - all 8 models in one process.
#
# Built for Hugging Face Spaces (Docker SDK), which serves on 7860 and runs
# the container as a non-root user with UID 1000.

FROM python:3.13-slim

# tesseract-ocr: Model 4 uses pytesseract, which shells out to this binary -
# without it /extract/invoice raises at request time while every other
# endpoint works, which is a confusing way to find out it is missing.
# libgomp1: OpenMP runtime scikit-learn's ensembles link against.
RUN apt-get update && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# HF Spaces runs as UID 1000. Creating the user up front means the app does
# not need write access to anything it does not own.
RUN useradd -m -u 1000 appuser
USER appuser
ENV PATH="/home/appuser/.local/bin:$PATH"

WORKDIR /app

COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=appuser:appuser . .

# PORT is read by main.py to build its OWN self-call URLs - /risk-graph
# reaches Models 1, 3 and 5 over loopback HTTP. If PORT disagrees with the
# --port below, those calls hit a closed socket and the risk graph silently
# fail-softs to anomaly_type "normal" everywhere instead of erroring.
ENV PORT=7860
ENV PYTHONUNBUFFERED=1

EXPOSE 7860

# Single worker on purpose: each worker loads its own ~360 MB copy of the
# model artifacts, and /risk-graph's loopback self-calls are served from
# FastAPI's threadpool within one process.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
