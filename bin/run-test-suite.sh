#!/bin/bash
# --------------------------------------------------------
# Runs test against a server
# --------------------------------------------------------
function usage {
    cat << EOF
        Usage: ${BASH_SOURCE[0]} [-u] [-h|--help|-?] 
        where
        -u  target server URL to be tested
        -h|-?|--help  print this help message and exit
EOF
}

DIR=<quote>$( cd <quote>$( dirname <quote>${BASH_SOURCE[0]}<quote> )<quote> >/dev/null 2>&1 && pwd )<quote>
HOME_DIR=`cd $DIR/..;pwd`
APP=hiraafood

# command-line options
HELP=0
URL=http://localhost:8080/
APP=Hiraafood
# ---------------------------- Process command-line options --------------------
while [[ $# -gt 0 ]]; do
   key=<quote>$1<quote>
   case $key in 
    -u)
        URL=$2
        shift
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

pushd $HOME_DIR >&-

COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'
COLOR_RESET='\033[0m' # No Color

    echo --------------------------------------------------------------
    echo -e ${COLOR_GREEN} testing $URL ${COLOR_RESET} 
    echo --------------------------------------------------------------
    
    # running in baclground will exit this shell script
    nodemon $NODE_OPTIONS $APPLICATION -- $APPLICATION_ARGS &
    mocha -b test/test-*.js $URL
    if [[ $? -eq 0 ]]; then
        echo test success
    else
            echo test failed

    fi
popd >&-