# Use an official Node.js runtime as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build TypeScript code 
RUN npm run build

# Expose port your app listens on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]
