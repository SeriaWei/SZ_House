# Use Node.js 20 as the base image for building the React app
FROM node:20-alpine AS builder

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use nginx to serve the built React app
FROM nginx:alpine AS production

# Copy the build output from the builder stage to nginx's html directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]