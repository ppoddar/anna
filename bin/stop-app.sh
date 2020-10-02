#!/bin/bash
# --------------------------------------------------------------
#  stop application secure or non-secure in a 
# --------------------------------------------------------------



DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
HOME_DIR=`cd $DIR/..;pwd`
APP=hiraafood


# -----------------------------------------------------------------
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m' 
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'

APP=${1:-hiraafood}
PORT=${2:-8080}
nprocess=`ps -ef | grep nodemon | grep -v grep | wc -l`
if [[ $nprocess -ne 0 ]];then
    echo -e ${COLOR_YELLOW}kill node process named $APP listening on port $PORT${COLOR_RESET}
    ps -ef | grep nodemon | grep -v grep | awk '{print $2}' | xargs kill -9
    lsof -nP -iTCP:$PORT  | grep node    | awk '{print $2}' | xargs kill -2
else
    echo -e ${COLOR_YELLOW}no app ${APP} at $PORT to stop${COLOR_RESET}
fi
