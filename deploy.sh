#!/bin/sh
# ---------------------------------------------------------------------
# Deploy hiraafood application in docker comntainers either locally
# or in aws EC2
# ---------------------------------------------------------------------
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
HOME_DIR=`cd $DIR;pwd`

APP_NAME=hiraafood
REMOTE=0
DOCKER_USER=ppoddar
PROD_USER=ec2-user

#GIT_URL=git@github.com:ppoddar/anna.git 

#LOCALHOST=`ipconfig getifaddr en0`

SRC=$HOME_DIR
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m' 
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'

function warn {
    echo $COLOR_YELLOW***WARN:$1$COLOR_RESET
}
function error {
    echo $COLOR_RED***ERROR:$1$COLOR_RESET

}
function info {
    echo $COLOR_GREEN$1$COLOR_RESET
}



function check_uncommited {
    if [[ -z $(git status -s) ]]; then
        echo 
    else 
        if [[ $REMOTE -eq 1 ]]; then
            error 'can not deploy to production with uncommitted files'
            git status -s
            exit 1
        else
            warn 'there are uncommited files'
            UNCOMMITED=1
        fi
    fi
}


function populate_menu {
    echo 'populate menu'
    node $HOME_DIR/src/populate_objects.js -d $HOME_DIR/data/menu/
}


# -----------------------------------------------------------
while [[ $# -gt 0 ]]; do
    key=$1
    case $key in 
        -r)
            REMOTE=1
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

if [[ $HELP -eq 1 ]]; then
    usage
    exit 0
fi

if [[ $REMOTE -eq 1 ]]; then
    REMOTE_HOST=hiraafood.com
    info 'deploying '$APPNAME' dockerized application to '$REMOTE_HOST
else
    info 'deploying '$APPNAME' dockerized application in stage'  
fi
check_uncommited
if [[ $REMOTE -eq 1 ]]; then
PEM=$HOME_DIR/bin/anna.pem
ssh -tt  -i $PEM $PROD_USER@$REMOTE_HOST << EOSSH
    docker build - --name $APP_NAME https://github.com/ppoddar/anna.git 
    docker run -d -p 80:8080 --rm --name $APP_NAME $ APP_NAME 
EOSSH
else
    info 'running dockerized application. access it at port http://127.0.0.1:80/'
    docker build -t $APP_NAME .
    docker run -p80:8080 --rm --name $APP_NAME $APP_NAME
fi


#sleep 2
#populate_menu



