-- Data for table 'account'
INSERT INTO public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
)
VALUES ('Tony',
		'Stark',
		'tony@starkent.com',
		'Iam1ronM@n');

-- Modify account type dor user ID 1 in table 'account'
UPDATE "account" 
    SET account_type = 'Admin' 
    Where account_id = 1;

-- Delete newly added user so the user with account id 1
DELETE FROM "account" 
    WHERE account_id = 1;

--Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors"
UPDATE "inventory" 
    SET inv_description = REPLACE (inv_description, 'small interiors', 'huge interior')
    WHERE inv_id = 10;

--Use an inner join to select the make and model fields from the inventory table and the classification name field from the classification table for inventory items 
--that belong to the "Sport" category.
SELECT   
    inventory.inv_make,
    inventory.inv_model,
    classification.classification_name   
FROM
    inventory
INNER JOIN classification
    ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';

--Update all records in the inventory table to add "/vehicles" to the middle of the file path in 
--the inv_image and inv_thumbnail columns using a single query.
UPDATE "inventory"
SET 
	inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
	inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');