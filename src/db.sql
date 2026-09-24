create database if not exists rts;

use rts;

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

drop table if exists tokens;

create table tokens(
    id binary(16),
    created_at timestamp not null default current_timestamp(),
    primary key (id)
);

set global event_scheduler = on;

drop event if exists delete_expired_tokens;

-- Delete blacklisted tokens older than one hour every night at 2:00 am local
create event delete_expired_tokens
on schedule every 1 day
starts timestamp(current_date) + interval 1 day + interval 2 hour
do
    delete from bl_tokens where created_at < current_timestamp() - interval 1 hour;
