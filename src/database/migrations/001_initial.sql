-- Migration: 001_initial

-- migrate:up
-- Tạo bảng theo dõi version của database
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'admin'))
);

-- Create equipment_types table
CREATE TABLE IF NOT EXISTS equipment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    image VARCHAR(255)
);

-- Create room_equipment table (weak entity between rooms and equipment_types)
CREATE TABLE IF NOT EXISTS room_equipment (
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    equipment_type_id UUID NOT NULL REFERENCES equipment_types(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    PRIMARY KEY (room_id, equipment_type_id)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Create supplies table
CREATE TABLE IF NOT EXISTS supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    in_stock INTEGER NOT NULL DEFAULT 0,
    image VARCHAR(255)
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'ready', 'rejected')),
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create request_items table for many-to-many relationship between requests and supplies
CREATE TABLE IF NOT EXISTS request_items (
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    supply_id UUID NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (request_id, supply_id)
);

-- Insert some common equipment types
INSERT INTO equipment_types (id, name) VALUES
    ('33333333-3333-3333-3333-333333333331', 'Projector'),
    ('33333333-3333-3333-3333-333333333332', 'Whiteboard'),
    ('33333333-3333-3333-3333-333333333333', 'TV Screen'),
    ('33333333-3333-3333-3333-333333333334', 'Conference Phone'),
    ('33333333-3333-3333-3333-333333333335', 'Webcam');

-- Insert initial admin and employee users with MD5 hashed passwords (password + "henry@cuong")
INSERT INTO users (id, username, password_hash, name, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin', MD5('adminhenry@cuong'), 'Admin User', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'employee', MD5('employeehenry@cuong'), 'Employee User', 'employee');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_request_items_supply_id ON request_items(supply_id);
CREATE INDEX IF NOT EXISTS idx_room_equipment_equipment_type_id ON room_equipment(equipment_type_id);

-- migrate:down
DROP INDEX IF EXISTS idx_room_equipment_equipment_type_id;
DROP INDEX IF EXISTS idx_request_items_supply_id;
DROP INDEX IF EXISTS idx_requests_status;
DROP INDEX IF EXISTS idx_requests_user_id;
DROP INDEX IF EXISTS idx_bookings_date;
DROP INDEX IF EXISTS idx_bookings_user_id;
DROP INDEX IF EXISTS idx_bookings_room_id;

DROP TABLE IF EXISTS request_items;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS supplies;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_equipment;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS equipment_types;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS schema_migrations; 