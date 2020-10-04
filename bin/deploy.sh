#!/bin/sh
DOCKER_ACCOUNT=ppoddar
DOCKER_REPO=anna
IMAGE_TAG=latest
DOCKER_IMAGE=$DOCKER_ACCOUNT/$DOCKER_REPO:$IMAGE_TAG
REMOTE=0
SRC=git@github.com:ppoddar/anna.git 

function create_docker_image {
    echo create docker image $SRC
    docker build -q $SRC -t $DOCKER_IMAGE
    docker push $DOCKER_IMAGE
}
function copy_image {
    echo 'copy docker image'
}
function run_image {
    echo 'run docker image'
    docker run --rm $DOCKER_IMAGE
}

function populate_menu {
    echo 'populate menu'
}


create_docker_image
if [ $REMOTE -eq 0 ]; then
  run_image
  populate_menu
fi
