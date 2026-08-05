ALTER TABLE reservation
    MODIFY COLUMN user_id INT NOT NULL;

ALTER TABLE stay_info
    MODIFY COLUMN host_id INT NOT NULL;

ALTER TABLE reservation
    DROP COLUMN new_user_id;

ALTER TABLE mileage
    DROP COLUMN new_user_id;

ALTER TABLE pending_reservation
    DROP COLUMN new_user_id;

ALTER TABLE wish_list
    DROP COLUMN new_user_id;