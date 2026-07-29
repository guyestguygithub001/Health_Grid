FROM node:18-alpine

WORKDIR /app

# Copy the server and public directories
COPY package*.json ./
RUN npm install --production
COPY server ./server
COPY public ./public
# If no package.json exists, this will just fail gracefully or we can just ignore it.
# Actually, since it's just server.js, we don't strictly need npm install if there are no external dependencies.
# The previous code showed no external requires other than built-in 'http', 'fs', 'path', 'zlib'.

EXPOSE 8082

CMD ["node", "server/server.js"]
