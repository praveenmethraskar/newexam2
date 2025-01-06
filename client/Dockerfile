# Step 1: Build the frontend app using Node.js
FROM node:14 as build

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
COPY client/package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the frontend code
COPY client/ ./

# Step 6: Build the React app
RUN npm run build

# Step 7: Use an NGINX server to serve the frontend
FROM nginx:alpine

# Step 8: Copy the build directory from the previous stage to NGINX's public folder
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Step 9: Expose the frontend port (default port 80 for NGINX)
EXPOSE 80
