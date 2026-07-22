-- PostgreSQL initialization script
-- This runs when the container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create trigram index support for full-text search
-- (used for student name search, course title search etc.)

\echo 'Extensions enabled: uuid-ossp, vector, pg_trgm'
