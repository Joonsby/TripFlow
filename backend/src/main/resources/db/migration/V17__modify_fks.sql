-- wish_list.user_id -> user_info.user_id
ALTER TABLE wish_list
ADD FOREIGN KEY (user_id)
REFERENCES user_info(user_id);

-- wish_list.room_id -> room_info.room_id
ALTER TABLE wish_list
ADD FOREIGN KEY (room_id)
REFERENCES room_info(room_id);

-- planner.reservation_id -> reservation.reservation_id
ALTER TABLE planner
ADD FOREIGN KEY (reservation_id)
REFERENCES reservation(reservation_id);

-- code_group.code_id -> code.code_id
ALTER TABLE code_group
ADD FOREIGN KEY (group_code)
REFERENCES code(group_code);

-- pending_reservation.user_id -> user_info.user_id
ALTER TABLE pending_reservation
ADD FOREIGN KEY (user_id)
REFERENCES user_info(user_id);

-- pending_reservation.room_id -> room_info.room_id
ALTER TABLE pending_reservation
ADD FOREIGN KEY (room_id)
REFERENCES room_info(room_id);

-- stay_facility.facility_code -> facility.facility_code
ALTER TABLE stay_facility
ADD FOREIGN KEY (facility_code)
REFERENCES facility(facility_code);

-- favorite_plan.plan_id -> planner.plan_id
ALTER TABLE favorite_plan
ADD FOREIGN KEY (plan_id)
REFERENCES planner(plan_id);

-- favorite_plan.user_id -> user_info.user_id
ALTER TABLE favorite_plan
ADD FOREIGN KEY (user_id)
REFERENCES user_info(user_id);

-- detail_plan.plan_id -> planner.plan_id
ALTER TABLE detail_plan
ADD FOREIGN KEY (plan_id)
REFERENCES planner(plan_id);

-- mileage.user_id -> user_info.user_id
ALTER TABLE mileage
ADD FOREIGN KEY (user_id)
REFERENCES user_info(user_id);

-- stay_facility.stay_id -> stay_info.stay_id
ALTER TABLE stay_facility
ADD FOREIGN KEY (stay_id)
REFERENCES stay_info(stay_id);