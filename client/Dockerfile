# Step 1: Use Node.js base image
FROM node:14 as build

# Set the working directory inside the container
WORKDIR /usr/src/app

# Step 2: Copy package.json and package-lock.json from the client directory
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Step 3: Copy the rest of the frontend source code
COPY ./ ./

# Step 4: Expose port 3000
EXPOSE 3000

# Step 5: Start the frontend application
CMD ["npm", "start"]
