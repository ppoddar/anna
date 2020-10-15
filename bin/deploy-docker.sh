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

# -------------------------------
# commit everything
pushd $HOME_DIR > /dev/null
git add -A 
git commit -m "dockerize"
git push origin master
popd > /dev/null
# -------------------------------
# check out GIT REPO in a fresh directory
# Build a docker image
# run the image in host network. 
# The database is running on host. So it can be reached via localhost
# The node.js application is running at PORT 80 
ssh -tt  -i $PEM $PROD_USER@$REMOTE_HOST << EOSSH
    rm -rf $WDIR
    git clone https://github.com/$GIT_USER/$GIT_REPO
    cd $WDIR
    docker build -t anna .
    docker ps -aq | xargs docker stop
    docker run -t --network=host --rm anna &
    sleep 2 
    node src/populate_objects.js -d data/menu/
    exit 0
EOSSH

