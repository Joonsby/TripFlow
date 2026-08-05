UPDATE favorite_plan
SET user_id = NULL;

UPDATE mileage
SET user_id = NULL;

UPDATE pending_reservation
SET user_id = NULL;

UPDATE wish_list
SET user_id = NULL;

ALTER TABLE favorite_plan
    MODIFY COLUMN user_id INT NULL;

ALTER TABLE mileage
    MODIFY COLUMN user_id INT NULL;

ALTER TABLE pending_reservation
    MODIFY COLUMN user_id INT NULL;

ALTER TABLE wish_list
    MODIFY COLUMN user_id INT NULL;