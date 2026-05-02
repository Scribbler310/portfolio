# Stage 1: Build the React application
FROM node:20-alpine as build-stage

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app for production
# Note: VITE_ environment variables must be available at build time
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Copy the built assets from the build stage to Nginx's html directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration to handle React Router (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 7860 (default for Hugging Face Spaces)
EXPOSE 7860

# Adjust Nginx to run on port 7860
RUN sed -i 's/listen\(.*\)80;/listen 7860;/' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
