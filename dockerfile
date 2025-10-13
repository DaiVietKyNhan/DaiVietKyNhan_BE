# Application Docker file Configuration
# Visit https://docs.docker.com/engine/reference/builder/
# Using multi stage build

# Prepare the image when build
# also use to minimize the docker image
FROM node:20-alpine as builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Generate Prisma client
RUN pnpm prisma:generate
# Build the application
RUN pnpm run build


# Build the image as production
# So we can minimize the size
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
ENV PORT=8080
ENV NODE_ENV=Production
RUN pnpm install --frozen-lockfile --prod
# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./
EXPOSE ${PORT}

# Generate Prisma client in production (for safety)
RUN pnpm prisma:generate

CMD ["pnpm", "run", "start"]