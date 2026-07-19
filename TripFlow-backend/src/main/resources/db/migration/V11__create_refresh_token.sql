CREATE TABLE refresh_token (
    refresh_token_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_refresh_token_hash
       UNIQUE (token_hash),

    CONSTRAINT fk_refresh_token_user
       FOREIGN KEY (user_id)
           REFERENCES user_info(user_id)
           ON DELETE CASCADE
);

CREATE INDEX idx_refresh_token_user_id
    ON refresh_token(user_id);

CREATE INDEX idx_refresh_token_expires_at
    ON refresh_token(expires_at);