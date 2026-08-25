ALTER TABLE host_info
    ADD COLUMN approved_at DATETIME NULL AFTER status;
