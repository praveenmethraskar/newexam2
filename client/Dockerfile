# Use the official Node.js image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json first (for efficient caching)
COPY client/package*.json ./

# Install dependencies (including axios and babel plugin)
RUN npm install

# Install axios and Babel plugin specifically
RUN npm install axios --save
RUN npm install @babel/plugin-proposal-private-property-in-object --save-dev

# Copy the rest of the application code
COPY client/ .

# Build the React app
RUN npm run build

# Expose the app port (if necessary)
EXPOSE 3000

# Command to start the app (if running in production)
CMD ["npm", "start"]
