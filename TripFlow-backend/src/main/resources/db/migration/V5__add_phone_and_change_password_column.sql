ALTER TABLE user_info
    ADD COLUMN phone_number VARCHAR(20) NULL AFTER name,
    CHANGE COLUMN pw password_hash VARCHAR(255) NOT NULL;

ALTER TABLE user_info
    ADD CONSTRAINT uk_user_info_phone_number
        UNIQUE (phone_number);