# Step 1: Use Node.js as the base image
FROM node:14

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
COPY backend/package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the backend application
COPY backend/ ./

# Step 6: Expose the backend port (assuming the app runs on port 5000)
EXPOSE 5000

# Step 7: Command to run the app
CMD ["node", "index.js"]
