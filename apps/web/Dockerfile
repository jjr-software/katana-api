FROM node:20-bookworm AS build

WORKDIR /app

COPY package.json ./package.json
RUN npm install

COPY . .
RUN npm run build

FROM caddy:2.10

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist/katana-web-cli-latest/browser /usr/share/caddy
