#/bin/sh
LOG_FILE=some.log
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m' 
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'


error_count=$(grep -i error "$LOG_FILE" | wc -l)
    if [[ "$error_count" -gt 0 ]]; then
        echo -e ${COLOR_RED}there are $error_count errors in $LOG_FILE ${COLOR_RESET}
        cat $LOG_FILE
    else 
        echo -e ${COLOR_GREEN}started application. See log in $LOG_FILE ${COLOR_RESET}
    fi
