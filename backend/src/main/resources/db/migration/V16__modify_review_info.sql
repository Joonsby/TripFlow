ALTER TABLE review_info
MODIFY COLUMN reservation_id INT NOT NULL;

ALTER TABLE review_info
DROP PRIMARY KEY;

ALTER TABLE review_info
ADD COLUMN review_id INT NOT NULL AUTO_INCREMENT FIRST,
ADD PRIMARY KEY (review_id);

ALTER TABLE review_info
ADD FOREIGN KEY (reservation_id)
REFERENCES reservation(reservation_id);