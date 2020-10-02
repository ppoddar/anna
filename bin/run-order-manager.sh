#!/bin/bash
# --------------------------------------------------------------
#  runs application. 
#  pre-requisites: 
#      database is initialized
#      schema is defined
#      data is populated
#      
# This script assumes that its parent directory contains root directory 
# --------------------------------------------------------------
function usage {
cat << EOF

    runs hiraafood order management server

    Usage: ${BASH_SOURCE[0]} [-p] [--secure] [--log] [-h|--help|-?] 
    where
       -p PORT       listening port (required)
       --secure      runs as https server (optional)
       --log         log file location. (option. If not specifed logs on console)
       --debug       comma-separted list of modules to debug e.g item-service,user-service
       -h|-?|--help  print this help message and exit
EOF
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
HOME_DIR=`cd $DIR/..;pwd`
APP=order-manager
HELP=0
SECURE=0
unset $NODE_DEBUG
# ---------------------------- Process command-line options --------------------
while [[ $# -gt 0 ]]; do
   key="$1"
   case $key in 
    -p|--port)
        PORT="$2"
        shift
        shift
        ;;
    --secure)
        SECURE=1
        shift
        ;;
    --log)
        LOG_FILE="$2"
        shift
        shift
        ;;
    --debug)
        export NODE_DEBUG=DATABASE,item-service,user-service
        shift
#        shift
        ;;
    -h|--help|-?)
      HELP=1
      shift
      ;;
   *)
     echo unknown option $key
     usage
     shift
     exit 1
     ;;
   esac
done 

if [[ HELP -eq 1 ]];then
    usage
    exit 0
fi


if [[ -z $HOME_DIR/src ]];then
    echo ***ERROR: The source directory $HOME_DIR/src does not exist. 
    exit 1
fi
# -----------------------------------------------------------------
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m' 
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'


if [[ -z $PORT ]]; then
    echo -e ${COLOR_RED} ***WARN: no port specified. Use -p option. Exiting...${COLOR_RESET}
    exit 0
fi

$DIR/stop-app.sh $APP $PORT

NODE_OPTIONS='--inspect --trace-exit --trace-warnings --trace-uncaught --title='"$APP"
if [[ $SECURE -eq 0 ]];then
    APPLICATION_ARGS=' -p '$PORT
else
    APPLICATION_ARGS=' --secure -p '$PORT 
fi 

LOG_FILE=$HOME_DIR/hiraafood.log
APPLICATION=$HOME_DIR/$APP/app.js
# running in background will exit this shell script
echo -e ${COLOR_GREEN}Running node process ${NODE_ENV} ${COLOR_RESET}
if [[ $NODE_ENV == 'production' ]];then
    echo -e ${COLOR_GREEN}logging to $LOG_FILE${COLOR_RESET}
    nodemon $NODE_OPTIONS $APPLICATION -- $APPLICATION_ARGS <&- > $LOG_FILE &
else 
    nodemon $NODE_OPTIONS $APPLICATION -- $APPLICATION_ARGS <&-  &
fi
