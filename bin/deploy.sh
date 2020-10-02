#!/bin/sh

REMOTE=0
SRC=git@github.com/ppoddar/anna.git 

function create_docker_image {
    echo create docker image $SRC
    docker build $SRC
}
function copy_image {
    echo 'copy docker image'
}
function run_image {
    echo 'run docker image'
}

function populate_menu {
    echo 'populate menu'
}


create_docker_image
if [ $REMOTE -eq 0 ]; then
  copy_image
  run_image
  populate_menu
fi
