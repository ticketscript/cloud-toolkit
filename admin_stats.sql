-- SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

-- Cleanup temporary tables
DROP TABLE IF EXISTS mem_accounts;
DROP TABLE IF EXISTS mem_channels;
DROP TABLE IF EXISTS mem_admin_stats_new;

-- START TRANSACTION;

-- Create temporary mem_accounts table
-- CREATE TEMPORARY TABLE mem_accounts
-- ENGINE = MyISAM

-- SELECT account_id, industry, contract
-- FROM accounts;

-- ALTER TABLE mem_accounts
-- ADD INDEX `i_account_id` USING BTREE (`account_id`);

-- Create temporary channels table
-- CREATE TEMPORARY TABLE mem_channels
-- ENGINE = MyISAM

-- SELECT channel_id, type
-- FROM channels;

-- ALTER TABLE mem_channels
-- ADD INDEX `i_channel_id` USING BTREE (`channel_id`);

-- Create new admin stats table
CREATE TABLE IF NOT EXISTS mem_admin_stats_new 
(
  id INT(11) AUTO_INCREMENT,
  event_id INT(10),
  event_name VARCHAR(50),
  genre VARCHAR(100),
  account_id INT(10),
  account_name VARCHAR(50),
  contract VARCHAR(10),
  industry VARCHAR(50),
  channel_id INT(11),
  channel_name VARCHAR(50),
  channel_type TINYINT(4),
  delivery_method INT(1),
  sold DECIMAL(26,0),
  payment_status TINYINT(4),
  payment_date DATE,
  PRIMARY KEY (id)
)
ENGINE = MyISAM;

-- Fill the new admin stats data
INSERT LOW_PRIORITY INTO mem_admin_stats_new (
  event_id, event_name, genre, account_id, account_name, contract,
  industry, channel_id, channel_name, channel_type, delivery_method,
  sold, payment_status, payment_date
)
SELECT
ot.event_id,
ot.event_name,
e.genre,

ot.account_id,
ot.account_name,
a.contract,
a.industry,

ot.channel_id,
ot.channel_name,
c.type AS channel_type,

o.delivery_method,
SUM( ot.number_of_persons ) sold,
ot.payment_status,
DATE( ot.payment_datetime ) AS payment_date

FROM order_tickets AS ot

LEFT JOIN events       AS e ON ot.event_id   = e.event_id
LEFT JOIN accounts     AS a ON ot.account_id = a.account_id
LEFT JOIN orders       AS o ON ot.order_id   = o.order_id
LEFT JOIN channels     AS c ON ot.channel_id = c.channel_id

WHERE ot.payment_status = 2

GROUP BY ot.event_id, ot.account_id, ot.channel_id, o.delivery_method, DATE(ot.payment_datetime);

ALTER TABLE `mem_admin_stats_new`
ADD INDEX `account_id` USING BTREE (`account_id`),
ADD INDEX `payment_date` USING BTREE (`payment_date`),
ADD INDEX `event_payment` USING BTREE (`event_id`, `payment_status`, `payment_date`);

DROP TABLE IF EXISTS mem_admin_stats;
RENAME TABLE mem_admin_stats_new TO mem_admin_stats;

-- COMMIT;

