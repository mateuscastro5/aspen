# Use the official Node.js image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build TypeScript code
RUN npm run build

# Expose application port
EXPOSE ${PORT:-3000}

# Start the application
CMD ["npm", "start"]
