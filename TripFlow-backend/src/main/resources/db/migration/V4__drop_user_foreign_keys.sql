ALTER TABLE favorite_plan
DROP FOREIGN KEY fk_fav_user_info;

ALTER TABLE mileage
DROP FOREIGN KEY mileage_ibfk_1;

ALTER TABLE pending_reservation
DROP FOREIGN KEY fk_pending_user;

ALTER TABLE wish_list
DROP FOREIGN KEY user_id;