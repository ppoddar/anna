#!/bin/sh
# ==================================================
#  - defines Hiraafood application schema
#  - loads stored procedures
#  - defines admin user
# ==================================================

#brew info postgres


DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DATABASE=anna
USER=postgres

echo defining database schema to $DATABASE database...
psql -q -d $DATABASE -U $USER -f $DIR/close-connection.sql > /dev/null
psql -q -d $DATABASE -U $USER  -f $DIR/ANNA-SCHEMA.sql
psql -q -d $DATABASE -U $USER  -f $DIR/seed-database.sql
# --------------------------------------------------
# The admin user is defined at deployment time insread
# of design time. Deployment process generats a PSQL
# file, this script executes it
# --------------------------------------------------
ADMIN_USER_SQL=$DIR/define-admin-user.sql
if test -f $ADMIN_USER_SQL; then
   psql -q -d $DATABASE -U $USER -f $ADMIN_USER_SQL
   rm $ADMIN_USER_SQL
else
   echo WARNING: admin user not defined. Not found file $ADMIN_USER_SQL
   exit 1
fi
