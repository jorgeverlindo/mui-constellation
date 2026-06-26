// Static vehicle make → model → trim dataset.
// Extend by adding entries to VEHICLE_DB below.

const VEHICLE_DB: Record<string, Record<string, string[]>> = {
  Acura: {
    'Integra':   ['Base', 'A-Spec', 'A-Spec Technology', 'Type S', 'Type S w/ HPT'],
    'MDX':       ['Base', 'Technology', 'A-Spec', 'Advance', 'Type S', 'Type S Advance'],
    'RDX':       ['Base', 'Technology', 'A-Spec', 'A-Spec Technology', 'Advance'],
    'TLX':       ['Base', 'Technology', 'A-Spec', 'A-Spec Technology', 'Advance', 'Type S', 'Type S w/ Performance Tire'],
  },
  Audi: {
    'A3':        ['Premium', 'Premium Plus', 'Prestige', 'S3 Premium', 'S3 Premium Plus', 'S3 Prestige'],
    'A4':        ['Premium', 'Premium Plus', 'Prestige', 'S4 Premium', 'S4 Premium Plus', 'S4 Prestige'],
    'A6':        ['Premium', 'Premium Plus', 'Prestige', 'S6 Premium', 'S6 Premium Plus'],
    'Q5':        ['Premium', 'Premium Plus', 'Prestige', 'S line Premium', 'SQ5 Premium', 'SQ5 Prestige'],
    'Q7':        ['Premium', 'Premium Plus', 'Prestige', 'SQ7 Premium', 'SQ7 Prestige'],
    'Q8':        ['Premium', 'Premium Plus', 'Prestige', 'RS Q8 Premium', 'RS Q8 Prestige'],
    'e-tron GT': ['Premium', 'Premium Plus', 'Prestige', 'RS e-tron GT'],
  },
  BMW: {
    '2 Series':  ['230i', '230i xDrive', 'M240i', 'M240i xDrive', 'M2'],
    '3 Series':  ['330i', '330i xDrive', '330e', '330e xDrive', 'M340i', 'M340i xDrive'],
    '5 Series':  ['530i', '530i xDrive', '530e', '540i', '540i xDrive', 'M550i xDrive'],
    '7 Series':  ['740i', '740i xDrive', '750e xDrive', 'M760e xDrive', 'Alpina B7'],
    'M3':        ['Base', 'Competition', 'Competition xDrive', 'CS', 'CS xDrive'],
    'M4':        ['Coupe', 'Competition Coupe', 'Competition xDrive', 'CSL', 'Convertible', 'Competition Convertible'],
    'M5':        ['Base', 'Competition', 'Competition xDrive', 'CS'],
    'M8':        ['Coupe', 'Competition Coupe', 'Gran Coupe', 'Competition Gran Coupe'],
    'X3':        ['sDrive30i', 'xDrive30i', 'M40i', 'M Competition'],
    'X5':        ['sDrive40i', 'xDrive40i', 'xDrive50e', 'M60i', 'M Competition'],
    'X7':        ['xDrive40i', 'xDrive50i', 'Alpina XB7', 'M70 xDrive'],
  },
  Chevrolet: {
    'Camaro':    ['LS', 'LT', 'LT1', 'SS', 'SS 1LE', 'ZL1', 'ZL1 1LE'],
    'Colorado':  ['WT', 'LT', 'Trail Boss', 'Z71', 'ZR2', 'ZR2 Bison'],
    'Corvette':  ['Stingray', 'Stingray 3LT', 'E-Ray', 'Z06', 'Z06 3LZ'],
    'Silverado 1500': ['WT', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'High Country', 'ZR2'],
    'Suburban':  ['LS', 'LT', 'RST', 'Premier', 'Z71', 'High Country'],
    'Tahoe':     ['LS', 'LT', 'RST', 'Premier', 'Z71', 'High Country'],
  },
  Ferrari: {
    '296 GTB':      ['Base', 'Assetto Fiorano'],
    '296 GTS':      ['Base', 'Assetto Fiorano'],
    '458 Italia':   ['Base', 'Speciale', 'Speciale A', 'Spider'],
    'F8 Tributo':   ['Base', 'Spider'],
    'GTC4Lusso':    ['Base', 'T'],
    'Portofino M':  ['Base'],
    'Purosangue':   ['Base'],
    'Roma':         ['Base', 'Spider'],
    'SF90 Stradale':['Base', 'Assetto Fiorano', 'Spider'],
  },
  Dodge: {
    'Challenger': ['SXT', 'GT', 'R/T', 'R/T Scat Pack', 'R/T Scat Pack Widebody', 'SRT Hellcat', 'SRT Hellcat Widebody', 'SRT Super Stock', 'SRT Demon 170'],
    'Charger':    ['SXT', 'GT', 'R/T', 'Scat Pack', 'Scat Pack Widebody', 'SRT Hellcat', 'SRT Hellcat Widebody', 'SRT Super Stock'],
    'Durango':    ['SXT', 'GT', 'Citadel', 'R/T', 'SRT 392', 'SRT Hellcat'],
  },
  Ford: {
    'Bronco':    ['Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Badlands', 'Wildtrak', 'Everglades', 'Raptor', 'Heritage', 'Heritage Limited'],
    'Explorer':  ['Base', 'XLT', 'ST-Line', 'Limited', 'ST', 'Timberline', 'Platinum', 'King Ranch'],
    'F-150':     ['Regular Cab', 'XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Raptor', 'Raptor R'],
    'Maverick':  ['XL', 'XLT', 'Lariat', 'Tremor'],
    'Mustang':   ['EcoBoost', 'EcoBoost Premium', 'GT', 'GT Premium', 'GT500', 'GT500 KR', 'Dark Horse'],
    'Mustang Mach-E': ['Select', 'California Route 1', 'Premium', 'GT', 'GT Performance Edition'],
  },
  Genesis: {
    'G70':       ['Standard', '2.0T', '3.3T Sport', '3.3T Sport Advanced'],
    'G80':       ['Standard', '2.5T', '3.5T', '3.5T Sport Prestige', 'Electrified'],
    'GV70':      ['Standard', '2.5T', '3.5T', '3.5T Sport Prestige', 'Electrified'],
    'GV80':      ['Standard', '2.5T', '2.5T Prestige', '3.5T', '3.5T Prestige'],
  },
  Honda: {
    'Accord':    ['LX', 'Sport', 'EX-L', 'Sport 2.0T', 'Touring', 'Hybrid Sport', 'Hybrid EX-L', 'Hybrid Touring'],
    'Civic':     ['LX', 'Sport', 'EX', 'Touring', 'Si', 'Type R', 'Type R Limited Edition'],
    'CR-V':      ['LX', 'EX', 'EX-L', 'Sport', 'Sport-L', 'Touring', 'Hybrid EX', 'Hybrid EX-L', 'Hybrid Touring'],
    'HR-V':      ['LX', 'Sport', 'EX-L'],
    'Odyssey':   ['LX', 'EX', 'EX-L', 'Touring', 'Elite'],
    'Passport':  ['Sport', 'EX-L', 'TrailSport', 'Touring', 'Elite'],
    'Pilot':     ['LX', 'EX-L', 'Sport', 'TrailSport', 'Elite', 'Black Edition'],
    'Ridgeline': ['Sport', 'RTL', 'RTL-E', 'Black Edition'],
  },
  Hyundai: {
    'Elantra':   ['SE', 'SEL', 'N Line', 'Limited', 'N', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited'],
    'Ioniq 5':   ['Standard Range RWD', 'Long Range RWD', 'Long Range AWD', 'N'],
    'Ioniq 6':   ['Standard Range RWD', 'Long Range RWD', 'Long Range AWD'],
    'Palisade':  ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy'],
    'Santa Fe':  ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy', 'Hybrid SEL', 'Plug-in Hybrid SEL', 'Plug-in Hybrid Limited'],
    'Sonata':    ['SE', 'SEL', 'SEL Plus', 'N Line', 'Limited'],
    'Tucson':    ['SE', 'SEL', 'XRT', 'N Line', 'Limited', 'Hybrid Blue', 'Plug-in Hybrid SEL', 'Plug-in Hybrid N Line'],
  },
  Lamborghini: {
    'Aventador':    ['LP 740-4 S', 'LP 770-4 SVJ', 'LP 780-4 Ultimae', 'SVJ Roadster'],
    'Huracán':      ['EVO', 'EVO RWD', 'EVO Spyder', 'EVO RWD Spyder', 'STO', 'Tecnica'],
    'Urus':         ['S', 'Performante'],
  },
  Jeep: {
    'Compass':   ['Sport', 'Latitude', 'Latitude Lux', 'Altitude', 'Limited', 'Trailhawk'],
    'Gladiator': ['Sport', 'Sport S', 'Willys', 'Overland', 'High Altitude', 'Mojave', 'Rubicon'],
    'Grand Cherokee': ['Laredo', 'Altitude', 'Limited', 'Overland', 'Summit', 'Summit Reserve', 'Trailhawk', '4xe', 'SRT', 'Trackhawk'],
    'Renegade':  ['Sport', 'Latitude', 'Altitude', 'Limited', 'Trailhawk'],
    'Wrangler':  ['Sport', 'Sport S', 'Willys Sport', 'Willys', 'Sahara', 'High Altitude', 'Freedom', 'Rubicon', 'Rubicon 392', '4xe Sahara', '4xe Rubicon'],
  },
  Kia: {
    'EV6':       ['Light Standard Range', 'Wind', 'GT-Line', 'Land', 'GT'],
    'K5':        ['LX', 'LXS', 'GT-Line', 'EX', 'GT'],
    'Seltos':    ['LX', 'S', 'EX', 'SX', 'SX Turbo'],
    'Sorento':   ['LX', 'S', 'EX', 'SX', 'SX Prestige', 'X-Line SX', 'Plug-in Hybrid EX', 'Plug-in Hybrid SX Prestige'],
    'Sportage':  ['LX', 'EX', 'X-Line', 'SX Turbo', 'SX Prestige', 'X-Line SX Prestige', 'Plug-in Hybrid EX', 'Plug-in Hybrid SX Prestige'],
    'Telluride': ['LX', 'S', 'EX', 'SX', 'SX-Prestige', 'X-Line SX', 'X-Pro'],
  },
  'Land Rover': {
    'Defender':       ['90 S', '90 SE', '90 HSE', '90 X', '90 V8', '110 S', '110 SE', '110 HSE', '110 X', '110 V8', '130 SE'],
    'Discovery':      ['S', 'SE', 'SE R-Dynamic', 'HSE', 'HSE R-Dynamic', 'X'],
    'Discovery Sport':['S', 'SE', 'SE R-Dynamic', 'HSE', 'HSE R-Dynamic'],
    'Range Rover':    ['SE', 'SE SWB', 'HSE', 'HSE SWB', 'Autobiography', 'Autobiography SWB', 'SV', 'SV SWB'],
    'Range Rover Sport': ['S', 'SE', 'SE Dynamic', 'HSE', 'Autobiography', 'Dynamic SE', 'SV Edition Two'],
    'Range Rover Velar': ['S', 'SE', 'SE R-Dynamic', 'HSE', 'HSE R-Dynamic'],
  },
  Lexus: {
    'ES':        ['250 Base', '250 Luxury', '250 Ultra Luxury', '350 Base', '350 Luxury', '350 F Sport', '300h Base', '300h Luxury', '300h Ultra Luxury'],
    'GX':        ['Premium', 'Luxury', 'Overtrail', 'Overtrail+'],
    'IS':        ['300 Base', '300 AWD', '350 Base', '350 AWD', '500 F Sport Performance'],
    'LX':        ['350 Base', '350 F Sport', '600h', '600h F Sport'],
    'NX':        ['250 Base', '250 Luxury', '250 F Sport', '350 F Sport', '350 F Sport+', '350h Luxury', '450h+ Luxury'],
    'RX':        ['350 Base', '350 Premium', '350 Luxury', '350 F Sport', '350h Luxury', '500h F Sport Performance'],
    'TX':        ['350 Base', '350 Luxury', '350 F Sport', '350 F Sport+', '500h Luxury', '500h F Sport Performance'],
    'UX':        ['200 Base', '200 Luxury', '200 F Sport', '250h Base', '250h Luxury', '250h F Sport'],
  },
  Mercedes: {
    'C-Class':   ['C 300', 'C 300 4MATIC', 'AMG C 43', 'AMG C 43 4MATIC', 'AMG C 63 S e PERFORMANCE'],
    'E-Class':   ['E 350', 'E 350 4MATIC', 'E 450', 'E 450 4MATIC', 'AMG E 53', 'AMG E 63 S'],
    'G-Class':   ['G 550', 'AMG G 63'],
    'GLC':       ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43', 'AMG GLC 63 S e PERFORMANCE'],
    'GLE':       ['GLE 350', 'GLE 350 4MATIC', 'GLE 450 4MATIC', 'AMG GLE 53', 'AMG GLE 63 S'],
    'GLS':       ['GLS 450 4MATIC', 'AMG GLS 63', 'Maybach GLS 600'],
    'S-Class':   ['S 500', 'S 500 4MATIC', 'S 580 4MATIC', 'AMG S 63 E PERFORMANCE', 'Maybach S 580', 'Maybach S 680'],
  },
  Porsche: {
    '718 Boxster': ['Base', 'S', 'T', 'GTS 4.0', 'Spyder'],
    '718 Cayman':  ['Base', 'S', 'T', 'GTS 4.0', 'GT4', 'GT4 RS'],
    '911':         ['Carrera', 'Carrera Cabriolet', 'Carrera 4', 'Carrera S', 'Carrera 4S', 'Targa 4', 'Targa 4S', 'GTS', 'GTS Cabriolet', 'Turbo', 'Turbo Cabriolet', 'Turbo S', 'GT3', 'GT3 Touring', 'GT3 RS', 'GT3 RS w/ Weissach'],
    'Cayenne':     ['Base', 'S', 'GTS', 'S E-Hybrid', 'Turbo', 'Turbo GT', 'Turbo S E-Hybrid'],
    'Macan':       ['Base', 'S', 'GTS', 'Turbo'],
    'Panamera':    ['Base', '4', 'S', '4S', 'GTS', 'Turbo', 'Turbo S', 'Turbo S E-Hybrid'],
    'Taycan':      ['Base', '4', '4S', 'GTS', 'Turbo', 'Turbo S', 'Cross Turismo Base', 'Cross Turismo Sport Turismo'],
  },
  Ram: {
    '1500':       ['Tradesman', 'Big Horn', 'Lone Star', 'Laramie', 'Rebel', 'Laramie Longhorn', 'Limited', 'Limited Longhorn', 'TRX'],
    '2500':       ['Tradesman', 'Big Horn', 'Power Wagon', 'Laramie', 'Laramie Longhorn', 'Limited', 'Limited Longhorn'],
    'ProMaster':  ['1500 Low Roof', '1500 High Roof', '2500 Low Roof', '2500 High Roof', '3500 Low Roof', '3500 High Roof'],
  },
  Subaru: {
    'BRZ':        ['Base', 'Premium', 'Limited', 'tS'],
    'Crosstrek':  ['Base', 'Premium', 'Sport', 'Limited', 'Wilderness', 'Hybrid', 'Hybrid Premium'],
    'Forester':   ['Base', 'Premium', 'Sport', 'Limited', 'Wilderness', 'Touring'],
    'Impreza':    ['Base', 'Premium', 'Sport', 'Limited', 'RS'],
    'Legacy':     ['Base', 'Premium', 'Sport', 'Limited', 'Touring XT'],
    'Outback':    ['Base', 'Premium', 'Onyx Edition', 'Sport', 'Limited', 'Wilderness', 'Limited XT', 'Touring', 'Touring XT'],
    'WRX':        ['Base', 'Premium', 'GT', 'Limited', 'tS'],
  },
  Tesla: {
    'Cybertruck': ['All-Wheel Drive', 'Cyberbeast'],
    'Model 3':    ['Standard Range RWD', 'Long Range AWD', 'Long Range RWD', 'Performance', 'Highland Long Range AWD', 'Highland Performance'],
    'Model S':    ['Long Range', 'Long Range AWD', 'Plaid'],
    'Model X':    ['Long Range', 'Long Range AWD', 'Plaid'],
    'Model Y':    ['Long Range AWD', 'Performance', 'Standard Range RWD'],
    'Roadster':   ['Base', 'Founders Series'],
  },
  Toyota: {
    'Camry':      ['LE', 'SE', 'SE Nightshade', 'XSE', 'XLE', 'TRD', 'Hybrid LE', 'Hybrid SE', 'Hybrid XLE', 'Hybrid XSE'],
    'Corolla':    ['L', 'LE', 'SE', 'XSE', 'XLE', 'Hybrid LE', 'Hybrid SE', 'Hybrid XSE'],
    'GR86':       ['Base', 'Premium'],
    'GR Corolla': ['Core', 'Circuit Edition', 'Morizo Edition'],
    'GR Supra':   ['2.0', '3.0', '3.0 Premium', '3.0 A91-MT Edition', 'A91-CF Edition'],
    'Highlander': ['L', 'LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid Limited', 'Hybrid Platinum'],
    'Land Cruiser': ['1958', 'Base', 'First Edition'],
    'RAV4':       ['LE', 'XLE', 'XLE Premium', 'TRD Off-Road', 'Adventure', 'Limited', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XLE Premium', 'Hybrid Limited', 'Prime SE', 'Prime XSE'],
    'Sequoia':    ['SR5', 'SR5 Premium', 'Limited', 'Platinum', 'TRD Pro', 'Capstone'],
    'Tacoma':     ['SR', 'SR5', 'TRD Sport', 'TRD Off-Road', 'Limited', 'TRD Pro', 'Trailhunter'],
    'Tundra':     ['SR', 'SR5', 'Limited', 'Platinum', '1794 Edition', 'Capstone', 'TRD Pro', 'Hybrid SR5', 'Hybrid Limited', 'Hybrid Platinum', 'Hybrid Capstone'],
    '4Runner':    ['SR5', 'SR5 Premium', 'TRD Sport', 'TRD Off-Road', 'TRD Off-Road Premium', 'Limited', 'TRD Pro', 'Trailhunter'],
  },
  Volkswagen: {
    'Golf GTI':  ['S', 'SE', 'Autobahn'],
    'Golf R':    ['Base'],
    'ID.4':      ['Standard', 'Pro', 'Pro S', 'Pro S Plus', 'AWD Pro', 'AWD Pro S', 'AWD Pro S Plus'],
    'Jetta':     ['S', 'Sport', 'SE', 'SEL', 'GLI S', 'GLI Autobahn'],
    'Tiguan':    ['S', 'SE', 'SE R-Line', 'SE R-Line Black', 'SEL', 'SEL R-Line'],
    'Touareg':   ['SE', 'Executive'],
  },
  Volvo: {
    'C40 Recharge': ['Core', 'Plus', 'Ultimate'],
    'EX40':       ['Core', 'Plus', 'Ultimate'],
    'EX90':       ['Core', 'Plus', 'Plus Bright', 'Ultimate', 'Ultimate Bright'],
    'S60':        ['B5 Momentum', 'B5 Plus', 'B5 Plus Dark', 'B5 Ultimate', 'Polestar Engineered', 'Recharge'],
    'V60 Cross Country': ['B5 Plus', 'B5 Ultimate'],
    'XC40':       ['Core', 'Plus', 'Plus Dark', 'Ultimate', 'Recharge Core', 'Recharge Plus'],
    'XC60':       ['B5 Momentum', 'B5 Plus', 'B5 Plus Dark', 'B5 Ultimate', 'T8 Recharge', 'Polestar Engineered'],
    'XC90':       ['B5 Momentum', 'B5 Plus', 'B5 Ultimate', 'T8 Recharge Plus', 'T8 Recharge Ultimate'],
  },
};

// ─── Query functions ───────────────────────────────────────────────────────────

/** All available makes, sorted A → Z. */
export function getMakes(): string[] {
  return Object.keys(VEHICLE_DB).sort();
}

/** Models for a given make, sorted A → Z. Returns [] for unknown makes. */
export function getModels(make: string): string[] {
  return Object.keys(VEHICLE_DB[make] ?? {}).sort();
}

/** Trims for a given make + model. Returns [] if either is unknown. */
export function getTrims(make: string, model: string): string[] {
  return VEHICLE_DB[make]?.[model] ?? [];
}

/** Model years from 1990 to current year, newest first. */
export function getYears(): string[] {
  const current = new Date().getFullYear();
  return Array.from({ length: current - 1989 }, (_, i) => String(current - i));
}
