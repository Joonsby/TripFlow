SET @current_schema = DATABASE();

SET @ddl = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = @current_schema
          AND table_name = 'host_info'
          AND column_name = 'opening_date'
    ),
    'SELECT 1',
    'ALTER TABLE host_info ADD COLUMN opening_date DATE NULL AFTER business_number'
);
PREPARE statement FROM @ddl;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @ddl = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = @current_schema
          AND table_name = 'host_info'
          AND column_name = 'latitude'
    ),
    'SELECT 1',
    'ALTER TABLE host_info ADD COLUMN latitude DECIMAL(10, 7) NULL AFTER business_detail_address'
);
PREPARE statement FROM @ddl;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @ddl = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = @current_schema
          AND table_name = 'host_info'
          AND column_name = 'longitude'
    ),
    'SELECT 1',
    'ALTER TABLE host_info ADD COLUMN longitude DECIMAL(10, 7) NULL AFTER latitude'
);
PREPARE statement FROM @ddl;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @ddl = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = @current_schema
          AND table_name = 'host_info'
          AND column_name = 'business_verified_at'
    ),
    'SELECT 1',
    'ALTER TABLE host_info ADD COLUMN business_verified_at DATETIME NULL AFTER approved_at'
);
PREPARE statement FROM @ddl;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @ddl = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = @current_schema
          AND table_name = 'host_info'
          AND column_name = 'host_policy_agreed_at'
    ),
    'SELECT 1',
    'ALTER TABLE host_info ADD COLUMN host_policy_agreed_at DATETIME NULL AFTER business_verified_at'
);
PREPARE statement FROM @ddl;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @ddl = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = @current_schema
          AND table_name = 'host_info'
          AND column_name = 'privacy_agreed_at'
    ),
    'SELECT 1',
    'ALTER TABLE host_info ADD COLUMN privacy_agreed_at DATETIME NULL AFTER host_policy_agreed_at'
);
PREPARE statement FROM @ddl;
EXECUTE statement;
DEALLOCATE PREPARE statement;

SET @ddl = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = @current_schema
          AND table_name = 'host_info'
          AND column_name = 'information_accuracy_agreed_at'
    ),
    'SELECT 1',
    'ALTER TABLE host_info ADD COLUMN information_accuracy_agreed_at DATETIME NULL AFTER privacy_agreed_at'
);
PREPARE statement FROM @ddl;
EXECUTE statement;
DEALLOCATE PREPARE statement;
