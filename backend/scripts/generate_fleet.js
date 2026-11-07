const fs = require('fs');

// We have owner_id: '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c' (Rajendra Tahamata)
// We will also create additional verified fleet owners/companies in Nepal:
// 1. Everest Heavy Equipments Pvt Ltd (Kathmandu)
// 2. Himalayan Earthmovers & Infra (Bhaktapur)
// 3. Gandaki Construction & Plant Hire (Pokhara)
// 4. Lumbini Heavy Fleet & Logistics (Butwal)
// 5. Eastern Nepal Haulage & Cranes (Biratnagar)

const extraOwners = [
  { id: 'a1b2c3d4-e5f6-47a8-b9c0-111111111111', name: 'Everest Heavy Equipment Hub', email: 'everest.fleet@equipshare.np', phone: '+977-9801122334', type: 'owner' },
  { id: 'a1b2c3d4-e5f6-47a8-b9c0-222222222222', name: 'Himalayan Earthmovers & Infra', email: 'himalayan.earth@equipshare.np', phone: '+977-9841239876', type: 'owner' },
  { id: 'a1b2c3d4-e5f6-47a8-b9c0-333333333333', name: 'Gandaki Plant & Tipper Rentals', email: 'gandaki.plant@equipshare.np', phone: '+977-9856012345', type: 'owner' },
  { id: 'a1b2c3d4-e5f6-47a8-b9c0-444444444444', name: 'Lumbini Heavy Fleet Logistics', email: 'lumbini.haulage@equipshare.np', phone: '+977-9812345678', type: 'owner' },
  { id: 'a1b2c3d4-e5f6-47a8-b9c0-555555555555', name: 'Chitwan Commercial Machinery', email: 'chitwan.machinery@equipshare.np', phone: '+977-9865432109', type: 'owner' }
];

const allOwnerIds = [
  '5ef234a9-39bd-4f30-9206-bcfcd0ef1f8c', // Rajendra Tahamata
  'a1b2c3d4-e5f6-47a8-b9c0-111111111111',
  'a1b2c3d4-e5f6-47a8-b9c0-222222222222',
  'a1b2c3d4-e5f6-47a8-b9c0-333333333333',
  'a1b2c3d4-e5f6-47a8-b9c0-444444444444',
  'a1b2c3d4-e5f6-47a8-b9c0-555555555555'
];

const locations = [
  'Bhaktapur', 'Kathmandu', 'Lalitpur', 'Pokhara', 'Chitwan', 
  'Butwal', 'Bhairahawa', 'Hetauda', 'Biratnagar', 'Dhading', 'Kavre'
];

