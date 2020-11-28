#!/bin/sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
HOME_DIR=`cd $DIR/..;pwd`

PEM=$HOME_DIR/bin/anna.pem
IP=hiraafood.com
#IP=3.6.40.75
#65.0.220.124
ssh -i $PEM ec2-user@$IP
