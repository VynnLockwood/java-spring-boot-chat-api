# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage using Vite's preview or Nginx
# Since we have a main Nginx proxy, we can just use a simple static server here
# like a lightweight Nginx just for the built assets, or serve via the main Nginx.
# Let's use a lightweight Nginx to serve the static files on port 80.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
