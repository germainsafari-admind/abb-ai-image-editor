FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build Next.js app
RUN pnpm build

# Hugging Face expects the app on port 7860
ENV PORT=7860
EXPOSE 7860

# Start Next.js in production on 0.0.0.0:7860
CMD ["pnpm", "start", "--", "-p", "7860", "-H", "0.0.0.0"]

