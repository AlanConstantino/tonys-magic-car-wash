-- Seed initial services (Tony's Magic Car Wash placeholder catalog)
INSERT INTO services (slug, name, description, duration_minutes, price_cents, is_addon, display_order, features) VALUES
(
  'exterior-wash',
  'exterior-wash',
  'Exterior Wash',
  'Complete exterior hand wash with premium products. Includes wheels, tires, and windows.',
  45,
  4900,
  false,
  1,
  ARRAY[
    'Hand wash & dry',
    'Wheel & tire cleaning',
    'Window cleaning',
    'Tire shine'
  ]
),
(
  'interior-detail',
  'Interior Detail',
  'Deep cleaning of your vehicle''s interior. Vacuum, surfaces, leather conditioning.',
  90,
  12900,
  false,
  2,
  ARRAY[
    'Full vacuum',
    'Dashboard & console cleaning',
    'Leather conditioning',
    'Window cleaning (interior)',
    'Door jambs'
  ]
),
(
  'full-detail',
  'Full Detail',
  'Complete interior and exterior transformation. The ultimate treatment for your vehicle.',
  180,
  24900,
  false,
  3,
  ARRAY[
    'Everything in Exterior Wash',
    'Everything in Interior Detail',
    'Clay bar treatment',
    'Polish & wax',
    'Engine bay cleaning'
  ]
),
(
  'ceramic-spray',
  'Ceramic Spray Coating',
  'Professional ceramic spray protection. Adds months of protection and shine.',
  30,
  7900,
  true,
  4,
  ARRAY[
    '6-month protection',
    'Enhanced shine',
    'Water beading',
    'UV protection'
  ]
);
