# docker build --pull --rm -f "Dockerfile" -t mileon-startup-server "."
# docker compose -f 'docker-compose.yml' up -d --build 
FROM node:lts-alpine3.20

WORKDIR /home/node/app
RUN npm i ws express socket.io fluent-ffmpeg @ffmpeg-installer/ffmpeg buffer


COPY ./index.js ./index.js
RUN chown -R node ../app
EXPOSE 8000
USER node
CMD ["node", "index.js"]       