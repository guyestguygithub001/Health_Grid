FROM node:18-alpine

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy application source code
COPY . .

# Ensure server/data.json exists so the server doesn't crash on boot if omitted from build
RUN mkdir -p server && touch server/data.json

# Expose the API port
EXPOSE 8082

# Start the application
CMD ["npm", "start"]
