#!/bin/sh
# 

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
HOME_DIR=`cd $DIR/..;pwd`

PEM=$DIR/anna.pem
REMOTE_HOST=hiraafood.com
PROD_USER=ec2-user
GIT_USER=ppoddar
GIT_REPO=anna.git
WDIR=anna

pushd $HOME_DIR > /dev/null
git add -A 
git commit -m "dockerize"
git push origin master
popd > /dev/null
ssh -tt  -i $PEM $PROD_USER@$REMOTE_HOST << EOSSH
    rm -rf $WDIR
    git clone https://github.com/$GIT_USER/$GIT_REPO
    cd $WDIR
    docker build -t anna .
    docker run -d --network=host --rm anna 
    exit 0
EOSSH
exit 0