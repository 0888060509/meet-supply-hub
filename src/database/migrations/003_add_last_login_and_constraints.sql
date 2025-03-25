-- migrate:up
-- Add last_login column
ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;

-- Add email column with unique constraint
ALTER TABLE users ADD COLUMN email VARCHAR(255);
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Add unique constraint to username
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Add status column with default value
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- migrate:down
ALTER TABLE users DROP COLUMN last_login;
ALTER TABLE users DROP COLUMN login_count;
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users DROP COLUMN status; 