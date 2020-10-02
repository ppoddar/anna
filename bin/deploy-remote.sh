#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
HOME_DIR=`cd $DIR/..;pwd`
APP=hiraafood
SANTITY_CHECK=0
ZIPFILE=$APP.zip
USER=ec2-user
#REMOTE_HOST=3.208.222.186
REMOTE_HOST=hiraafood.com
PEM=$DIR/aws.pem
REMOTE_DIR=/home/$USER/$APP
DEPLOY_ROOT=$USER@$REMOTE_HOST:$REMOTE_DIR 


pushd $HOME_DIR >&-

ADMIN_USER_SQL=$HOME_DIR/database/define-admin-user.sql
source $DIR/generate-admin-password.sh > $ADMIN_USER_SQL

if [[ $SANTITY_CHECK -ne 0 ]]; then
    echo starting  a stage server ...
    $DIR/run-app.sh -p 8080 &
    sleep 5
    echo running the sanity tests 
    /usr/local/bin/mocha --bail $HOME_DIR/test/test-*.js
    if [[ $? != 0 ]]; then
        echo test failed
        exit 1
    fi
    $DIR/stop-app.sh 8080
fi
# copy the artifacts to remote host
rsync -a --progress -r -e "ssh -i $PEM" \
    --files-from=$DIR/rsync.list        \
    $HOME_DIR $DEPLOY_ROOT

COLOR_RED='\033[0;31m'
    COLOR_RESET='\033[0m' 
    COLOR_GREEN='\033[0;32m'
 
# If you need to assign variables within the heredoc block, put the opening heredoc in single quotes.
ssh -tt  -i $PEM $USER@$REMOTE_HOST << 'EOSSH'
    PORT=8443
    COLOR_RED='\033[0;31m'
    COLOR_RESET='\033[0m' 
    COLOR_GREEN='\033[0;32m'
    COLOR_YELLOW='\033[0;33m'
    LOG_FILE=order-manager.log

    sudo yum -y update
    cd hiraafood
    source ./database/setup-database.sh
    npm -q -g --no-package-lock install
    export NODE_ENV=production
    pkill -9 nodemon
    pkill -9 node
    nohup node order-manager/app.js --secure -p $PORT </dev/null 1>$LOG_FILE 2>error.log &
    status=$?
    if [[ $status -eq 0 ]];then
        echo -e ${COLOR_GREEN} started application. see log file in $LOG_FILE ${COLOR_RESET}
    else
        echo -e ${COLOR_RED} error in starting application${COLOR_RESET}
        cat error.log

    fi
    exit $status
EOSSH
if [[ $? -eq 0 ]];then
        echo -e ${COLOR_GREEN} started application. ${COLOR_RESET}
        open https://hiraafood.com/
else
        echo -e ${COLOR_RED} error in starting application${COLOR_RESET}
fi
popd >&-
