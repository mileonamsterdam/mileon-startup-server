# Setup cert
- make sure port 80 can be exposed on your system
- in certbot/
    - cp .env.template .env
    - configure EMAIL&DOMAIN in .env file
    - start container using docker-compose file
    - when finished, .pems will be stored in data/live/DOMAIN/ and will be valid 3months max

# Setup server
- to enable ssl, create key,ca&cert(with certbot) and set the paths in config.js
- update the config.js: set allowed sites in allowedOrigins
    - all other will be blocked
- make sure ports 1111,2222,3333 can be exposed on your system
- build the Dockerfile
- start container using docker-compose file

## Commands
- cp config.js.template config.js
- docker build --pull --rm -f "Dockerfile" -t mileon-startup-server "."
- docker compose -f 'docker-compose.yml' up -d --build
- docker compose up
- docker compose down
- docker compose logs
- sudo chown -R user:group certbot/data/

# certbot successmsg
````
certbot  | Saving debug log to /var/log/letsencrypt/letsencrypt.log
certbot  | Account registered.
certbot  | Requesting a certificate for XXXDOMAIN.XXXX
certbot  | 
certbot  | Successfully received certificate.
certbot  | Certificate is saved at: /etc/letsencrypt/live/XXXDOMAIN.XXXX/fullchain.pem
certbot  | Key is saved at:         /etc/letsencrypt/live/XXXDOMAIN.XXXX/privkey.pem
certbot  | This certificate expires on DATE.
certbot  | These files will be updated when the certificate renews.
certbot  | NEXT STEPS:
certbot  | - The certificate will need to be renewed before it expires. Certbot can automatically renew the certificate in the background, but you may need to take steps to enable that functionality. See https://certbot.org/renewal-setup for instructions.
certbot  | 
certbot  | - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
certbot  | If you like Certbot, please consider supporting our work by:
certbot  |  * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
certbot  |  * Donating to EFF:                    https://eff.org/donate-le
certbot  | - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
````

### snippets
````
        requestCert: false,
        rejectUnauthorized: false
````        