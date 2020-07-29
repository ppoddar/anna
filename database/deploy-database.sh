#!/bin/bash

function ask_admin_password() {
    if [[ $ASK_PASSWORD -eq 1 ]];then
    read -s -p "administrator password:" PASSWORD
    echo
    read -s -p "retype password:" again
    echo
    if [ $PASSWORD != $again ]; then
        echo '***ERROR: passwords do not match! Try again'
        exit 1
    fi
else 
    PASSWORD=adm1n
fi
}

function create_admin_password() {
    SQL_FILE=$HOME_DIR/define-admin-user.sql
    #echo creating PSQL script to insert admin user PSQL script $SQL_FILE
    cat <<EOF > ${SQL_FILE}
    BEGIN;
    -- Insert admin user
    INSERT INTO USERS (ID,NAME,EMAIL,PHONE,PASSWORD,IMAGE)
    VALUES ('admin','Hiraafood Application Administrator',
            'admin@hiraafood.com','+14692475035',
            crypt('${PASSWORD}',gen_salt('bf')),'');

    INSERT INTO ADDRESSES (KIND, OWNER, LINE1, LINE2, CITY, ZIP, TIPS)
    VALUES ('home', 'admin', '2500 Carlmont Drive','Unit 12','Belmont', '94002', '');

    INSERT INTO USER_ROLES (USER_FK, ROLE_FK) VALUES ('admin', 'admin');

    COMMIT;
EOF
}

# -------------------------------------------------------------------------
# Processing begin with directory of the script location
HOME_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

ASK_PASSWORD=${1:-0}

if [[ ASK_PASSWORD -eq 0 ]]; then 
    PASSWORD=adm1n
else
    ask_admin_password
fi

create_admin_password
source $HOME_DIR/setup-database.sh


