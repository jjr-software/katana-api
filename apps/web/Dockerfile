FROM node:20-bookworm

WORKDIR /app

COPY package.json ./package.json
RUN npm install

COPY . .

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200"]
