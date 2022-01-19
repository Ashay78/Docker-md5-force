# Docker md5 force

## installation

1. npm install
2. npm run serve
3. npm run start

Add slave : ```docker run --rm  --init itytophile/hash-slave ws://address:port```

## Docker

1. ```docker-compose up --build```
2. ```docker-compose up -d --no-recreate --scale slave={nb slave}```

## Warning

Pour l'instant dans le docker compose il faut remplacer l'adresse ip du slave par celle du pc.
