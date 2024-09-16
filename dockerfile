# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install the app dependencies
RUN npm install --only=production

# Copy Prisma schema and generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build

# Expose the application port (informational)
EXPOSE 3000

# Start the NestJS application using a command that considers environment variables
CMD ["node", "dist/main"]
