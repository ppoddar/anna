#!/bin/bash
# -----------------------------------------------------------------
# installs Postgres in AWS
# creats a database in EC2
# -----------------------------------------------------------------
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP=hiraafood
USER=ec2-user
#REMOTE_HOST=3.208.222.186
REMOTE_HOST=hiraafood.com
PEM=$DIR/../bin/aws.pem
REMOTE_DIR=/home/$USER/$APP
DEPLOY_ROOT=$USER@$REMOTE_HOST:$REMOTE_DIR 

PGDATA_DIR=/var/lib/pgsql/data

ssh -tt -i $PEM $USER@$REMOTE_HOST << EOSSH
sudo amazon-linux-extras enable postgresql11
sudo yum clean metadata
sudo yum install postgresql
sudo rm -rf ${PGDATA_DIR}
/usr/bin/postgresql-setup --initdb
cp pg_hba.conf     $PGDATA_DIR
cp postgresql.conf $PGDATA_DIR
pg_ctl start -D ${PGDATA_DIR}
psql -d postgres -w << EOF
    CREATE DATABASE anna;
    CREATE EXTENSION pgcrypto;

    CREATE ROLE dba WITH LOGIN PASSWORD 'passw0rd';
    ALTER ROLE dba SUPERUSER;
    GRANT ALL PRIVILEGES ON DATABASE anna TO dba;
    \du
    \q
EOF

exit 0
EOSSH
