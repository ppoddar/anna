#!/bin/sh
URL=https://download.postgresql.org/pub/repos/yum
VERSION=12
PLATFORM=edhat/rhel-6-x86_64

sudo yum install -y $URL/$VERSION/$PLATFORM/postgresql12-12.2-2PGDG.rhel6.x86_64.rpm 
sudo yum install -y $URL/$VERSION/$PLATFORM/postgresql12-libs-12.2-2PGDG.rhel6.x86_64.rpm