#!/bin/bash

function usage {
cat << EOF
    Usage: ${BASH_SOURCE[0]} [-r|--remote] [--secure] [-p] [-h|--help|-?] 
    where
       --remote      installs remotely. Defaults false
       --secure      uses https protocol. Defaults false.
       --db          initializes database. Defaults false
       --pwd         asks for a admin password. 
       -p            listening port.
       -h|-?|--help  print this help message and exit
EOF
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
HOME_DIR=`cd $DIR/..;pwd`
APP=hiraafood
ZIPFILE=$APP.zip
REMOTE_USER=ec2-user
REMOTE_HOST=3.208.222.186
PEM=$DIR/aws.pem
REMOTE_DIR=/home/$REMOTE_USER/$APP
DEPLOY_ROOT=$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR 

# command-line options
DATABASE=0
ASK_PASSWORD=0
REMOTE=0
HELP=0
PREPARE=0
SECURE=0
# ---------------------------- Process command-line options --------------------
while [[ $# -gt 0 ]]; do
   key="$1"
   case $key in 
    -r|--remote)
     REMOTE=1
     shift
     ;;
    --db)
    DATABASE=1
    shift
    ;;
    --pwd)
    ASK_PASSWORD=1
    shift
    ;;
    --prepare)
        PREPARE=1
        shift
        ;;
    -p|--port)
        PORT="$2"
        shift
        shift
        ;;
    --secure)
        SECURE=1
        shift
        ;;
    -h|--help|-?)
      HELP=1
      shift
      ;;
   *)
     echo unknown option $key
     usage
     shift
     exit
     ;;
   esac
done 


function package {
    echo packaging $ZIPFILE
    zip -q -r -D $ZIPFILE . -x \
        *.git/**\* \
        node_modules/**\* \
        test/**\* \
        bin/**\* \
        package-lock.json  
    ls -l $ZIPFILE
}
if [[ HELP -eq 1 ]];then
    usage
    exit
fi

# kill node process of given title
# Assumption: the node process is started with $APP title
function stop_process {
    echo stop process
}
# -----------------------------------------------------------------
# actual deployment begins here.
# For remote deployment, all required files are ziped
# and shipped to remote site. Then steps similar to local
# deployment are executed in remote host over SSH
# -----------------------------------------------------------------


pushd $HOME_DIR >&-

else  # local deployment
COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'
COLOR_RESET='\033[0m' # No Color
if [[ $DATABASE -eq 1 ]]; then
    echo -e ${COLOR_GREEN} setting up  database.${COLOR_RESET}
    pushd ./database >> /dev/null
    ./deploy-database.sh $ASK_PASSWORD
    if [[ $? -ne 0 ]]; then
        echo -e ${COLOR_RED} ***ERROR: error setting up  database.${COLOR_RESET}
        exit 1
    fi
    popd >&-
fi

    if [ -z $PORT ]; then
        #echo -e ${COLOR_YELLOW} ***WARN: no port specified for local deployment. Exiting...${COLOR_RESET}
        exit 0
    fi
    echo --------------------------------------------------------------
    echo -e ${COLOR_GREEN}     deploying $APP application  ${COLOR_RESET} 
    echo --------------------------------------------------------------
    
    echo kill node process named $APP and listening on port $PORT
    ps -ef | grep nodemon | grep -v grep | awk '{print $2}' | xargs kill -9
    lsof -nP -iTCP:$PORT  | grep node    | awk '{print $2}' | xargs kill -9
    
    APPLICATION=app.js
    NODE_OPTIONS='--trace-exit --trace-warnings --trace-uncaught --title='"$APP"
    if [[ $SECURE -eq 0 ]];then
        APPLICATION_ARGS=' -p '$PORT
    else
        APPLICATION_ARGS=' --secure -p '$PORT 
    fi 
    # running in baclground will exit this shell script
    nodemon $NODE_OPTIONS $APPLICATION -- $APPLICATION_ARGS &
fi


if [[ $REMOTE -eq 1 ]];then
    package
    scp -i $PEM    $ZIPFILE $DEPLOY_ROOT/$ZIPFILE
    ssh -T -i $PEM $REMOTE_USER@$REMOTE_HOST << EOSSH
        cd $REMOTE_DIR
        unzip -q -u -X -o $ZIPFILE
        pkill -f $APP
        source ./database/setup-database.sh
        npm -q -g --no-package-lock install
        nodemon --trace-uncaught --title=$APP app.js -- -p 8443 --secure
        ln -f -v -s hiraafood.log ./public/admin/hiraafood.log 
EOSSH

popd >&-