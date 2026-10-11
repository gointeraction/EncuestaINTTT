# syntax=docker/dockerfile:1
# Consola analítica (Angular) — build estático servido por Nginx.
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.24-alpine AS runner
COPY deploy/nginx-console.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/console/browser /usr/share/nginx/html
EXPOSE 4301
