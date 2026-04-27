FROM node:20-bookworm

WORKDIR /app

# Install Python for FastAPI backend
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install frontend dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Install backend dependencies
COPY api/requirements.txt ./api/requirements.txt
RUN python3 -m pip install --no-cache-dir -r api/requirements.txt

# Copy app source
COPY . .

EXPOSE 5173 8000

CMD ["npm", "run", "local:start"]
