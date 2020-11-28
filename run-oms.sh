#!/bin/sh

#docker network create -d bridge --subnet 192.168.0.0/24 --gateway $IP $NETWORK
APP_NAME=anna
# write the build number on a fine called build.txt
BUILD_NUMBER=`date '+%s' && echo $EPOCHSECONDS`
cat << EOM > info.json
 {
     "name": "$APP_NAME",
     "vesion":"${BUILD_NUMBER}"
 }
EOM


docker build -t $APP_NAME .
docker run -p80:8080 --rm --name $APP_NAME $APP_NAME