    BEGIN;
    -- Insert admin user
    INSERT INTO USERS (ID,NAME,EMAIL,PHONE,PASSWORD,IMAGE)
    VALUES ('admin','Hiraafood Application Administrator',
            'admin@hiraafood.com','+14692475035',
            crypt('adm1n',gen_salt('bf')),'');

    INSERT INTO ADDRESSES (KIND, OWNER, LINE1, LINE2, CITY, ZIP, TIPS)
    VALUES ('home', 'admin', '2500 Carlmont Drive','Unit 12','Belmont', '94002', '');

    INSERT INTO USER_ROLES (USER_FK, ROLE_FK) VALUES ('admin', 'admin');

    COMMIT;
