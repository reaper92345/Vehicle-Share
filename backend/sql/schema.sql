-- Requires PostgreSQL 13+ for gen_random_uuid().

CREATE TYPE user_type AS ENUM ('renter', 'owner', 'both');
CREATE TYPE equipment_category AS ENUM ('Agriculture', 'Construction');
CREATE TYPE booking_status AS ENUM ('Pending', 'Approved', 'Active', 'Completed', 'Cancelled');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    phone_number VARCHAR(32) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type user_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_lower_idx ON users (LOWER(email));

CREATE TABLE equipment (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(160) NOT NULL,
    category equipment_category NOT NULL,
    sub_category VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_day NUMERIC(12, 2) NOT NULL CHECK (price_per_day > 0),
    location VARCHAR(200) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX equipment_owner_id_idx ON equipment(owner_id);
CREATE INDEX equipment_category_available_idx ON equipment(category, is_available);
CREATE INDEX equipment_created_at_idx ON equipment(created_at DESC);

CREATE TABLE bookings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    renter_id UUID NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    status booking_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

CREATE INDEX bookings_equipment_status_dates_idx
    ON bookings(equipment_id, status, start_date, end_date);
CREATE INDEX bookings_renter_id_idx ON bookings(renter_id);

CREATE TABLE reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (reviewer_id <> reviewee_id)
);

CREATE INDEX reviews_booking_id_idx ON reviews(booking_id);
CREATE INDEX reviews_reviewee_id_idx ON reviews(reviewee_id);
