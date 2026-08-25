alter table room_info
add foreign key (stay_id)
references stay_info(stay_id);

ALTER TABLE stay_info MODIFY COLUMN host_id INT NOT NULL;

ALTER TABLE stay_info
ADD CONSTRAINT fk_stay_host
FOREIGN KEY (host_id)
REFERENCES host_info(host_id);