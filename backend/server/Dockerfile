FROM node:latest
WORKDIR /app
COPY . .
RUN npm i $(cat requirements.txt)
CMD nodejs start.js