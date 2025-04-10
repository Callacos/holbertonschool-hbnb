-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS place_amenity;
DROP TABLE IF EXISTS reviews;  -- Changé de "review" à "reviews"
DROP TABLE IF EXISTS places;   -- Changé de "place" à "places" 
DROP TABLE IF EXISTS amenities; -- Changé de "amenity" à "amenities"
DROP TABLE IF EXISTS users;    -- Changé de "user" à "users"

-- Create User table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE
);

-- Create Place table
CREATE TABLE places (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    latitude FLOAT,
    longitude FLOAT,
    owner_id CHAR(36),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE  -- Changé "user" à "users"
);

-- Create Review table
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY,
    text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    user_id CHAR(36),
    place_id CHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  -- Changé "user" à "users"
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE, -- Changé "place" à "places"
    UNIQUE (user_id, place_id)
);

-- Create Amenity table
CREATE TABLE amenities (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

-- Create Place_Amenity table (for many-to-many relationship)
CREATE TABLE place_amenity (
    place_id CHAR(36),
    amenity_id CHAR(36),
    PRIMARY KEY (place_id, amenity_id),
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,  -- Changé "place" à "places"
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE -- Changé "amenity" à "amenities"
);