// Curated 85 realistic vehicles across tippers, graders, excavators, loaders, rollers, cranes, etc.
const vehicleCatalog = [
  // --- TIPPERS & DUMP TRUCKS (15) ---
  {
    title: "Tata Signa 2823.K HD 9-Speed Tipper",
    sub_category: "Heavy Tipper (16 Cu.M)",
    price: 18500,
    img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    desc: "Cummins ISBe 5.6L BS6 engine delivering 230 HP and 850 Nm torque. Equipped with 16 cubic meter rock body, heavy-duty planetary hub-reduction bogie axles, and air-conditioned crash-tested day cab. Ideal for riverbed gravel, crushed aggregate, and highway embankment muck hauling across Nepal."
  },
  {
    title: "Tata Prima 2830.K Heavy Muck Tipper",
    sub_category: "Heavy Tipper (18 Cu.M)",
    price: 22000,
    img: "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1200&q=80",
    desc: "Equipped with 300 HP high-torque diesel powertrain, Eaton 9-speed manual gearbox, and heavy-duty reinforced chassis frame. Features air suspension driver seat and anti-lock braking system. Perfect for hydropower tunnel spoil removal and high-volume highway earthmoving."
  },
  {
    title: "Ashok Leyland 2820-6x4 Tipper",
    sub_category: "Heavy Tipper (14 Cu.M)",
    price: 16500,
    img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80",
    desc: "iGen6 H-series 200 HP turbo engine with i-Alert telematics. Hardox high-tensile steel tipping tub with front-end multi-stage hydraulic tipping ram. Suitable for road subgrade material transport and river quarry aggregate logistics."
  },
  {
    title: "Ashok Leyland Captain 2518 Heavy Tipper",
    sub_category: "Tipper (12 Cu.M)",
    price: 15000,
    img: "https://images.unsplash.com/photo-1586191582066-5e5888e02d33?auto=format&fit=crop&w=1200&q=80",
    desc: "180 HP H-Series engine with unitized wheel bearings and deep reduction rear differential. Ergonomic Captain day cab with roll-over protective structure. Widely used for urban construction material delivery and foundation soil evacuation."
  },
  {
    title: "BharatBenz 2823C 6x4 Construction Tipper",
    sub_category: "Mining & Heavy Tipper",
    price: 21000,
    img: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=80",
    desc: "OM926 240 HP fuel-efficient engine with 6-speed G131 manual transmission. Heavy inverted boogey suspension and thick wear-resistant scoop end rock body. Proven stability on steep hillside grades and rugged gravel haul roads."
  },
  {
    title: "BharatBenz 3528CM 8x4 Mining Dump Truck",
    sub_category: "Heavy Tipper (22 Cu.M)",
    price: 28000,
    img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    desc: "Four-axle 35-tonne gross vehicle weight heavy tipper with 280 HP powertrain. Designed for heavy quarrying, cement plant limestone haulage, and major hydropower dam construction sites in Nepal."
  },
  {
    title: "Eicher Pro 6028T Heavy Quarry Tipper",
    sub_category: "Quarry Tipper (16 Cu.M)",
    price: 17500,
    img: "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1200&q=80",
    desc: "VEDX5 210 HP high-torque engine with engine management system. Strong 285 mm ladder chassis with bell-crank tipping linkage for rapid discharge cycles. Highly economical for canal dredging and road widening operations."
  },
  {
    title: "Eicher Pro 8035XM 8x4 Extreme Hauler",
    sub_category: "Mining Dump Truck (23 Cu.M)",
    price: 29500,
    img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80",
    desc: "Volvo Group technology VEDX8 7.7-litre 350 HP engine churning 1350 Nm torque. Hub reduction axles with inter-wheel differential locks. Built for non-stop deep open pit stone quarries and mega highway cuts."
  },
  {
    title: "MAN CLA 26.280 6x4 Rugged Tipper",
    sub_category: "Heavy Tipper (16 Cu.M)",
    price: 23000,
    img: "https://images.unsplash.com/photo-1586191582066-5e5888e02d33?auto=format&fit=crop&w=1200&q=80",
    desc: "German engineered D0836 common-rail 280 HP engine with 9-speed synchromesh transmission. High ground clearance, heavy planetary rear axle, and robust tipping hydraulics capable of handling wet boulders and dense ballast."
  },
  {
    title: "Scania G440 8x4 Heavy Heavy Duty Tipper",
    sub_category: "Heavy Duty Hauler (24 Cu.M)",
    price: 36000,
    img: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=80",
    desc: "440 HP 13-litre engine with Scania Opticruise automated gearbox and retarder brake. Ultra-durable Hardox 450 rock box, hub reduction rear bogies, and reinforced cab. Ideal for critical Himalayan tunneling and road cut projects."
  },
  {
    title: "Volvo FMX 460 8x4 Mining Tipper",
    sub_category: "Mining Dump Truck (24 Cu.M)",
    price: 38000,
    img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    desc: "D13A 460 HP engine with I-Shift off-road crawler transmission. Heavy-duty cast iron front towing crossmember, dual front steer axles, and high payload volume. Maximum uptime for heavy industrial infrastructure."
  },
  {
    title: "Tata Signa 1918.K Medium 6-Wheeler Tipper",
    sub_category: "Medium Tipper (8.5 Cu.M)",
    price: 11500,
    img: "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1200&q=80",
    desc: "180 HP BS6 diesel engine with high maneuverability for narrow hill road construction, residential site clearing, and municipal aggregate distribution throughout Kathmandu valley."
  },
  {
    title: "Ashok Leyland 1920 Medium Tipper",
    sub_category: "Medium Tipper (8.5 Cu.M)",
    price: 11000,
    img: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80",
    desc: "200 HP H-Series turbo diesel with dual-mode fuel economy switch. 6-speed overdrive gearbox and sturdy box-type chassis frame. Excellent for regional bridge construction and drainage trenches."
  },
  {
    title: "SANY SKT90S Wide-Body Mining Dump Truck",
    sub_category: "Off-Highway Mining Tipper (35 Cu.M)",
    price: 45000,
    img: "https://images.unsplash.com/photo-1586191582066-5e5888e02d33?auto=format&fit=crop&w=1200&q=80",
    desc: "Weichai 530 HP heavy mining diesel engine with Allison automatic transmission. Payload capacity of 60 tonnes. Engineered exclusively for off-highway mega earthworks, airport runways, and hydroelectric barrage construction."
  },
  {
    title: "CAT 773G Off-Highway Haul Truck",
    sub_category: "Rigid Dump Truck (35.2 Cu.M)",
    price: 65000,
    img: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C27 ACERT 775 HP tier engine with 7-speed planetary powershift transmission. Gross payload capacity of 55 metric tons. World-class traction control and retarding system for extreme mountain haul road conditions."
  },

  // --- MOTOR GRADERS (10) ---
  {
    title: "Caterpillar 140M3 All-Wheel Drive Motor Grader",
    sub_category: "Motor Grader (14 ft)",
    price: 36000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C9.3 ACERT 250 HP engine with variable horsepower technology. 14-foot moldboard with blade float and pitch hydraulics. Electro-hydraulic joystick controls replace levers for millimeter precision in airport runways and national highway sub-base grading."
  },
  {
    title: "Caterpillar 120 GC Road Grader",
    sub_category: "Motor Grader (12 ft)",
    price: 28000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C4.4 171 HP engine paired with planetary powershift transmission. 12-foot high-carbon steel moldboard and rear ripper attachment. Built for durable road maintenance, rural road reshaping, and municipal shoulder leveling."
  },
  {
    title: "Komatsu GD535-5 Articulated Motor Grader",
    sub_category: "Motor Grader (12 ft)",
    price: 29000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Komatsu SAA4D107E-1 145 HP turbocharged diesel engine with dual-mode transmission (torque converter with lockup). Tight turning radius of 6.6m with 25-degree articulation. Outstanding for mountain roads and urban arterial grading."
  },
  {
    title: "Komatsu GD675-6 Heavy Precision Grader",
    sub_category: "Motor Grader (14 ft)",
    price: 38000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "218 HP engine with lockup torque converter and 8-forward/4-reverse transmission. Heavy circle drive slip clutch and multi-shank rear ripper. Delivers high blade downforce for hard soil scraping and gravel road rehabilitation."
  },
  {
    title: "SANY SMG200C-8 Highway Motor Grader",
    sub_category: "Motor Grader (14 ft)",
    price: 27000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Cummins 205 HP engine with ZF powershift gearbox and Meritor drive axle. High-strength rolled circle with wear-resistant bronze inserts. Highly popular for Nepal Postal Highway and Mid-Hill Highway grading packages."
  },
  {
    title: "SANY SAG120-3 Compact Motor Grader",
    sub_category: "Compact Grader (10 ft)",
    price: 21000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "128 HP engine with 10-foot moldboard and hydraulic circle side-shift. Compact footprint allows access to narrow feeder roads, irrigation access paths, and terraced agricultural project development."
  },
  {
    title: "Liugong CLG4180D Heavy Motor Grader",
    sub_category: "Motor Grader (13 ft)",
    price: 25000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Cummins 6BTA 180 HP engine with electro-hydraulic control transmission. Features a full 360-degree blade rotation circle, front dozer blade, and rear scarifier. Reliable workhorse for contractor road surfacing contracts."
  },
  {
    title: "SDLG G9190F High-Speed Motor Grader",
    sub_category: "Motor Grader (13.5 ft)",
    price: 26000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Deutz 198 HP common-rail engine with three power curve modes. Load-sensing hydraulic system provides seamless simultaneous operation of moldboard lift, tilt, and articulation."
  },
  {
    title: "CASE 865B Variable Horsepower Grader",
    sub_category: "Motor Grader (14 ft)",
    price: 33000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "FPT 6.7L engine delivering 193 to 220 HP depending on gear selection. Heavy A-frame drawbar with outside circle teeth for maximum torque transmission under heavy blade loads."
  },
  {
    title: "John Deere 672G Six-Wheel Drive Grader",
    sub_category: "Motor Grader (14 ft)",
    price: 41000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "John Deere PowerTech 9.0L 255 HP engine with true dual-path hydrostatic front-wheel drive. Unmatched tractive effort in slippery mud, snow removal on mountain passes, and loose sand."
  },

  // --- CRAWLER & WHEELED EXCAVATORS (15) ---
  {
    title: "CAT 320 GC Heavy Hydraulic Excavator",
    sub_category: "Crawler Excavator (20 Ton)",
    price: 26000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C4.4 146 HP engine with electro-hydraulic pilot control system. Standard 1.0 m3 heavy-duty bucket with rock teeth. Best-in-class fuel efficiency for medium earthmoving, foundation digging, and canal trenching."
  },
  {
    title: "CAT 336 D2L Mining Excavator",
    sub_category: "Crawler Excavator (36 Ton)",
    price: 42000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C9 ACERT 300 HP engine with 1.9 m3 severe-duty rock bucket and heavy-duty undercarriage. Built for crushing river boulders, quarry excavation, and heavy hillside road cutting."
  },
  {
    title: "Komatsu PC210-10M0 Heavy Duty Excavator",
    sub_category: "Crawler Excavator (21 Ton)",
    price: 25000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "165 HP Komatsu SAA6D107E-1 engine with 1.2 m3 bucket. Reinforced boom, arm, and track frame for high-impact durability. Equipped with KOMTRAX satellite telematics and hydraulic hammer piping."
  },
  {
    title: "Komatsu PC350LC-8 Long Undercarriage Excavator",
    sub_category: "Crawler Excavator (35 Ton)",
    price: 40000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "260 HP engine with high-pressure common rail fuel injection. Extended track length provides superior stability while handling massive quarry rocks and deep pipeline trench excavations."
  },
  {
    title: "Hitachi ZX210LC-5G Zaxis Excavator",
    sub_category: "Crawler Excavator (21 Ton)",
    price: 25500,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Isuzu 168 HP diesel engine with HIOS III hydraulic system for rapid combined boom and swing movements. Reliable under heavy tropical monsoons and abrasive river gravel operations."
  },
  {
    title: "Hitachi ZX370LCH-5G Quarry Heavy Excavator",
    sub_category: "Crawler Excavator (37 Ton)",
    price: 44000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "250 HP engine with heavy H-spec reinforced boom and arm. Features heavy steel side bumpers, full track guards, and 2.1 m3 rock bucket for continuous stone crusher feeding."
  },
  {
    title: "Hyundai Robex 210-9 SMART Excavator",
    sub_category: "Crawler Excavator (21 Ton)",
    price: 23500,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Cummins 140 HP 6BT engine known for easy maintenance and bulletproof reliability in remote regions of Nepal. Advanced CAPO computer aided power optimization system."
  },
  {
    title: "Hyundai Robex 340LC-9 Mega Excavator",
    sub_category: "Crawler Excavator (34 Ton)",
    price: 39000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "276 HP Cummins engine with 1.8 m3 heavy rock bucket. Large air conditioned operator cab with vibration damper mountings for 12-hour continuous tunnel and quarry shifts."
  },
  {
    title: "SANY SY215C-9 Ace Excavator",
    sub_category: "Crawler Excavator (21.5 Ton)",
    price: 24000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Mitsubishi 155 HP engine with customized Kawasaki hydraulic pumps. Enhanced digging force of 152 kN and standard breaker line installation for high-impact rock hammering."
  },
  {
    title: "SANY SY380H Heavy Mining Excavator",
    sub_category: "Crawler Excavator (38 Ton)",
    price: 46000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "Isuzu 284 HP engine with high-pressure positive flow hydraulic circuit. Structural elements forged from ultra-high tensile alloy plate for severe mining and boulder breaking duty."
  },
  {
    title: "Kobelco SK220XD Super Earth Excavator",
    sub_category: "Crawler Excavator (22 Ton)",
    price: 26000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Hino 158 HP engine with extreme-durability XD boom and arm. Features Arm Interflow System for fastest cycle times in soil loading and deep retaining wall footing digging."
  },
  {
    title: "Doosan DX225LCA Track Excavator",
    sub_category: "Crawler Excavator (22.5 Ton)",
    price: 24500,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Doosan DB58TIS mechanical fuel injection 150 HP engine capable of running smoothly on local diesel grades. Excellent torque response and robust track rollers."
  },
  {
    title: "Volvo EC210D Prime Excavator",
    sub_category: "Crawler Excavator (21 Ton)",
    price: 27000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Volvo D5E 167 HP tier-3 engine with Volvo Care Cab offering ROPS/FOPS operator safety, best-in-class air filtering, and ultra-smooth proportional hydraulic control."
  },
  {
    title: "Doosan DX140W Wheeled Mobile Excavator",
    sub_category: "Wheeled Excavator (14 Ton)",
    price: 23000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "Road-legal rubber-tired mobile excavator with 132 HP engine, travel speed up to 37 km/h, and stabilizing outriggers. Eliminates low-bed haulage costs for city pipeline repair and ditching."
  },
  {
    title: "Hyundai R140W-9S Wheeled Excavator",
    sub_category: "Wheeled Excavator (14 Ton)",
    price: 22500,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Equipped with dozer blade, front axle oscillation lock, and 0.6 m3 general purpose trenching bucket. Highly versatile for municipal drainage, utility laying, and roadside maintenance."
  },

  // --- BACKHOE LOADERS (10) ---
  {
    title: "JCB 3DX Super EcoXcellence Backhoe Loader",
    sub_category: "Backhoe Loader (4x4)",
    price: 13500,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "JCB ecoMAX 76 HP engine with LiveLink telematics. 4-wheel drive, 1.1 m3 front loader shovel, and 0.26 m3 heavy backhoe bucket. The most iconic and ubiquitous multipurpose contractor machine in Nepal."
  },
  {
    title: "JCB 4DX Heavy Four-Wheel Steer Backhoe",
    sub_category: "Backhoe Loader (High-Cap)",
    price: 16000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "92 HP turbocharged engine with 4-wheel steering and large equal-sized tires for extreme flotation in deep river clay, hillside slopes, and agricultural terrace construction."
  },
  {
    title: "CAT 424B2 Heavy-Duty Backhoe Loader",
    sub_category: "Backhoe Loader (4x2/4x4)",
    price: 14000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat 3054C naturally aspirated engine delivering 76 HP. Curved excavator-style boom provides high obstacle clearance when loading tall-sided tippers and dump trucks."
  },
  {
    title: "CASE 770 EX Magnum Backhoe Loader",
    sub_category: "Backhoe Loader (4x4)",
    price: 13000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "FPT 86 HP S8000 engine with Carraro synchromesh transmission. Heavy-duty cast iron front axle and stabilizer legs with integrated lock valves for rock-solid stability."
  },
  {
    title: "CASE 851 FX Industrial Backhoe Loader",
    sub_category: "Backhoe Loader (97 HP)",
    price: 15500,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "97 HP turbocharged intercooled engine with powershift gearbox. High loader lift capacity of 3450 kg. Ideal for quarry sorting, heavy boulder handling, and canal construction."
  },
  {
    title: "Mahindra EarthMaster VX 4WD Backhoe",
    sub_category: "Backhoe Loader (4x4)",
    price: 12500,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "DITEC 74 HP engine with Banana Boom design providing superior reach and dump height. Advanced joystick controls and fuel-saving Eco/Power operating modes."
  },
  {
    title: "Tata Hitachi Shinrai Backhoe Loader",
    sub_category: "Backhoe Loader",
    price: 13800,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Japanese designed Shinrai platform with 74 HP diesel engine. Unmatched cabin visibility, high breakout force, and 6-in-1 multipurpose bottom dump loader bucket."
  },
  {
    title: "Terex TLB 844 Industrial Backhoe",
    sub_category: "Backhoe Loader (4x4)",
    price: 13200,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "90 HP turbo engine with heavy planetary axles. Deep digging depth up to 4.7 meters with hydraulic breaker attachments available on request."
  },
  {
    title: "Komatsu WB93R-5 Rigid Backhoe Loader",
    sub_category: "Backhoe Loader",
    price: 15000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "99 HP engine with closed-center load sensing hydraulic system (CLSS). Proportional pilot levers allow simultaneous digging and swinging with effortless ease."
  },
  {
    title: "Escorts DigMAX II 4WD Backhoe",
    sub_category: "Backhoe Loader",
    price: 12000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Economical 76 HP Kirloskar diesel engine with reinforced box boom. Low maintenance cost and readily available parts across all 7 provinces of Nepal."
  },

  // --- BULLDOZERS & CRAWLER DOZERS (8) ---
  {
    title: "CAT D6R Heavy Crawler Bulldozer",
    sub_category: "Crawler Dozer (20 Ton)",
    price: 45000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C9 ACERT 185 HP engine with elevated sprocket design for exceptional balance and protected final drives. Semi-Universal SU blade with hydraulic tilt and single shank ripper. Primary machine for mountain road pioneering and landfill leveling."
  },
  {
    title: "CAT D8T Mining & Heavy Earth Dozer",
    sub_category: "Crawler Dozer (38 Ton)",
    price: 68000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C15 ACERT 310 HP engine. Differential steering maintains full power to both tracks in turns. Gigantic 8.6 m3 blade capacity for large-scale river containment dikes and expressway cuts."
  },
  {
    title: "Komatsu D65EX-16 Semi-U Dozer",
    sub_category: "Crawler Dozer (21 Ton)",
    price: 42000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Komatsu SAA6D114E-3 205 HP engine with automatic transmission with lockup torque converter. High blade capacity with Sigmadozer profile for 15% higher pushing efficiency."
  },
  {
    title: "Komatsu D85ESS-2 Heavy Track Dozer",
    sub_category: "Crawler Dozer (23 Ton)",
    price: 46000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "215 HP mechanical engine designed specifically for challenging fuel qualities. Left joystick controls all directional movements. Strong multi-shank parallelogram ripper."
  },
  {
    title: "Shantui SD16 Standard Crawler Dozer",
    sub_category: "Crawler Dozer (17 Ton)",
    price: 32000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Weichai 160 HP engine with planetary powershift transmission and wet steering clutch. Straight tilt blade with 4.5 m3 capacity. Highly economical rental rate for site pioneering."
  },
  {
    title: "Shantui SD22 Heavy Mountain Dozer",
    sub_category: "Crawler Dozer (24 Ton)",
    price: 44000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Cummins NT855 220 HP engine. Heavy track shoes and reinforced blade push arms engineered for rocky Himalayan terrain and heavy debris clearing during monsoon landslides."
  },
  {
    title: "Case 1650L High-Precision Dozer",
    sub_category: "Crawler Dozer (18 Ton)",
    price: 35000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "FPT 168 HP engine with hydrostatic transmission offering infinite speed control and counter-rotation. 6-way PAT (Power Angle Tilt) blade for fine grade finishing."
  },
  {
    title: "Liebherr PR 736 Litronic Crawler Dozer",
    sub_category: "Crawler Dozer (22 Ton)",
    price: 48000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Liebherr 217 HP common-rail engine with stepless hydrostatic drive. Outstanding fuel efficiency and electronic dozer assist system for precise slope and embankment formation."
  },

  // --- ROAD ROLLERS & SOIL COMPACTORS (8) ---
  {
    title: "Hamm 311D Single Drum Soil Compactor",
    sub_category: "Vibratory Roller (11 Ton)",
    price: 15000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "105 HP engine with 3-point articulation joint for unmatched driving stability and steering control. High static linear load of 30 kg/cm with dual amplitude vibration for sub-base compaction."
  },
  {
    title: "Hamm HD 90 Tandem Asphalt Roller",
    sub_category: "Tandem Roller (9 Ton)",
    price: 16500,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Dual smooth steel drums with pressurized water sprinkling system and crab steering mode. Delivers mirror-finish asphalt blacktopping on national highways and city roads."
  },
  {
    title: "Dynapac CA250D Soil Vibratory Compactor",
    sub_category: "Vibratory Roller (11 Ton)",
    price: 14500,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Cummins 110 HP engine with heavy drum shell thickness of 25mm. High centrifugal compaction force up to 240 kN for thick rock-fill layers and clay foundation compaction."
  },
  {
    title: "Dynapac CC4200 Tandem Asphalt Compactor",
    sub_category: "Asphalt Roller (10.5 Ton)",
    price: 17500,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "High frequency vibration system ensuring maximum density in fewer passes on hot-mix asphalt overlays. Dual swivel driver seats with ergonomic lever controls."
  },
  {
    title: "BOMAG BW 211 D-5 Heavy Soil Roller",
    sub_category: "Soil Compactor (11.5 Ton)",
    price: 15500,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Deutz 128 HP engine with BOMAG Economizer live compaction indicator. Gradeability up to 45% for steep mountain road cuts and embankment side-slope compaction."
  },
  {
    title: "CAT CS11 GC Smooth Drum Compactor",
    sub_category: "Soil Compactor (11 Ton)",
    price: 16000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C4.4 112 HP engine with exclusive pod-style eccentric weight system for reliable dual amplitude operation. Padfoot shell kit available for plastic cohesive soils."
  },
  {
    title: "JCB 116D Soil Compactor",
    sub_category: "Soil Compactor (11.3 Ton)",
    price: 14000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "JCB ecoMAX 114 HP engine with pre-cleaner cyclone air intake. Center articulated joint with high oscillation angle ensures constant drum contact on uneven subgrades."
  },
  {
    title: "CASE 1107 EX Vibratory Soil Compactor",
    sub_category: "Soil Compactor (11 Ton)",
    price: 13500,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "FPT 104 HP engine with heavy 32 mm thick drum shell. Dual frequency and dual amplitude settings for versatile compaction of sand, gravel, and crushed stone base layers."
  },

  // --- MOBILE WHEEL LOADERS (8) ---
  {
    title: "CAT 950GC Heavy Wheel Loader",
    sub_category: "Wheel Loader (3.1 Cu.M)",
    price: 28000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C7.1 ACERT 241 HP engine with load-sensing hydraulic system and 4-speed planetary powershift transmission. Operating weight 18.6 tonnes with 3.1 m3 bucket for crusher hopper loading."
  },
  {
    title: "CAT 966H High-Volume Wheel Loader",
    sub_category: "Wheel Loader (4.2 Cu.M)",
    price: 38000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Cat C11 ACERT 262 HP engine with heavy planetary axles. Massive breakout force of 188 kN. Primary loader for loading tipper convoys at river aggregate extraction depots."
  },
  {
    title: "Komatsu WA380-6 All-Round Wheel Loader",
    sub_category: "Wheel Loader (3.3 Cu.M)",
    price: 27000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "191 HP Komatsu engine with large-capacity torque converter and variable transmission cut-off. High tipping load and wide bucket mouth for rapid truck turnaround."
  },
  {
    title: "SDLG L958F Heavy Front-End Loader",
    sub_category: "Wheel Loader (3.2 Cu.M)",
    price: 22000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Weichai 220 HP low-speed high-torque engine with ZF 4WG200 transmission. 5-tonne payload capacity. Widely trusted across crusher plants and asphalt batching plants in Nepal."
  },
  {
    title: "Liugong CLG856H High-Performance Loader",
    sub_category: "Wheel Loader (3.0 Cu.M)",
    price: 23000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Cummins QSB6.7 220 HP engine with wet disc service brakes and ZF axles. Reinforced box-section front frame withstands heavy torsional loads while scooping blasted rock."
  },
  {
    title: "Lonking ZL50NC Heavy Wheel Loader",
    sub_category: "Wheel Loader (3.0 Cu.M)",
    price: 21000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Weichai 220 HP engine with high-dump arm configuration reaching 3.4 meters. Perfect for high-sided tipper loading and batching plant hopper charging."
  },
  {
    title: "Hyundai HL665-9 High-Reach Loader",
    sub_category: "Wheel Loader (3.1 Cu.M)",
    price: 24000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "Cummins 215 HP engine with fully automatic powershift transmission and 3 engine power modes. Features ride control system that stabilizes boom on rough haul paths."
  },
  {
    title: "XCMG ZL50GN Popular Front Loader",
    sub_category: "Wheel Loader (3.0 Cu.M)",
    price: 21500,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "220 HP powertrain with patented heavy-duty drive axles. 170 kN traction force and 162 kN breakout force. Proven workhorse in hydropower sand-washing plants."
  },

  // --- MOBILE CRANES & TELESCOPIC HANDLERS (8) ---
  {
    title: "XCMG QY25K5-I Telescopic Truck Crane",
    sub_category: "Hydraulic Truck Crane (25 Ton)",
    price: 32000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "25-tonne maximum lifting capacity with 5-section octagonal main boom extending to 39.5 meters plus 8.3m jib. Dual H-pattern outriggers provide 360-degree stability for precast bridge girder erection."
  },
  {
    title: "SANY STC500 50-Ton Truck Crane",
    sub_category: "Hydraulic Truck Crane (50 Ton)",
    price: 52000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "50-tonne lifting crane with 43.5m U-shaped boom and high-strength fine grain structural steel. Equipped with smart load moment indicator (LMI) and dual winch system for industrial plant installation."
  },
  {
    title: "SANY STC250 25-Ton Mobile Crane",
    sub_category: "Hydraulic Truck Crane (25 Ton)",
    price: 31000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Fast highway transit speed up to 80 km/h on carrier chassis. 4-section telescopic boom with high hydraulic pressure winch. Essential for electrical transmission tower assembly."
  },
  {
    title: "Zoomlion QY50V 50-Ton Mobile Crane",
    sub_category: "Hydraulic Truck Crane (50 Ton)",
    price: 50000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "Weichai 336 HP carrier engine with 42m main boom and 15m auxiliary jib. Full pilot proportional hydraulic control allows millimeter accuracy in turbine and transformer placing."
  },
  {
    title: "ACE 14XW Pick and Carry Mobile Crane",
    sub_category: "Pick & Carry Crane (14 Ton)",
    price: 11000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Articulated pick-and-carry crane with 14-tonne capacity. Front-wheel drive with hydraulic rear-wheel steering. Industry standard machine for unloading steel rebar, pipes, and structural beams on job sites."
  },
  {
    title: "ACE 20XW Heavy Hydra Crane",
    sub_category: "Pick & Carry Crane (20 Ton)",
    price: 14500,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "20-tonne capacity with 4-section slotted boom extending to 18 meters. Fitted with safe load indicator, over-hoist limit switch, and extra wide outrigger base."
  },
  {
    title: "JCB 535-95 Telehandler (Telescopic)",
    sub_category: "Telehandler (3.5 Ton / 9.5m)",
    price: 18000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "JCB 74 HP engine with all-wheel steer and 9.5-meter forward reach. Fork attachment, bucket, and personnel work platform for 3-story construction scaffolding and material delivery."
  },
  {
    title: "Manitou MT-X 1840 Heavy Telehandler",
    sub_category: "Telehandler (4.0 Ton / 18m)",
    price: 24000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "100 HP Perkins diesel engine with 18-meter vertical boom reach and 4-tonne lift capacity. Front stabilizing outriggers and frame leveling system for high-rise facade installation."
  },

  // --- CONCRETE MIXER TRUCKS & PUMPS (6) ---
  {
    title: "Tata Signa 2823.TK 7 Cu.M Transit Mixer",
    sub_category: "Transit Mixer (7 Cu.M)",
    price: 19500,
    img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    desc: "Cummins 230 HP engine with dedicated auxiliary slave engine for independent drum rotation. 7 m3 high-wear spiral blade mixing drum keeps certified RMC concrete alive during transit in Kathmandu traffic."
  },
  {
    title: "Ashok Leyland 2820 RMC Transit Mixer",
    sub_category: "Transit Mixer (7 Cu.M)",
    price: 19000,
    img: "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1200&q=80",
    desc: "iGen6 200 HP engine with Schwing Stetter concrete drum. High-pressure water pump and hose for immediate chute and drum washdown after site discharge."
  },
  {
    title: "Schwing Stetter S36X Boom Concrete Pump",
    sub_category: "Boom Concrete Pump (36 Meter)",
    price: 48000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "4-section R-Z folding 36-meter distribution boom mounted on 3-axle truck. Pumping output up to 130 m3/hour. Indispensable for continuous high-rise floor slabs and bridge pier capping."
  },
  {
    title: "Putzmeister BSA 1407D Stationary Concrete Pump",
    sub_category: "Stationary Line Pump",
    price: 18000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Deutz 115 HP trailer-mounted high-pressure concrete trailer pump. Maximum delivery pressure 106 bar. Capable of pumping structural concrete through 300 meters of pipe for tunnel linings."
  },
  {
    title: "SANY HBT6013-110D Trailer Concrete Pump",
    sub_category: "Trailer Line Pump",
    price: 17500,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Diesel-driven trailer pump with S-valve technology and 60 m3/h pumping capacity. Auto-lubrication system and wired remote control for rapid dam abutment casting."
  },
  {
    title: "Ajax Fiori Argo 4000 Self-Loading Mixer",
    sub_category: "Self-Loading Concrete Mixer (4 Cu.M)",
    price: 21000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "4-wheel drive self-loading concrete mobile batching unit with 4.0 m3 drum and integrated electronic weighing batcher. Produces certified M20/M25/M30 grade concrete anywhere on remote mountain job sites."
  },

  // --- SPECIALIZED DRILLING & CRUSHING PLANTS (4) ---
  {
    title: "Sandvik Leopard DI550 Track Rock Drill Rig",
    sub_category: "Surface DTH Drill Rig",
    price: 55000,
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    desc: "Caterpillar 440 HP engine powering onboard high-pressure air compressor. Drills 90 mm to 165 mm blast holes in hard quartzite and limestone for highway bench blasting."
  },
  {
    title: "Atlas Copco ROC D7 Crawler Blast Drill",
    sub_category: "Hydraulic Top Hammer Rig",
    price: 52000,
    img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80",
    desc: "200 HP engine with high-frequency hydraulic rock drill. Automatic rod handling system with angle indicator for accurate pre-split blasting on fragile mountain slopes."
  },
  {
    title: "Terex Finlay J-1175 Mobile Jaw Crusher",
    sub_category: "Track Mobile Crusher (350 TPH)",
    price: 65000,
    img: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    desc: "Heavy-duty track mobile jaw crusher with 1070mm x 760mm jaw chamber. Direct hydrostatic drive with reverse clearing action. Crushes blasted mountain rock down to 50mm base course at 300+ tonnes/hour."
  },
  {
    title: "Kleemann MC 110 PRO Track Mobile Jaw Crusher",
    sub_category: "Mobile Jaw Crusher (330 TPH)",
    price: 68000,
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    desc: "Continuous Feed System (CFS) ensures optimal crusher chamber filling. Integrated pre-screen separates dirt and fine gravel before the jaw, maximizing clean aggregate production."
  }
];

