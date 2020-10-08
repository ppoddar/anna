#!/bin/sh
# ---------------------------------------------------------------------
# Deploy hiraafood application in docker comntainers either locally
# or in aws EC2
# ---------------------------------------------------------------------
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
HOME_DIR=`cd $DIR/..;pwd`

APPNAME=hiraafood
HOSTNAME=anna

DOCKER_USER=ppoddar
PROD_USER=ec2-user

DOCKER_REPO=anna
IMAGE_NAME=anna_image
DOCKER_IMAGE=$DOCKER_USER/$DOCKER_REPO:$IMAGE_NAME

GIT_URL=git@github.com:ppoddar/anna.git 

LOCALHOST=`ipconfig getifaddr en0`

REMOTE_HOST=0
SRC=.
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m' 
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'
PORT=8090

function warn {
    echo $COLOR_YELLOW***WARN:$1$COLOR_RESET
}
function error {
    echo $COLOR_RED***ERROR:$1$COLOR_RESET

}
function info {
    echo $COLOR_GREEN$1$COLOR_RESET
}

function process_command_line {
    while [[ $# -gt 0 ]]; do
        key=$1
        case $key in 
            -r)
                if [[ $# -eq 0 ]]; then 
                    REMOTE_HOST=x.y.z
                    warn  'no production host specified. Using default'$REMOTE_HOST
                else
                    REMOTE_HOST=$2
                    info  'deploying to '$REMOTE_HOST
                    shift
                fi
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
}

function get_latest_source {
    git pull
}

function check_uncommited {
    if [[ -z $(git status -s) ]]; then
        echo 
    else 
        if [[ -z $REMOTE_HOST ]]; then
            error 'can not deploy to production with uncommitted files'
            git status -s
            exit 1
        else
            warn 'there are uncommited files'
            UNCOMMITED=1
        fi
    fi
}

function create_docker_image {
    pushd $HOME_DIR > /dev/null
    info 'creating docker image '$DOCKER_IMAGE
    docker build $SRC -t $DOCKER_IMAGE
    popd > /dev/null
}

function push_docker_image {
    info 'pushing '$DOCKER_IMAGE
    docker login --username=$DOCKERHUB_USER; docker push $DOCKER_IMAGE
}


function populate_menu {
    echo 'populate menu'
    node $HOME_DIR/src/populate_objects.js -d $HOME_DIR/data/menu/
}

# -----------------------------------------------------------

process_command_line
if [[ -z $REMOTE_HOST ]]; then
    info 'deploying '$APPNAME' dockerized application in AWS EC2 host '$REMOTE_HOST
else
    info 'deploying '$APPNAME' dockerized application in stage'  
fi
check_uncommited
create_docker_image
push_docker_image
if [[ -z $REMOTE_HOST ]]; then
ssh -tt  -i $PEM $PROD_USER@$REMOTE_HOST << 'EOSSH'
    docker run --network host --hostname $HOSTNAME --rm $DOCKER_IMAGE 
EOSSH
else
    info 'running dockerized application. access it as port '$PORT
    docker run -d -p $PORT:8080 --rm $DOCKER_IMAGE
fi


sleep 2
populate_menu



