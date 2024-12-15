FROM oven/bun:1.1.38-slim

WORKDIR /app

COPY . .

RUN bun install

WORKDIR /app/web

ENV AUTH_TRUST_HOST=true

RUN bun run build

ENTRYPOINT [ "bun", "run", "start" ]