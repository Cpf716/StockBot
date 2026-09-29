create database if not exists stockbot;

use stockbot;

drop table if exists users;

create table users(
    id varchar(32) unique not null,
    password_hash binary(60) not null,
    login_at timestamp default null,
    login_failures tinyint unsigned not null default 0,
    created_at timestamp not null default current_timestamp(),
    modified_at timestamp default null on update current_timestamp(),
    primary key (id)
);

drop table if exists bl_tokens;

create table bl_tokens(
    id binary(16),
    created_at timestamp not null default current_timestamp(),
    primary key (id)
);

set global event_scheduler = on;

drop event if exists delete_expired_tokens;

-- Delete blacklisted tokens older than @exp hour(s) every night at 2:00 am local
set @exp = 1;

create event delete_expired_tokens
on schedule every 1 day
starts timestamp(current_date) + interval 1 day + interval 2 hour
do
    delete from bl_tokens where created_at < current_timestamp() - interval @exp hour;

-- Delete existing users, as bcrypt and argon2 hashes are incompatible with one another
-- Alternatively, you could add a new column to the database and rehash on login, eventually retiring bcrypt hashes
delete from users;

-- Modify password_hash column to accommodate argon2 (alternatively, add new column)
alter table users modify password_hash varchar(255) not null;

-- drop index idx_id_lower on users;

-- Index user IDs without respect to case
alter table users add unique index idx_id_lower ((lower(id)));