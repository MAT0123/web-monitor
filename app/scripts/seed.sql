INSERT INTO users (id, display_name, email)
VALUES ('c497a017-d4a3-4cfc-b85a-df56e5e14b93', 'Demo User', 'admin@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO websites (name, url, email) VALUES
('Google', 'https://google.com', 'admin@example.com'),
('GitHub', 'https://github.com', 'admin@example.com'),
('Vercel', 'https://vercel.com', 'admin@example.com')
ON CONFLICT DO NOTHING;
