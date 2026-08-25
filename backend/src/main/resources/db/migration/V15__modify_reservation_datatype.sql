ALTER TABLE reservation
    MODIFY COLUMN user_id INT NOT NULL;

ALTER TABLE reservation
ADD CONSTRAINT fk_reservation_user
FOREIGN KEY (user_id)
REFERENCES user_info(user_id);