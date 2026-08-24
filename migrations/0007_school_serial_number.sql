ALTER TABLE schools ADD COLUMN serial_number INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS schools_serial_number_unique ON schools(serial_number) WHERE serial_number IS NOT NULL;
