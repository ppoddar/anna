#!/bin/bash

function ask_admin_password() {
    if [[ $ASK_PASSWORD -eq 1 ]];then
    read -s -p <quote>administrator password:<quote> PASSWORD
    echo
    read -s -p <quote>retype password:<quote> again
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
    
cat << EOF 
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

ask_admin_password
create_admin_password


