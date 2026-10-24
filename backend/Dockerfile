# Base image: Node.js 20 LTS (Alpine for lightweight production image)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy all source files (respecting .dockerignore)
COPY . .

# Set environment variables
ENV NODE_ENV=production \
    PORT=8086

# Expose backend port
EXPOSE 8086

# Start the application
CMD ["npm", "start"]
