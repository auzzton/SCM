# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package lock files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# ============================================================
# Stage 2: Build the Next.js application
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build with standalone output (set in next.config.ts)
RUN npm run build

# ============================================================
# Stage 3: Production runner (smallest possible image)
# ============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy the standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# server.js is created by next.js standalone builds
CMD ["node", "server.js"]
