FROM python:3.11-slim

WORKDIR /app

# Install agentauth from source (not on PyPI)
COPY agentauth/ /app/agentauth/
RUN pip install --no-cache-dir /app/agentauth

# Install backend Python deps
COPY agentauth-platform/backend/requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt

# Backend application code
COPY agentauth-platform/backend/main.py /app/
COPY agentauth-platform/backend/static/ /app/static/

# Bake corpus into image. Also copy to /app/data_baked/ so cp -n can seed
# the /data volume on first boot (volume mount shadows /data/ image layer).
COPY agentauth-platform/data/corpus_signed.json /data/corpus_signed.json
COPY agentauth-platform/data/ca_public_key.hex  /data/ca_public_key.hex
COPY agentauth-platform/data/corpus_signed.json /app/data_baked/corpus_signed.json
COPY agentauth-platform/data/ca_public_key.hex  /app/data_baked/ca_public_key.hex

ENV CORPUS_PATH=/data/corpus_signed.json

EXPOSE 8000

# cp -n seeds volume on first boot only; exec transfers PID 1 to uvicorn
CMD ["sh", "-c", \
  "cp -n /app/data_baked/corpus_signed.json /data/ && \
   cp -n /app/data_baked/ca_public_key.hex /data/ && \
   exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
