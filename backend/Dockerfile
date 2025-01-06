# Step 1: Use official Node.js image as base image
FROM node:14

# Step 2: Set working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json for backend to container
COPY backend/package*.json ./

# Step 4: Install dependencies for backend
RUN npm install

# Step 5: Copy the rest of the backend code to the container
COPY backend/ ./

# Step 6: Expose the port that the backend API will run on
EXPOSE 5000

# Step 7: Start the Node.js backend server
CMD ["npm", "start"]
