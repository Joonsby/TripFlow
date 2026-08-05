ALTER TABLE user_info
    ADD CONSTRAINT uk_user_info_email UNIQUE (email);