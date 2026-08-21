INSERT INTO roles (name) VALUES
    ('fisherman'),
    ('bmu_clerk'),
    ('fishmonger'),
    ('buyer'),
    ('admin')
ON CONFLICT (name) DO NOTHING;