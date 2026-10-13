# Bot independiente — imagen con Chromium (Playwright) ya incluido.
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /bot
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .

CMD ["node", "src/run.js"]
