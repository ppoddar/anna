#!/bin/sh
# 
PEM=anna.pem
REMOTE_HOST=hiraafood.com
PROD_USER=ec2-user
GIT_USER=ppoddar
GIT_REPO=anna.git
WDIR=anna

ssh -tt  -i $PEM $PROD_USER@$REMOTE_HOST << EOSSH
    git clone https://github.com/$GIT_USER/$GIT_REPO
    cd $WDIR
    docker build -t anna .
    docker run -t -p $PORT:8080 --network=host --rm anna 
EOSSH
exit 0