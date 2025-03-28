-- migrate:up
-- Tạo enum cho room status
CREATE TYPE room_status AS ENUM ('Available', 'Under Maintenance', 'Reserved');
CREATE TYPE room_event_type AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'EQUIPMENT_CHANGE', 'IMAGE_CHANGE');

-- Tạo bảng Rooms với đầy đủ các trường
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE CHECK (length(name) >= 1),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location VARCHAR(255) NOT NULL,
    status room_status NOT NULL DEFAULT 'Available',
    image VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng Equipment (Master Data)
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Tạo bảng RoomEquipment (Junction Table)
CREATE TABLE room_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, equipment_id)
);

-- Tạo bảng RoomAuditLog
CREATE TABLE room_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    event_type room_event_type NOT NULL,
    field_name VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    status room_status,
    notes TEXT,
    updated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo indexes
CREATE INDEX idx_rooms_name ON rooms(name);
CREATE INDEX idx_rooms_location ON rooms(location);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_room_audit_log_room_id ON room_audit_log(room_id);
CREATE INDEX idx_room_audit_log_created_at ON room_audit_log(created_at);

-- Seed initial data cho bảng Equipment
INSERT INTO equipment (id, name, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Projector', 'High-resolution projector for presentations'),
    ('22222222-2222-2222-2222-222222222222', 'Whiteboard', 'Large whiteboard for brainstorming'),
    ('33333333-3333-3333-3333-333333333333', 'Video Conference System', 'Professional video conferencing equipment'),
    ('44444444-4444-4444-4444-444444444444', 'TV Screen', 'Large display screen for presentations'),
    ('55555555-5555-5555-5555-555555555555', 'Flipchart', 'Portable flipchart for presentations');

-- Seed initial data cho bảng Rooms
INSERT INTO rooms (id, name, capacity, location, status, is_active) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Conference Room A', 20, '1st Floor, East Wing', 'Available', true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Small Meeting Room B', 8, '2nd Floor, West Wing', 'Available', true);

-- Seed initial data cho bảng RoomEquipment
INSERT INTO room_equipment (room_id, equipment_id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444');

-- migrate:down
-- Xóa indexes
DROP INDEX IF EXISTS idx_room_audit_log_created_at;
DROP INDEX IF EXISTS idx_room_audit_log_room_id;
DROP INDEX IF EXISTS idx_rooms_status;
DROP INDEX IF EXISTS idx_rooms_location;
DROP INDEX IF EXISTS idx_rooms_name;

-- Xóa các bảng
DROP TABLE IF EXISTS room_audit_log;
DROP TABLE IF EXISTS room_equipment;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS rooms;

-- Xóa các enum types
DROP TYPE IF EXISTS room_event_type;
DROP TYPE IF EXISTS room_status; 