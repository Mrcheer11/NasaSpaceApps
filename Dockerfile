# Use a lightweight NGINX image
FROM nginx:alpine

# Copy all your project files into NGINX’s web directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX (automatically serves /usr/share/nginx/html)
CMD ["nginx", "-g", "daemon off;"]
