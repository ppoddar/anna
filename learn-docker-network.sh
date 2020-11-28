#/bin/sh

docker  network create mynet
docker run --netywork=mynet 
