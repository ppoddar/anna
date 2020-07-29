-- ==================================================
--   Predefine roles and users
-- ==================================================
BEGIN TRANSACTION;

	INSERT INTO ROLES (NAME,DESCRIPTION) VALUES ('admin',    'adminstrator');
	INSERT INTO ROLES (NAME,DESCRIPTION) VALUES ('customer', 'customers and testers');
	INSERT INTO ROLES (NAME,DESCRIPTION) VALUES ('kitchen',  '');
	INSERT INTO ROLES (NAME,DESCRIPTION) VALUES ('delivery', '');
	INSERT INTO ROLES (NAME,DESCRIPTION) VALUES ('packing',  '');
	INSERT INTO ROLES (NAME,DESCRIPTION) VALUES ('guest',    '');

COMMIT;
