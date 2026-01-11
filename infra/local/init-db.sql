-- Define database names once in a temporary table
CREATE TEMP TABLE IF NOT EXISTS databases_to_create (db_name TEXT);

-- ADD NEW db_name TO CREATE NEW database
INSERT INTO databases_to_create (db_name) VALUES 
    ('users-service'),
    ('auth-service');

-- Create databases from temp databases_to_create table
SELECT format('CREATE DATABASE %I', db_name)
FROM databases_to_create
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = db_name)\gexec

-- Grant permissions
SELECT format('GRANT ALL PRIVILEGES ON DATABASE %I TO postgres', db_name)
FROM databases_to_create\gexec
