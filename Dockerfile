FROM imbios/bun-node:1.1.38-22.12.0-debian AS web

FROM ghcr.io/cirruslabs/flutter:3.27.0 AS flutter

WORKDIR /app

COPY app /app/

RUN flutter pub get

RUN flutter build apk --release

RUN flutter build web --release --wasm --base-href /app/

FROM web AS env

WORKDIR /web

COPY . .

RUN bun install

WORKDIR /web/web

ENV AUTH_TRUST_HOST=true

# create public if not exists
RUN mkdir -p public

COPY --from=flutter /app/build/app/outputs/flutter-apk/app-release.apk /web/web/public/app-release.apk

COPY --from=flutter /app/build/web /web/web/public/app

RUN bun run build

ENTRYPOINT [ "bun", "run", "start" ]