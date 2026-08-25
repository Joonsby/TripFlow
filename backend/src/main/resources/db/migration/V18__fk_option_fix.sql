/* =========================================================
   1. code / code_group FK 방향 수정

   기존:
   code_group.group_code -> code.group_code   (잘못된 방향)

   변경:
   code.group_code -> code_group.group_code
   ========================================================= */

-- 기존 잘못된 FK 제거
ALTER TABLE code_group
DROP FOREIGN KEY code_group_ibfk_1;

-- 올바른 방향으로 FK 추가
ALTER TABLE code
ADD FOREIGN KEY (group_code)
REFERENCES code_group(group_code);



/* =========================================================
   2. wish_list 복합 PK 추가

   한 사용자가 같은 객실을 중복 찜하는 것을 방지
   PK: (user_id, room_id)
   ========================================================= */

ALTER TABLE wish_list
MODIFY COLUMN user_id INT NOT NULL,
ADD PRIMARY KEY (user_id, room_id);



/* =========================================================
   3. favorite_plan 복합 PK 추가

   한 사용자가 같은 플랜을 중복 즐겨찾기하는 것을 방지
   PK: (user_id, plan_id)
   ========================================================= */

ALTER TABLE favorite_plan
MODIFY COLUMN user_id INT NOT NULL,
ADD PRIMARY KEY (user_id, plan_id);



/* =========================================================
   4. mileage.user_id PK 지정

   사용자 1명당 mileage 행 1개만 존재
   user_id = PK + FK
   ========================================================= */

ALTER TABLE mileage
MODIFY COLUMN user_id INT NOT NULL,
ADD PRIMARY KEY (user_id);



/* =========================================================
   5. detail_plan에 별도 PK 추가

   하나의 planner에 여러 detail_plan이 존재할 수 있으므로
   plan_id를 PK로 만들지 않고 detail_plan_id를 별도로 생성
   ========================================================= */

ALTER TABLE detail_plan
ADD COLUMN detail_plan_id INT NOT NULL AUTO_INCREMENT FIRST,
ADD PRIMARY KEY (detail_plan_id);



/* =========================================================
   6. reservation.room_id FK 추가

   reservation.room_id -> room_info.room_id
   ========================================================= */

ALTER TABLE reservation
ADD FOREIGN KEY (room_id)
REFERENCES room_info(room_id);



/* =========================================================
   7. review_info.reservation_id UNIQUE

   예약 1건당 리뷰 최대 1개
   ========================================================= */

ALTER TABLE review_info
ADD UNIQUE (reservation_id);



/* =========================================================
   8. planner.reservation_id UNIQUE

   예약 1건당 플래너 최대 1개
   ========================================================= */

ALTER TABLE planner
ADD UNIQUE (reservation_id);