// Let's generate SQL insert statements
let sql = `
-- ============================================================
-- EQUIPSHARE FLEET EXPANSION SEED
-- Adds 5 Verified Machinery Owners and 85 Construction Vehicles
-- ============================================================

BEGIN;

-- 1. Insert Additional Fleet Owners
`;

extraOwners.forEach(o => {
  sql += `INSERT INTO users (id, full_name, email, phone_number, password_hash, user_type, is_disabled)
VALUES ('${o.id}', '${o.name}', '${o.email}', '${o.phone}', '\$2a\$10\$X7pUj3rRkC5v2d8xQ9y1eeW3aB2c4d5e6f7g8h9i0j1k2l3m4n5o', '${o.type}', FALSE)
ON CONFLICT (email) DO NOTHING;\n`;
});

sql += `\n-- 2. Insert 85 Detailed Heavy Construction Vehicles & Tippers\n`;

vehicleCatalog.forEach((v, idx) => {
  const ownerId = allOwnerIds[idx % allOwnerIds.length];
  const loc = locations[idx % locations.length];
  const cleanTitle = v.title.replace(/'/g, "''");
  const cleanSub = v.sub_category.replace(/'/g, "''");
  const cleanDesc = v.desc.replace(/'/g, "''");

  sql += `INSERT INTO equipment (owner_id, title, category, sub_category, description, price_per_day, location, image_url, is_available)
VALUES (
  '${ownerId}',
  '${cleanTitle}',
  'Construction',
  '${cleanSub}',
  '${cleanDesc}',
  ${v.price},
  '${loc}',
  '${v.img}',
  TRUE
);\n`;
});

sql += `\nCOMMIT;\n`;

fs.writeFileSync('d:/Rajendra/Vehicle Share/backend/sql/seed_85_vehicles.sql', sql);
console.log('Successfully generated SQL script with', vehicleCatalog.length, 'vehicles!');

