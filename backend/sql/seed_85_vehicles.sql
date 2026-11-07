
-- ============================================================
-- EQUIPSHARE FLEET EXPANSION SEED
-- Adds 5 Verified Machinery Owners and 85 Construction Vehicles
-- ============================================================

BEGIN;

-- 1. Insert Additional Fleet Owners
INSERT INTO users (id, full_name, email, phone_number, password_hash, user_type, is_disabled)
VALUES ('a1b2c3d4-e5f6-47a8-b9c0-111111111111', 'Everest Heavy Equipment Hub', 'everest.fleet@equipshare.np', '+977-9801122334', '$2a$10$X7pUj3rRkC5v2d8xQ9y1eeW3aB2c4d5e6f7g8h9i0j1k2l3m4n5o', 'owner', FALSE)
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, full_name, email, phone_number, password_hash, user_type, is_disabled)
VALUES ('a1b2c3d4-e5f6-47a8-b9c0-222222222222', 'Himalayan Earthmovers & Infra', 'himalayan.earth@equipshare.np', '+977-9841239876', '$2a$10$X7pUj3rRkC5v2d8xQ9y1eeW3aB2c4d5e6f7g8h9i0j1k2l3m4n5o', 'owner', FALSE)
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, full_name, email, phone_number, password_hash, user_type, is_disabled)
VALUES ('a1b2c3d4-e5f6-47a8-b9c0-333333333333', 'Gandaki Plant & Tipper Rentals', 'gandaki.plant@equipshare.np', '+977-9856012345', '$2a$10$X7pUj3rRkC5v2d8xQ9y1eeW3aB2c4d5e6f7g8h9i0j1k2l3m4n5o', 'owner', FALSE)
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, full_name, email, phone_number, password_hash, user_type, is_disabled)
VALUES ('a1b2c3d4-e5f6-47a8-b9c0-444444444444', 'Lumbini Heavy Fleet Logistics', 'lumbini.haulage@equipshare.np', '+977-9812345678', '$2a$10$X7pUj3rRkC5v2d8xQ9y1eeW3aB2c4d5e6f7g8h9i0j1k2l3m4n5o', 'owner', FALSE)
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, full_name, email, phone_number, password_hash, user_type, is_disabled)
VALUES ('a1b2c3d4-e5f6-47a8-b9c0-555555555555', 'Chitwan Commercial Machinery', 'chitwan.machinery@equipshare.np', '+977-9865432109', '$2a$10$X7pUj3rRkC5v2d8xQ9y1eeW3aB2c4d5e6f7g8h9i0j1k2l3m4n5o', 'owner', FALSE)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert 85 Detailed Heavy Construction Vehicles & Tippers
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Tata Signa 2823.K HD 9-Speed Tipper',
  'Construction',
  'Heavy Tipper (16 Cu.M)',
  'Cummins ISBe 5.6L BS6 engine delivering 230 HP and 850 Nm torque. Equipped with 16 cubic meter rock body, heavy-duty planetary hub-reduction bogie axles, and air-conditioned crash-tested day cab. Ideal for riverbed gravel, crushed aggregate, and highway embankment muck hauling across Nepal.',
  18500,
  'Bhaktapur',
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'Tata Prima 2830.K Heavy Muck Tipper',
  'Construction',
  'Heavy Tipper (18 Cu.M)',
  'Equipped with 300 HP high-torque diesel powertrain, Eaton 9-speed manual gearbox, and heavy-duty reinforced chassis frame. Features air suspension driver seat and anti-lock braking system. Perfect for hydropower tunnel spoil removal and high-volume highway earthmoving.',
  22000,
  'Kathmandu',
  'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'Ashok Leyland 2820-6x4 Tipper',
  'Construction',
  'Heavy Tipper (14 Cu.M)',
  'iGen6 H-series 200 HP turbo engine with i-Alert telematics. Hardox high-tensile steel tipping tub with front-end multi-stage hydraulic tipping ram. Suitable for road subgrade material transport and river quarry aggregate logistics.',
  16500,
  'Lalitpur',
  'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Ashok Leyland Captain 2518 Heavy Tipper',
  'Construction',
  'Tipper (12 Cu.M)',
  '180 HP H-Series engine with unitized wheel bearings and deep reduction rear differential. Ergonomic Captain day cab with roll-over protective structure. Widely used for urban construction material delivery and foundation soil evacuation.',
  15000,
  'Pokhara',
  'https://images.unsplash.com/photo-1586191582066-5e5888e02d33?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'BharatBenz 2823C 6x4 Construction Tipper',
  'Construction',
  'Mining & Heavy Tipper',
  'OM926 240 HP fuel-efficient engine with 6-speed G131 manual transmission. Heavy inverted boogey suspension and thick wear-resistant scoop end rock body. Proven stability on steep hillside grades and rugged gravel haul roads.',
  21000,
  'Chitwan',
  'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'BharatBenz 3528CM 8x4 Mining Dump Truck',
  'Construction',
  'Heavy Tipper (22 Cu.M)',
  'Four-axle 35-tonne gross vehicle weight heavy tipper with 280 HP powertrain. Designed for heavy quarrying, cement plant limestone haulage, and major hydropower dam construction sites in Nepal.',
  28000,
  'Butwal',
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Eicher Pro 6028T Heavy Quarry Tipper',
  'Construction',
  'Quarry Tipper (16 Cu.M)',
  'VEDX5 210 HP high-torque engine with engine management system. Strong 285 mm ladder chassis with bell-crank tipping linkage for rapid discharge cycles. Highly economical for canal dredging and road widening operations.',
  17500,
  'Bhairahawa',
  'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'Eicher Pro 8035XM 8x4 Extreme Hauler',
  'Construction',
  'Mining Dump Truck (23 Cu.M)',
  'Volvo Group technology VEDX8 7.7-litre 350 HP engine churning 1350 Nm torque. Hub reduction axles with inter-wheel differential locks. Built for non-stop deep open pit stone quarries and mega highway cuts.',
  29500,
  'Hetauda',
  'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'MAN CLA 26.280 6x4 Rugged Tipper',
  'Construction',
  'Heavy Tipper (16 Cu.M)',
  'German engineered D0836 common-rail 280 HP engine with 9-speed synchromesh transmission. High ground clearance, heavy planetary rear axle, and robust tipping hydraulics capable of handling wet boulders and dense ballast.',
  23000,
  'Biratnagar',
  'https://images.unsplash.com/photo-1586191582066-5e5888e02d33?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Scania G440 8x4 Heavy Heavy Duty Tipper',
  'Construction',
  'Heavy Duty Hauler (24 Cu.M)',
  '440 HP 13-litre engine with Scania Opticruise automated gearbox and retarder brake. Ultra-durable Hardox 450 rock box, hub reduction rear bogies, and reinforced cab. Ideal for critical Himalayan tunneling and road cut projects.',
  36000,
  'Dhading',
  'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'Volvo FMX 460 8x4 Mining Tipper',
  'Construction',
  'Mining Dump Truck (24 Cu.M)',
  'D13A 460 HP engine with I-Shift off-road crawler transmission. Heavy-duty cast iron front towing crossmember, dual front steer axles, and high payload volume. Maximum uptime for heavy industrial infrastructure.',
  38000,
  'Kavre',
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Tata Signa 1918.K Medium 6-Wheeler Tipper',
  'Construction',
  'Medium Tipper (8.5 Cu.M)',
  '180 HP BS6 diesel engine with high maneuverability for narrow hill road construction, residential site clearing, and municipal aggregate distribution throughout Kathmandu valley.',
  11500,
  'Bhaktapur',
  'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Ashok Leyland 1920 Medium Tipper',
  'Construction',
  'Medium Tipper (8.5 Cu.M)',
  '200 HP H-Series turbo diesel with dual-mode fuel economy switch. 6-speed overdrive gearbox and sturdy box-type chassis frame. Excellent for regional bridge construction and drainage trenches.',
  11000,
  'Kathmandu',
  'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'SANY SKT90S Wide-Body Mining Dump Truck',
  'Construction',
  'Off-Highway Mining Tipper (35 Cu.M)',
  'Weichai 530 HP heavy mining diesel engine with Allison automatic transmission. Payload capacity of 60 tonnes. Engineered exclusively for off-highway mega earthworks, airport runways, and hydroelectric barrage construction.',
  45000,
  'Lalitpur',
  'https://images.unsplash.com/photo-1586191582066-5e5888e02d33?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'CAT 773G Off-Highway Haul Truck',
  'Construction',
  'Rigid Dump Truck (35.2 Cu.M)',
  'Cat C27 ACERT 775 HP tier engine with 7-speed planetary powershift transmission. Gross payload capacity of 55 metric tons. World-class traction control and retarding system for extreme mountain haul road conditions.',
  65000,
  'Pokhara',
  'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Caterpillar 140M3 All-Wheel Drive Motor Grader',
  'Construction',
  'Motor Grader (14 ft)',
  'Cat C9.3 ACERT 250 HP engine with variable horsepower technology. 14-foot moldboard with blade float and pitch hydraulics. Electro-hydraulic joystick controls replace levers for millimeter precision in airport runways and national highway sub-base grading.',
  36000,
  'Chitwan',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'Caterpillar 120 GC Road Grader',
  'Construction',
  'Motor Grader (12 ft)',
  'Cat C4.4 171 HP engine paired with planetary powershift transmission. 12-foot high-carbon steel moldboard and rear ripper attachment. Built for durable road maintenance, rural road reshaping, and municipal shoulder leveling.',
  28000,
  'Butwal',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Komatsu GD535-5 Articulated Motor Grader',
  'Construction',
  'Motor Grader (12 ft)',
  'Komatsu SAA4D107E-1 145 HP turbocharged diesel engine with dual-mode transmission (torque converter with lockup). Tight turning radius of 6.6m with 25-degree articulation. Outstanding for mountain roads and urban arterial grading.',
  29000,
  'Bhairahawa',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Komatsu GD675-6 Heavy Precision Grader',
  'Construction',
  'Motor Grader (14 ft)',
  '218 HP engine with lockup torque converter and 8-forward/4-reverse transmission. Heavy circle drive slip clutch and multi-shank rear ripper. Delivers high blade downforce for hard soil scraping and gravel road rehabilitation.',
  38000,
  'Hetauda',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'SANY SMG200C-8 Highway Motor Grader',
  'Construction',
  'Motor Grader (14 ft)',
  'Cummins 205 HP engine with ZF powershift gearbox and Meritor drive axle. High-strength rolled circle with wear-resistant bronze inserts. Highly popular for Nepal Postal Highway and Mid-Hill Highway grading packages.',
  27000,
  'Biratnagar',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'SANY SAG120-3 Compact Motor Grader',
  'Construction',
  'Compact Grader (10 ft)',
  '128 HP engine with 10-foot moldboard and hydraulic circle side-shift. Compact footprint allows access to narrow feeder roads, irrigation access paths, and terraced agricultural project development.',
  21000,
  'Dhading',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Liugong CLG4180D Heavy Motor Grader',
  'Construction',
  'Motor Grader (13 ft)',
  'Cummins 6BTA 180 HP engine with electro-hydraulic control transmission. Features a full 360-degree blade rotation circle, front dozer blade, and rear scarifier. Reliable workhorse for contractor road surfacing contracts.',
  25000,
  'Kavre',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'SDLG G9190F High-Speed Motor Grader',
  'Construction',
  'Motor Grader (13.5 ft)',
  'Deutz 198 HP common-rail engine with three power curve modes. Load-sensing hydraulic system provides seamless simultaneous operation of moldboard lift, tilt, and articulation.',
  26000,
  'Bhaktapur',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'CASE 865B Variable Horsepower Grader',
  'Construction',
  'Motor Grader (14 ft)',
  'FPT 6.7L engine delivering 193 to 220 HP depending on gear selection. Heavy A-frame drawbar with outside circle teeth for maximum torque transmission under heavy blade loads.',
  33000,
  'Kathmandu',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'John Deere 672G Six-Wheel Drive Grader',
  'Construction',
  'Motor Grader (14 ft)',
  'John Deere PowerTech 9.0L 255 HP engine with true dual-path hydrostatic front-wheel drive. Unmatched tractive effort in slippery mud, snow removal on mountain passes, and loose sand.',
  41000,
  'Lalitpur',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'CAT 320 GC Heavy Hydraulic Excavator',
  'Construction',
  'Crawler Excavator (20 Ton)',
  'Cat C4.4 146 HP engine with electro-hydraulic pilot control system. Standard 1.0 m3 heavy-duty bucket with rock teeth. Best-in-class fuel efficiency for medium earthmoving, foundation digging, and canal trenching.',
  26000,
  'Pokhara',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'CAT 336 D2L Mining Excavator',
  'Construction',
  'Crawler Excavator (36 Ton)',
  'Cat C9 ACERT 300 HP engine with 1.9 m3 severe-duty rock bucket and heavy-duty undercarriage. Built for crushing river boulders, quarry excavation, and heavy hillside road cutting.',
  42000,
  'Chitwan',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Komatsu PC210-10M0 Heavy Duty Excavator',
  'Construction',
  'Crawler Excavator (21 Ton)',
  '165 HP Komatsu SAA6D107E-1 engine with 1.2 m3 bucket. Reinforced boom, arm, and track frame for high-impact durability. Equipped with KOMTRAX satellite telematics and hydraulic hammer piping.',
  25000,
  'Butwal',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'Komatsu PC350LC-8 Long Undercarriage Excavator',
  'Construction',
  'Crawler Excavator (35 Ton)',
  '260 HP engine with high-pressure common rail fuel injection. Extended track length provides superior stability while handling massive quarry rocks and deep pipeline trench excavations.',
  40000,
  'Bhairahawa',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Hitachi ZX210LC-5G Zaxis Excavator',
  'Construction',
  'Crawler Excavator (21 Ton)',
  'Isuzu 168 HP diesel engine with HIOS III hydraulic system for rapid combined boom and swing movements. Reliable under heavy tropical monsoons and abrasive river gravel operations.',
  25500,
  'Hetauda',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Hitachi ZX370LCH-5G Quarry Heavy Excavator',
  'Construction',
  'Crawler Excavator (37 Ton)',
  '250 HP engine with heavy H-spec reinforced boom and arm. Features heavy steel side bumpers, full track guards, and 2.1 m3 rock bucket for continuous stone crusher feeding.',
  44000,
  'Biratnagar',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'Hyundai Robex 210-9 SMART Excavator',
  'Construction',
  'Crawler Excavator (21 Ton)',
  'Cummins 140 HP 6BT engine known for easy maintenance and bulletproof reliability in remote regions of Nepal. Advanced CAPO computer aided power optimization system.',
  23500,
  'Dhading',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'Hyundai Robex 340LC-9 Mega Excavator',
  'Construction',
  'Crawler Excavator (34 Ton)',
  '276 HP Cummins engine with 1.8 m3 heavy rock bucket. Large air conditioned operator cab with vibration damper mountings for 12-hour continuous tunnel and quarry shifts.',
  39000,
  'Kavre',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'SANY SY215C-9 Ace Excavator',
  'Construction',
  'Crawler Excavator (21.5 Ton)',
  'Mitsubishi 155 HP engine with customized Kawasaki hydraulic pumps. Enhanced digging force of 152 kN and standard breaker line installation for high-impact rock hammering.',
  24000,
  'Bhaktapur',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'SANY SY380H Heavy Mining Excavator',
  'Construction',
  'Crawler Excavator (38 Ton)',
  'Isuzu 284 HP engine with high-pressure positive flow hydraulic circuit. Structural elements forged from ultra-high tensile alloy plate for severe mining and boulder breaking duty.',
  46000,
  'Kathmandu',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Kobelco SK220XD Super Earth Excavator',
  'Construction',
  'Crawler Excavator (22 Ton)',
  'Hino 158 HP engine with extreme-durability XD boom and arm. Features Arm Interflow System for fastest cycle times in soil loading and deep retaining wall footing digging.',
  26000,
  'Lalitpur',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Doosan DX225LCA Track Excavator',
  'Construction',
  'Crawler Excavator (22.5 Ton)',
  'Doosan DB58TIS mechanical fuel injection 150 HP engine capable of running smoothly on local diesel grades. Excellent torque response and robust track rollers.',
  24500,
  'Pokhara',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'Volvo EC210D Prime Excavator',
  'Construction',
  'Crawler Excavator (21 Ton)',
  'Volvo D5E 167 HP tier-3 engine with Volvo Care Cab offering ROPS/FOPS operator safety, best-in-class air filtering, and ultra-smooth proportional hydraulic control.',
  27000,
  'Chitwan',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'Doosan DX140W Wheeled Mobile Excavator',
  'Construction',
  'Wheeled Excavator (14 Ton)',
  'Road-legal rubber-tired mobile excavator with 132 HP engine, travel speed up to 37 km/h, and stabilizing outriggers. Eliminates low-bed haulage costs for city pipeline repair and ditching.',
  23000,
  'Butwal',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Hyundai R140W-9S Wheeled Excavator',
  'Construction',
  'Wheeled Excavator (14 Ton)',
  'Equipped with dozer blade, front axle oscillation lock, and 0.6 m3 general purpose trenching bucket. Highly versatile for municipal drainage, utility laying, and roadside maintenance.',
  22500,
  'Bhairahawa',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'JCB 3DX Super EcoXcellence Backhoe Loader',
  'Construction',
  'Backhoe Loader (4x4)',
  'JCB ecoMAX 76 HP engine with LiveLink telematics. 4-wheel drive, 1.1 m3 front loader shovel, and 0.26 m3 heavy backhoe bucket. The most iconic and ubiquitous multipurpose contractor machine in Nepal.',
  13500,
  'Hetauda',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'JCB 4DX Heavy Four-Wheel Steer Backhoe',
  'Construction',
  'Backhoe Loader (High-Cap)',
  '92 HP turbocharged engine with 4-wheel steering and large equal-sized tires for extreme flotation in deep river clay, hillside slopes, and agricultural terrace construction.',
  16000,
  'Biratnagar',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'CAT 424B2 Heavy-Duty Backhoe Loader',
  'Construction',
  'Backhoe Loader (4x2/4x4)',
  'Cat 3054C naturally aspirated engine delivering 76 HP. Curved excavator-style boom provides high obstacle clearance when loading tall-sided tippers and dump trucks.',
  14000,
  'Dhading',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'CASE 770 EX Magnum Backhoe Loader',
  'Construction',
  'Backhoe Loader (4x4)',
  'FPT 86 HP S8000 engine with Carraro synchromesh transmission. Heavy-duty cast iron front axle and stabilizer legs with integrated lock valves for rock-solid stability.',
  13000,
  'Kavre',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'CASE 851 FX Industrial Backhoe Loader',
  'Construction',
  'Backhoe Loader (97 HP)',
  '97 HP turbocharged intercooled engine with powershift gearbox. High loader lift capacity of 3450 kg. Ideal for quarry sorting, heavy boulder handling, and canal construction.',
  15500,
  'Bhaktapur',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Mahindra EarthMaster VX 4WD Backhoe',
  'Construction',
  'Backhoe Loader (4x4)',
  'DITEC 74 HP engine with Banana Boom design providing superior reach and dump height. Advanced joystick controls and fuel-saving Eco/Power operating modes.',
  12500,
  'Kathmandu',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'Tata Hitachi Shinrai Backhoe Loader',
  'Construction',
  'Backhoe Loader',
  'Japanese designed Shinrai platform with 74 HP diesel engine. Unmatched cabin visibility, high breakout force, and 6-in-1 multipurpose bottom dump loader bucket.',
  13800,
  'Lalitpur',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Terex TLB 844 Industrial Backhoe',
  'Construction',
  'Backhoe Loader (4x4)',
  '90 HP turbo engine with heavy planetary axles. Deep digging depth up to 4.7 meters with hydraulic breaker attachments available on request.',
  13200,
  'Pokhara',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Komatsu WB93R-5 Rigid Backhoe Loader',
  'Construction',
  'Backhoe Loader',
  '99 HP engine with closed-center load sensing hydraulic system (CLSS). Proportional pilot levers allow simultaneous digging and swinging with effortless ease.',
  15000,
  'Chitwan',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'Escorts DigMAX II 4WD Backhoe',
  'Construction',
  'Backhoe Loader',
  'Economical 76 HP Kirloskar diesel engine with reinforced box boom. Low maintenance cost and readily available parts across all 7 provinces of Nepal.',
  12000,
  'Butwal',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'CAT D6R Heavy Crawler Bulldozer',
  'Construction',
  'Crawler Dozer (20 Ton)',
  'Cat C9 ACERT 185 HP engine with elevated sprocket design for exceptional balance and protected final drives. Semi-Universal SU blade with hydraulic tilt and single shank ripper. Primary machine for mountain road pioneering and landfill leveling.',
  45000,
  'Bhairahawa',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'CAT D8T Mining & Heavy Earth Dozer',
  'Construction',
  'Crawler Dozer (38 Ton)',
  'Cat C15 ACERT 310 HP engine. Differential steering maintains full power to both tracks in turns. Gigantic 8.6 m3 blade capacity for large-scale river containment dikes and expressway cuts.',
  68000,
  'Hetauda',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'Komatsu D65EX-16 Semi-U Dozer',
  'Construction',
  'Crawler Dozer (21 Ton)',
  'Komatsu SAA6D114E-3 205 HP engine with automatic transmission with lockup torque converter. High blade capacity with Sigmadozer profile for 15% higher pushing efficiency.',
  42000,
  'Biratnagar',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Komatsu D85ESS-2 Heavy Track Dozer',
  'Construction',
  'Crawler Dozer (23 Ton)',
  '215 HP mechanical engine designed specifically for challenging fuel qualities. Left joystick controls all directional movements. Strong multi-shank parallelogram ripper.',
  46000,
  'Dhading',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Shantui SD16 Standard Crawler Dozer',
  'Construction',
  'Crawler Dozer (17 Ton)',
  'Weichai 160 HP engine with planetary powershift transmission and wet steering clutch. Straight tilt blade with 4.5 m3 capacity. Highly economical rental rate for site pioneering.',
  32000,
  'Kavre',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'Shantui SD22 Heavy Mountain Dozer',
  'Construction',
  'Crawler Dozer (24 Ton)',
  'Cummins NT855 220 HP engine. Heavy track shoes and reinforced blade push arms engineered for rocky Himalayan terrain and heavy debris clearing during monsoon landslides.',
  44000,
  'Bhaktapur',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'Case 1650L High-Precision Dozer',
  'Construction',
  'Crawler Dozer (18 Ton)',
  'FPT 168 HP engine with hydrostatic transmission offering infinite speed control and counter-rotation. 6-way PAT (Power Angle Tilt) blade for fine grade finishing.',
  35000,
  'Kathmandu',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Liebherr PR 736 Litronic Crawler Dozer',
  'Construction',
  'Crawler Dozer (22 Ton)',
  'Liebherr 217 HP common-rail engine with stepless hydrostatic drive. Outstanding fuel efficiency and electronic dozer assist system for precise slope and embankment formation.',
  48000,
  'Lalitpur',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'Hamm 311D Single Drum Soil Compactor',
  'Construction',
  'Vibratory Roller (11 Ton)',
  '105 HP engine with 3-point articulation joint for unmatched driving stability and steering control. High static linear load of 30 kg/cm with dual amplitude vibration for sub-base compaction.',
  15000,
  'Pokhara',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Hamm HD 90 Tandem Asphalt Roller',
  'Construction',
  'Tandem Roller (9 Ton)',
  'Dual smooth steel drums with pressurized water sprinkling system and crab steering mode. Delivers mirror-finish asphalt blacktopping on national highways and city roads.',
  16500,
  'Chitwan',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Dynapac CA250D Soil Vibratory Compactor',
  'Construction',
  'Vibratory Roller (11 Ton)',
  'Cummins 110 HP engine with heavy drum shell thickness of 25mm. High centrifugal compaction force up to 240 kN for thick rock-fill layers and clay foundation compaction.',
  14500,
  'Butwal',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'Dynapac CC4200 Tandem Asphalt Compactor',
  'Construction',
  'Asphalt Roller (10.5 Ton)',
  'High frequency vibration system ensuring maximum density in fewer passes on hot-mix asphalt overlays. Dual swivel driver seats with ergonomic lever controls.',
  17500,
  'Bhairahawa',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'BOMAG BW 211 D-5 Heavy Soil Roller',
  'Construction',
  'Soil Compactor (11.5 Ton)',
  'Deutz 128 HP engine with BOMAG Economizer live compaction indicator. Gradeability up to 45% for steep mountain road cuts and embankment side-slope compaction.',
  15500,
  'Hetauda',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'CAT CS11 GC Smooth Drum Compactor',
  'Construction',
  'Soil Compactor (11 Ton)',
  'Cat C4.4 112 HP engine with exclusive pod-style eccentric weight system for reliable dual amplitude operation. Padfoot shell kit available for plastic cohesive soils.',
  16000,
  'Biratnagar',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'JCB 116D Soil Compactor',
  'Construction',
  'Soil Compactor (11.3 Ton)',
  'JCB ecoMAX 114 HP engine with pre-cleaner cyclone air intake. Center articulated joint with high oscillation angle ensures constant drum contact on uneven subgrades.',
  14000,
  'Dhading',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'CASE 1107 EX Vibratory Soil Compactor',
  'Construction',
  'Soil Compactor (11 Ton)',
  'FPT 104 HP engine with heavy 32 mm thick drum shell. Dual frequency and dual amplitude settings for versatile compaction of sand, gravel, and crushed stone base layers.',
  13500,
  'Kavre',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'CAT 950GC Heavy Wheel Loader',
  'Construction',
  'Wheel Loader (3.1 Cu.M)',
  'Cat C7.1 ACERT 241 HP engine with load-sensing hydraulic system and 4-speed planetary powershift transmission. Operating weight 18.6 tonnes with 3.1 m3 bucket for crusher hopper loading.',
  28000,
  'Bhaktapur',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'CAT 966H High-Volume Wheel Loader',
  'Construction',
  'Wheel Loader (4.2 Cu.M)',
  'Cat C11 ACERT 262 HP engine with heavy planetary axles. Massive breakout force of 188 kN. Primary loader for loading tipper convoys at river aggregate extraction depots.',
  38000,
  'Kathmandu',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'Komatsu WA380-6 All-Round Wheel Loader',
  'Construction',
  'Wheel Loader (3.3 Cu.M)',
  '191 HP Komatsu engine with large-capacity torque converter and variable transmission cut-off. High tipping load and wide bucket mouth for rapid truck turnaround.',
  27000,
  'Lalitpur',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'SDLG L958F Heavy Front-End Loader',
  'Construction',
  'Wheel Loader (3.2 Cu.M)',
  'Weichai 220 HP low-speed high-torque engine with ZF 4WG200 transmission. 5-tonne payload capacity. Widely trusted across crusher plants and asphalt batching plants in Nepal.',
  22000,
  'Pokhara',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'Liugong CLG856H High-Performance Loader',
  'Construction',
  'Wheel Loader (3.0 Cu.M)',
  'Cummins QSB6.7 220 HP engine with wet disc service brakes and ZF axles. Reinforced box-section front frame withstands heavy torsional loads while scooping blasted rock.',
  23000,
  'Chitwan',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Lonking ZL50NC Heavy Wheel Loader',
  'Construction',
  'Wheel Loader (3.0 Cu.M)',
  'Weichai 220 HP engine with high-dump arm configuration reaching 3.4 meters. Perfect for high-sided tipper loading and batching plant hopper charging.',
  21000,
  'Butwal',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Hyundai HL665-9 High-Reach Loader',
  'Construction',
  'Wheel Loader (3.1 Cu.M)',
  'Cummins 215 HP engine with fully automatic powershift transmission and 3 engine power modes. Features ride control system that stabilizes boom on rough haul paths.',
  24000,
  'Bhairahawa',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'XCMG ZL50GN Popular Front Loader',
  'Construction',
  'Wheel Loader (3.0 Cu.M)',
  '220 HP powertrain with patented heavy-duty drive axles. 170 kN traction force and 162 kN breakout force. Proven workhorse in hydropower sand-washing plants.',
  21500,
  'Hetauda',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'XCMG QY25K5-I Telescopic Truck Crane',
  'Construction',
  'Hydraulic Truck Crane (25 Ton)',
  '25-tonne maximum lifting capacity with 5-section octagonal main boom extending to 39.5 meters plus 8.3m jib. Dual H-pattern outriggers provide 360-degree stability for precast bridge girder erection.',
  32000,
  'Biratnagar',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'SANY STC500 50-Ton Truck Crane',
  'Construction',
  'Hydraulic Truck Crane (50 Ton)',
  '50-tonne lifting crane with 43.5m U-shaped boom and high-strength fine grain structural steel. Equipped with smart load moment indicator (LMI) and dual winch system for industrial plant installation.',
  52000,
  'Dhading',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'SANY STC250 25-Ton Mobile Crane',
  'Construction',
  'Hydraulic Truck Crane (25 Ton)',
  'Fast highway transit speed up to 80 km/h on carrier chassis. 4-section telescopic boom with high hydraulic pressure winch. Essential for electrical transmission tower assembly.',
  31000,
  'Kavre',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Zoomlion QY50V 50-Ton Mobile Crane',
  'Construction',
  'Hydraulic Truck Crane (50 Ton)',
  'Weichai 336 HP carrier engine with 42m main boom and 15m auxiliary jib. Full pilot proportional hydraulic control allows millimeter accuracy in turbine and transformer placing.',
  50000,
  'Bhaktapur',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'ACE 14XW Pick and Carry Mobile Crane',
  'Construction',
  'Pick & Carry Crane (14 Ton)',
  'Articulated pick-and-carry crane with 14-tonne capacity. Front-wheel drive with hydraulic rear-wheel steering. Industry standard machine for unloading steel rebar, pipes, and structural beams on job sites.',
  11000,
  'Kathmandu',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'ACE 20XW Heavy Hydra Crane',
  'Construction',
  'Pick & Carry Crane (20 Ton)',
  '20-tonne capacity with 4-section slotted boom extending to 18 meters. Fitted with safe load indicator, over-hoist limit switch, and extra wide outrigger base.',
  14500,
  'Lalitpur',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'JCB 535-95 Telehandler (Telescopic)',
  'Construction',
  'Telehandler (3.5 Ton / 9.5m)',
  'JCB 74 HP engine with all-wheel steer and 9.5-meter forward reach. Fork attachment, bucket, and personnel work platform for 3-story construction scaffolding and material delivery.',
  18000,
  'Pokhara',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Manitou MT-X 1840 Heavy Telehandler',
  'Construction',
  'Telehandler (4.0 Ton / 18m)',
  '100 HP Perkins diesel engine with 18-meter vertical boom reach and 4-tonne lift capacity. Front stabilizing outriggers and frame leveling system for high-rise facade installation.',
  24000,
  'Chitwan',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'Tata Signa 2823.TK 7 Cu.M Transit Mixer',
  'Construction',
  'Transit Mixer (7 Cu.M)',
  'Cummins 230 HP engine with dedicated auxiliary slave engine for independent drum rotation. 7 m3 high-wear spiral blade mixing drum keeps certified RMC concrete alive during transit in Kathmandu traffic.',
  19500,
  'Butwal',
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Ashok Leyland 2820 RMC Transit Mixer',
  'Construction',
  'Transit Mixer (7 Cu.M)',
  'iGen6 200 HP engine with Schwing Stetter concrete drum. High-pressure water pump and hose for immediate chute and drum washdown after site discharge.',
  19000,
  'Bhairahawa',
  'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Schwing Stetter S36X Boom Concrete Pump',
  'Construction',
  'Boom Concrete Pump (36 Meter)',
  '4-section R-Z folding 36-meter distribution boom mounted on 3-axle truck. Pumping output up to 130 m3/hour. Indispensable for continuous high-rise floor slabs and bridge pier capping.',
  48000,
  'Hetauda',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'Putzmeister BSA 1407D Stationary Concrete Pump',
  'Construction',
  'Stationary Line Pump',
  'Deutz 115 HP trailer-mounted high-pressure concrete trailer pump. Maximum delivery pressure 106 bar. Capable of pumping structural concrete through 300 meters of pipe for tunnel linings.',
  18000,
  'Biratnagar',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'SANY HBT6013-110D Trailer Concrete Pump',
  'Construction',
  'Trailer Line Pump',
  'Diesel-driven trailer pump with S-valve technology and 60 m3/h pumping capacity. Auto-lubrication system and wired remote control for rapid dam abutment casting.',
  17500,
  'Dhading',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'Ajax Fiori Argo 4000 Self-Loading Mixer',
  'Construction',
  'Self-Loading Concrete Mixer (4 Cu.M)',
  '4-wheel drive self-loading concrete mobile batching unit with 4.0 m3 drum and integrated electronic weighing batcher. Produces certified M20/M25/M30 grade concrete anywhere on remote mountain job sites.',
  21000,
  'Kavre',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'Sandvik Leopard DI550 Track Rock Drill Rig',
  'Construction',
  'Surface DTH Drill Rig',
  'Caterpillar 440 HP engine powering onboard high-pressure air compressor. Drills 90 mm to 165 mm blast holes in hard quartzite and limestone for highway bench blasting.',
  55000,
  'Bhaktapur',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555',
  'Atlas Copco ROC D7 Crawler Blast Drill',
  'Construction',
  'Hydraulic Top Hammer Rig',
  '200 HP engine with high-frequency hydraulic rock drill. Automatic rod handling system with angle indicator for accurate pre-split blasting on fragile mountain slopes.',
  52000,
  'Kathmandu',
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c',
  'Terex Finlay J-1175 Mobile Jaw Crusher',
  'Construction',
  'Track Mobile Crusher (350 TPH)',
  'Heavy-duty track mobile jaw crusher with 1070mm x 760mm jaw chamber. Direct hydrostatic drive with reverse clearing action. Crushes blasted mountain rock down to 50mm base course at 300+ tonnes/hour.',
  65000,
  'Lalitpur',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
  TRUE
);
INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'Kleemann MC 110 PRO Track Mobile Jaw Crusher',
  'Construction',
  'Mobile Jaw Crusher (330 TPH)',
  'Continuous Feed System (CFS) ensures optimal crusher chamber filling. Integrated pre-screen separates dirt and fine gravel before the jaw, maximizing clean aggregate production.',
  68000,
  'Pokhara',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  TRUE
);

COMMIT;
