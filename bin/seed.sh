#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
API=${1:-http://localhost:8080}

. $DIR/seed-items.sh $API
. $DIR/seed-users.sh $API
