FROM imbios/bun-node:1.1.38-22.12.0-debian

WORKDIR /app

COPY . .

RUN bun install

WORKDIR /app/web

ENV AUTH_TRUST_HOST=true

RUN bun run build

ENTRYPOINT [ "bun", "run", "start" ]