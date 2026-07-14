FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Expose port for Vite preview or a static server
EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
