FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy application code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Run the application
CMD ["pnpm", "start"]