INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin',
  'admin@chapada.com',
  '$2a$10$FyGvW.Uqfakehashfakehashfakehashfakehashfake', -- troque depois
  'admin'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO trails (name, slug, description, difficulty, distance_km, duration_hours, price, category, location, main_image_url)
VALUES
(
  'Cachoeira da Fumaça por cima',
  'cachoeira-da-fumaca-por-cima',
  'Uma das trilhas mais famosas da Chapada Diamantina, com visual incrível do cânion e da queda d''água.',
  'medio',
  12.0,
  6.0,
  250.00,
  'longa',
  'Vale do Capão - Palmeiras/BA',
  'https://example.com/imagens/fumaca.jpg'
),
(
  'Poço Azul e Poço Encantado',
  'poco-azul-e-poco-encantado',
  'Passeio por duas cavidades com águas cristalinas e azuladas, com flutuação e contemplação.',
  'facil',
  4.0,
  4.0,
  180.00,
  'curta',
  'Nova Redenção/BA',
  'https://example.com/imagens/poco-azul-encantado.jpg'
)
ON CONFLICT (slug) DO NOTHING;
