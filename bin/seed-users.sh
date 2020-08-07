#!/bin/sh
# -------------------------------------------------------
# insert item found in a directory
# -------------------------------------------------------
function createUser {
    curl -q -k -H "Content-Type:application/json" \
         -d @$1 $API/user/
}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
API=${1:-http://localhost:8080}

DATA_DIR=$DIR/data/users
FILES=`ls -1 $DATA_DIR/*.json`
for f in $FILES; do
    echo saving user at $f to $API
    createUser $f
done