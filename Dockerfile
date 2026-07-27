FROM node:20-alpine

WORKDIR /usr/src/app

# 1. Copiamos solo los manifiestos para aprovechar la caché de capas
COPY package.json pnpm-lock.yaml ./

# 2. Unificamos la preparación de pnpm e instalación de dependencias
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile

# 3. Copiamos el resto del código (Filtrado de forma segura por el .dockerignore)
COPY . .

# 4. Compilamos el proyecto de NestJS
RUN pnpm build

EXPOSE 3002

CMD ["pnpm", "start:prod"]