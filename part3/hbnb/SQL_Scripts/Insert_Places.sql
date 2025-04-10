-- Insérer des lieux de démonstration
INSERT INTO places (id, title, description, price, latitude, longitude, owner_id)
VALUES
    (
        'bc123456-7890-abcd-ef12-345678901234',
        'Superbe appartement au centre-ville',
        'Un appartement confortable avec vue sur la ville et proche de toutes commodités. Parfait pour un séjour touristique ou professionnel.',
        85.00,
        48.8566,
        2.3522,
        '36c9050e-ddd3-4c3b-9731-9f487208bbc1'  -- Utilisez l'ID d'un admin existant
    ),
    (
        'de789012-3456-7890-abcd-ef1234567890',
        'Villa avec piscine',
        'Magnifique villa avec piscine privée, jardin et terrasse. Idéal pour des vacances en famille ou entre amis.',
        150.00,
        43.2965,
        5.3698,
        '36c9050e-ddd3-4c3b-9731-9f487208bbc1'  -- Utilisez l'ID d'un admin existant
    ),
    (
        'ff123456-7890-abcd-ef12-345678901235',
        'Studio cosy proche métro',
        'Petit studio bien aménagé, idéal pour une personne ou un couple. À deux minutes à pied du métro et des commerces.',
        65.00,
        48.8534,
        2.3488,
        '36c9050e-ddd3-4c3b-9731-9f487208bbc1'  -- Utilisez l'ID d'un admin existant
    );

-- Relation entre lieux et aménités (si vous avez déjà des aménités)
INSERT INTO place_amenity (place_id, amenity_id)
VALUES
    -- Appartement centre-ville avec WiFi et Air Conditioning
    ('bc123456-7890-abcd-ef12-345678901234', '550e8400-e29b-41d4-a716-446655440000'),
    ('bc123456-7890-abcd-ef12-345678901234', '550e8400-e29b-41d4-a716-446655440002'),
    
    -- Villa avec tous les équipements
    ('de789012-3456-7890-abcd-ef1234567890', '550e8400-e29b-41d4-a716-446655440000'),
    ('de789012-3456-7890-abcd-ef1234567890', '550e8400-e29b-41d4-a716-446655440001'),
    ('de789012-3456-7890-abcd-ef1234567890', '550e8400-e29b-41d4-a716-446655440002'),
    
    -- Studio cosy avec WiFi
    ('ff123456-7890-abcd-ef12-345678901235', '550e8400-e29b-41d4-a716-446655440000');

-- Ajouter quelques avis pour les lieux
INSERT INTO reviews (id, text, rating, user_id, place_id)
VALUES
    (
        'rev12345-6789-abcd-ef12-345678901234',
        'Excellent séjour ! L''appartement est très bien situé et confortable.',
        5,
        '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
        'bc123456-7890-abcd-ef12-345678901234'
    ),
    (
        'rev23456-7890-bcde-f123-456789012345',
        'Très belle villa, la piscine est superbe. Je recommande vivement !',
        5,
        '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
        'de789012-3456-7890-abcd-ef1234567890'
    ),
    (
        'rev34567-8901-cdef-g234-567890123456',
        'Studio bien placé mais un peu petit. Bon rapport qualité/prix.',
        4,
        '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
        'ff123456-7890-abcd-ef12-345678901235'
    );