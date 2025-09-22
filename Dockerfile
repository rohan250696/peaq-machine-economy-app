# Multi-stage Dockerfile for building and serving Expo web (production)

# 1) Builder image: install deps and build static web
FROM node:20-alpine AS builder
ARG KBW_APP_WALLET_KEY
# Non-interactive build and disable telemetry
ENV CI=true EXPO_NO_TELEMETRY=1

WORKDIR /app
ENV KBW_APP_WALLET_KEY=$KBW_APP_WALLET_KEY

# Install OS deps required by some packages
RUN apk add --no-cache libc6-compat python3 make g++

# Copy manifests first to leverage Docker layer caching
COPY package.json package-lock.json /app/

# Install all deps including devDependencies (Metro + polyfills live in devDeps)
RUN npm ci

# Copy the rest of the repo
COPY . /app

# Create .env file with build argument
RUN echo "KBW_APP_WALLET_KEY=${KBW_APP_WALLET_KEY}" > .env

# Build Expo for web with environment variables
# react-native-dotenv will automatically read from .env file
RUN npx expo export --platform web --output-dir dist


# 2) Runtime image: NGINX to serve the static build
FROM nginx:1.27-alpine AS runtime

ENV NODE_ENV=production

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

