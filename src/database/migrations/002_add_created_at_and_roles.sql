-- migrate:up
-- Add created_at column to users table
ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('admin'), ('employee');

-- Migrate existing user roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = u.role;

-- Drop role column from users table
ALTER TABLE users DROP COLUMN role;

-- migrate:down
-- Add back role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(50);

-- Migrate roles back to users table
UPDATE users u
SET role = r.name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = u.id;

-- Drop junction table
DROP TABLE user_roles;

-- Drop roles table
DROP TABLE roles;

-- Drop created_at column
ALTER TABLE users DROP COLUMN created_at; 