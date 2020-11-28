#!/bin/sh
# -----------------------------------------------
#  Runs hiraafood server in production on AWS EC2
# -----------------------------------------------
HOME_DIR=.
PEM=$HOME_DIR/bin/anna.pem
REMOTE_HOST=hiraafood.com
EC2_USER=ec2-user

# stop and remove all running containers
# build docker container from github
# run a docker contaiiner on bridge network

# the databsae is brigde gateway IP
ssh -tt  -i $PEM $EC2_USER@$REMOTE_HOST << 'EOSSH'
    export PGDATA=/var/lib/pgsql9/data
    sudo service postgresql restart
    docker container ls -a | awk 'NR > 1 {print $1}' | xargs docker stop 
    docker container ls -a | awk 'NR > 1 {print $1}' | xargs docker rm 
    docker build -q --tag hiraafood  https://github.com/ppoddar/anna.git
    docker run -d --name hiraafood --publish 80:8080  hiraafood
   exit
EOSSH

