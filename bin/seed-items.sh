#!/bin/sh
# ============================================
# ============================================
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DATA_DIR=$DIR/data/items

# -------------------------------------------------------
# insert item found in a directory
# -------------------------------------------------------
function createItem {
    curl -q -k -H "Content-Type:application/json" \
         -d @$1 $API/item/
}

FILES=`ls -1 $DATA_DIR/*.json`
API=${1:-http://localhost:8080}
for f in $FILES; do
    echo saving item at $f to $API
    createItem $f
done