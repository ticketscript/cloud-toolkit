
-- Truncate tables with environment-specific data
TRUNCATE TABLE `account_ga`;
TRUNCATE TABLE `api_access_token`;
TRUNCATE TABLE `api_shift`;
TRUNCATE TABLE `order_notification`;
TRUNCATE TABLE `reservation`;

-- Set privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON ticketscript2.* TO ticketscript2@"10.0.14.%" IDENTIFIED BY 'LukCWIq';
FLUSH PRIVILEGES;
