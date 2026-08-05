DROP TABLE host_info;

Alter TABLE favorite_plan
    DROP COLUMN new_user_id;

CREATE TABLE host_info (
    host_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,

    business_name VARCHAR(100) NOT NULL,
    representative_name VARCHAR(50) NOT NULL,
    business_number VARCHAR(20) NOT NULL,

    business_post_code VARCHAR(10) NOT NULL,
    business_road_address VARCHAR(150) NOT NULL,
    business_detail_address VARCHAR(150),

    introduction VARCHAR(500),

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(255),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (host_id),
    UNIQUE KEY uk_host_user_id (user_id),
    UNIQUE KEY uk_host_business_number (business_number),

    CONSTRAINT fk_host_user
        FOREIGN KEY (user_id)
        REFERENCES user_info(user_id)
);