FROM node:22-bookworm-slim AS app

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run db:generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run db:push && npm run db:seed && npm run start -- -H 0.0.0.0"]
