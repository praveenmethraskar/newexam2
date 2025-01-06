# Step 1: Use official Node.js image as base image
FROM node:14 as build

# Step 2: Set working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json to the container
COPY client/package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the frontend code
COPY client/ ./

# Step 6: Build the React app for production
RUN npm run build

# Step 7: Serve the built React app with a simple server (using serve package)
RUN npm install -g serve

# Step 8: Expose port 3000
EXPOSE 3000

# Step 9: Start the React application
CMD ["serve", "-s", "build", "-l", "3000"]
