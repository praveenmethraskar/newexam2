# Step 1: Use Node.js base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Step 2: Copy package.json and package-lock.json from the backend directory
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Step 3: Copy the rest of the backend source code
COPY ./ ./

# Step 4: Expose port (assuming your backend runs on port 5000)
EXPOSE 5000

# Step 5: Start the backend application
CMD ["npm", "start"]
