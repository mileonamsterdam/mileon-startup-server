# Commands
- mv config.js.template config.js
- docker build --pull --rm -f "Dockerfile" -t mileon-startup-server "."
- docker compose -f 'docker-compose.yml' up -d --build

# Setup
- to enable ssl, create key&cert(with certbot) and set absolute paths in config.js
- update the config.js: set allowed origins in allowedOrigins
    - all other origins will be blocked
- make sure ports 1111,2222,3333,4444 can be exposed on your system
- build the Dockerfile
- start container using docker-compose file