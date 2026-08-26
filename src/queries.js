/**
 * src/queries.js
 *
 * All validation logic converted from Python/pandas (Models_AR.py) to plain JS.
 *
 * Convention:
 *   - `rows`  = array of plain objects (one per CSV row), keyed by column header
 *   - Each query returns a filtered subset of `rows`
 *   - Missing/blank values are treated the same as Python's NaN / ''
 */

'use strict';

// ── Reference lists (copied verbatim from Python) ────────────────────────────

const Gas_name   = ['Gas', 'Fuel', 'gas', 'fuel'];
const Pet_name   = ['Grooming','grooming','Day Care','day care','Spa','spa','Pet Resort','pet resort'];
const Vet_name   = ['Surgical','neuter','spay','emergency','mobile','dental','Neuter','Spay','Emergency','Mobile','Dental'];
const Farm_Feed  = ['Grain Elevator','agricultural','equipment','Equipment','Agricultural'];
const Pet_superstore = ['petco','Unleashed by petco','Petsmart','Petco'];

const Local_Sub_Channel_List = [
  '[3] Vet Clinic','Fulfillment','Appliance Stores','[U] Farm and Feed',
  '[1] Pet Super Store','[2] Neighborhood Pet','[1] Medical','[2] Recreational','[3] Combination',
];

const Pharmacy_uncover_banner = [
  'Long Term Care','Infusion','Mail Order','Over The Counter',
  'Clinic & Dispensing','Indian Health Services','State Hospital, Institution',
  'HMO','Durable Medical Equipment','Specialty','Compounding',
];

const List_PCT = ['Pipe','Cigar','pipe','cigar','bongs','Bongs','glass','Glass','pipes','Pipes','bubblers','Bubblers'];

const No_cannabis = [
  '[GA] Georgia','[ID] Idaho','[IN] Indiana','[KA] Kansas','[KY] Kentucky',
  '[NC] North Carolina','[NE] Nebraska','[SC] South Carolina','[TN] Tennessee',
  '[WI] Wisconsin','[WY] Wyoming',
];

const Medical_Cannabis = [
  '[AL] Alabama','[AR] Arkansas','[DC] District of Columbia','[DE] Delaware',
  '[FL] Florida','[HI] Hawaii','[IA] Iowa','[LA] Louisiana','[MD] Maryland',
  '[MN] Minnesota','[MS] Mississippi','[ND] North Dakota','[NH] New Hampshire',
  '[OK] Oklahoma','[PA] Pennsylvania','[SD] South Dakota','[TX] Texas',
  '[UT] Utah','[VA] Virginia','[WV] West Virginia',
];

// The large sets from Python – kept as JS Sets for O(1) lookup
const allowed_mg_names = new Set([
  "Abos Pizza/EM","Acambaro Mexican Restaurant/EM","Alfredos/EM","AMC Theatre/EM",
  "Ameci Pizza & Pasta/EM","Americas Best Value Inn/EM","Angelos/EM",
  "Anthonys Pizza & Pasta/EM","Aramark/EM","Armands Chicago Pizzeria/EM","Arnis/EM",
  "Atlanta Bread Company/EM","Au Bon Pain/EM","Azteca Mexican Restaurant/EM",
  "Baja Fresh Mexican Grill/EM","Bajio Mexican Grill/EM","Bakers Square Restaurant/EM",
  "Bar B Cutie/EM","Barnies Coffee & Tea/EM","Baymont Inn & Suites/EM",
  "Bellacinos Pizza & Grinders/EM","Bensi/EM","Best Western/EM",
  "Bickfords Family Restaurant/EM","Big Boy Restaurant/EM","Black Bear Diner/EM",
  "Bob Evans/EM","Breadeaux Pizza/EM","Brothers Pizza/EM","Bucks Pizza/EM",
  "Buddys Pizza/EM","Budget Inn/EM","Buds Broiler/EM","Burger Hut/EM",
  "California Tortilla/EM","Camilles Sidewalk Cafe/EM","Candlewood Suites/EM",
  "Captain Ds Seafood Kitchen/EM","Carls Jr/EM","Casa Ole/EM","Cedar River Seafood/EM",
  "Century Theatres/EM","Chartwells/EM","Cheeburger Cheeburger/EM","China Border/EM",
  "China Buffet/EM","China Jade Restaurant/EM","Chipotle/EM","Chuck E Cheeses/EM",
  "Cicis Pizza/EM","Clarion Hotel/EM","Coltons Steak House & Grill/EM","Comfort Inn/EM",
  "Comfort Suites/EM","Corner Bakery Cafe/EM","Cosi/EM","Costa Vida/EM",
  "Cotton Patch Cafe/EM","Country Inn & Suites/EM","Country Kitchen/EM",
  "Courtyard By Marriott/EM","Davannis Pizza & Hot Hoagies/EM","Days Inn/EM",
  "Deja Vu Showgirls/EM","Dennys Restaurant/EM","Dickeys Barbecue Pit/EM",
  "Dixie Cafe/EM","Donatos Pizza/EM","DoubleDaves Pizzaworks/EM","Drury Inn/EM",
  "East Of Chicago Pizza/EM","Eatza Pizza/EM","Econo Lodge/EM",
  "Edwardos Natural Pizza/EM","El Caporal/EM","El Rodeo/EM","El Taco Tote/EM",
  "El Tapatio/EM","Fairfield Inn & Suites/EM","Fairfield Inn/EM","Fat Boys Bar B Q/EM",
  "Fatburger/EM","Fiesta Mexicana Restaurant/EM","First Watch/EM",
  "Folks Southern Kitchen/EM","Foxs Pizza Den/EM","Franks Pizza/EM",
  "Fryn Pan Family Restaurant/EM","Gambinos Pizza/EM","Garcias Mexican Restaurant/EM",
  "Giordanos/EM","Giovannis Pizza/EM","Giovannis/EM","Godfathers Pizza/EM",
  "Golden Rule BBQ & Grill/EM","Goodfellas Brick Oven Pizza/EM","Great Wraps/EM",
  "Guesthouse Inn/EM","Hampton Inn & Suites/EM","Hampton Inn/EM","Happy Joes Pizza/EM",
  "Hilton Garden Inn/EM","Hilton/EM","Holiday Inn & Suites/EM",
  "Holiday Inn Express & Suites/EM","Holiday Inn Express/EM","Holiday Inn/EM",
  "Homewood Suites/EM","Honey Baked Ham Company/EM","Howard Johnson/EM",
  "IHOP Restaurant/EM","Italian Pie/EM","Italian Village Pizza/EM","Ivars Seafood Bar/EM",
  "Jakes Pizza/EM","James Coney Island/EM","Jasons Deli/EM","Jerrys Subs & Pizza/EM",
  "Jimboys Tacos/EM","Joes Pizza & Pasta/EM","Johnny Rockets/EM",
  "Johnnys New York Style Pizza/EM","Johnnys Pizza House/EM","Johns Incredible Pizza/EM",
  "K Bobs Steakhouse/EM","Kaiser Permanente Pharmacy/EM","Knights Inn/EM",
  "Knights Of Columbus/EM","Kokopelli Fresh Mexican Grill/EM","La Quinta Inn & Suites/EM",
  "La Quinta Inn/EM","La Salsa Fresh Mexican Grill/EM","Landmark Diner/EM",
  "Larrys Giant Subs/EM","Las Palmas/EM","Le Peep Restaurant/EM","Leos Coney Island/EM",
  "Lindburgers/EM","Lions Club/EM","Little Caesars/EM","Loafin Joes/EM",
  "Long John Silvers/EM","Loop Pizza Grill/EM","Los Burritos/EM","LSG Sky Chefs/EM",
  "Mad Greens/EM","Maid Rite/EM","Mama Fus Asian House/EM","Mamas Cafe/EM",
  "Mancinos Pizza & Grinders/EM","Marcos Pizza/EM","Marriott Hotels & Resorts/EM",
  "Maui Tacos/EM","Mazzios Pizza/EM","Microtel Inn & Suites/EM","Moes Southwest Grill/EM",
  "Monicals Pizza/EM","Moose Lodge/EM","Mr Gattis Pizza/EM","Nathans Famous/EM",
  "National Coney Island/EM","Nebraska Furniture Mart/EM","Ninfas/EM",
  "Noble Romans Pizza/EM","Noodles & Company/EM","Norwegian Cruises/EM",
  "Nothing But Noodles/EM","Novrozskys Hamburgers/EM","NYPD Pizza/EM",
  "Pagliacci Pizza/EM","Pagliais Pizza/EM","Pallino Pastaria/EM",
  "Pancheros Mexican Grill/EM","Panchos Mexican Buffet/EM","Panda Express/EM",
  "Park Inn/EM","Pei Wei Asian Diner/EM","Pepes Mexican Restaurant/EM",
  "Pepperonis/EM","Peppinos Pizza/EM","Perkins Restaurant & Bakery/EM",
  "Peter Piper Pizza/EM","Phillys Best/EM","Pho Hoa/EM","Pick Up Stix/EM",
  "Pita Pit/EM","Pizza Factory/EM","Pizza Hut/EM","Pizza Inn/EM","Pizza King/EM",
  "Pizza My Heart/EM","Pizza Pro/EM","Pizza Ranch/EM","Pizza Schmizza/EM",
  "Planet Sub/EM","Ponderosa Steak House/EM","Portillos Hot Dogs/EM",
  "Potbelly Sandwich Works/EM","Princess Cruises/EM","Quality Inn/EM",
  "Quality Suites/EM","Ramada Inn/EM","Rave Motion Pictures/EM","Rays Pizza/EM",
  "Red Brick Pizza/EM","Red Lion/EM","Red Roof Inn/EM","Remington Grill/EM",
  "Rent A Center/EM","Residence Inn/EM","Rib Crib/EM","Ricos Pizza/EM",
  "Rocky Rococo/EM","Rodeway Inn/EM","Romanos Macaroni Grill/EM",
  "Romios Pizza & Pasta/EM","Roosters/EM","Round Table Pizza/EM","Ruby Tuesday/EM",
  "Rubys Diner/EM","Rumbi Island Grill/EM","Salsaritas Fresh Cantina/EM",
  "Samuel Mancinos Italian Eat/EM","Sarku Japan/EM","Sbarro/EM","Shanes Rib Shack/EM",
  "Sharis Restaurant/EM","Sharkys Woodfired Grill/EM","Sheraton Hotel/EM","Shoneys/EM",
  "Shorty Smalls/EM","Signature Inn/EM","Sir Pizza/EM","Sleep Inn/EM","Smashburger/EM",
  "Snappy Tomato Pizza/EM","Sodexo/EM","Sonic Drive In/em","Sonny Bryans Smokehouse/EM",
  "Sonnys Real Pit BBQ/EM","Spicy Pickle/EM","Spires Restaurant/EM",
  "Springhill Suites/EM","Staybridge Suites/EM","Straw Hat Pizza/EM","Stuft Pizza/EM",
  "Sub Station II/EM","Subway/EM","Super 8 Motel/EM","Taco Del Mar/EM","Taco Tico/EM",
  "Taco Time/EM","Taco Treat/EM","Tequila Mexican Restaurant/EM","Texadelphia/EM",
  "Thai Orchid Restaurant/EM","Tijuana Flats Burrito/EM","Tokyo Grill/EM",
  "Towneplace Suites By Marriott/EM","Travelodge/EM","Tumbleweeds/EM","Una Mas/EM",
  "Vie De France/EM","Villa Pizza/EM","Village Inn/EM","Walgreens/EM",
  "Western Sizzlin/EM","Whole Hog Cafe/EM","Willys Mexicana Grill/EM",
  "Wing Zone/EM","Wingate By Wyndham/EM","Wings N Things/EM","Wings To Go/EM",
  "Wingstop/EM","Wok & Roll/EM","Wolfgang Puck Express/EM","Woodys Bar B Q/EM",
  "Wyndham Hotels & Resorts/EM","Your Pizza Shop/EM","Z Pizza/EM","Zoes Kitchen/EM",
  "Eurest Dining Services",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** True when value is null, undefined, or blank string */
function isEmpty(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

/** True when value is not null/undefined/blank */
function isPresent(v) {
  return !isEmpty(v);
}

function val(row, col) {
  return row[col] !== undefined ? String(row[col]).trim() : '';
}

/** Case-insensitive substring check */
function containsCI(str, sub) {
  return String(str || '').toLowerCase().includes(String(sub || '').toLowerCase());
}

/** Required-column guard – throws descriptive error if any column is missing */
function requireCols(rows, cols) {
  if (!rows || rows.length === 0) return;
  const available = new Set(Object.keys(rows[0]));
  for (const c of cols) {
    if (!available.has(c)) throw new Error(`Missing required column: ${c}`);
  }
}

const REQUIRED_COLS = [
  'GSR_GLOBAL_ID','Local Code','Local Trade Channel','Local Sub Channel',
  'Exception Code','IRT Local Code','IRT Name','Family Code','Name',
  'Store Number','Address','Place','City','State','Postal Code',
  'Address Quality','Latitude','Longitude','GeoCode source','GeoCode Quality',
  'Fips type','Fips Block Id','Area Code','Phone','ReplacedBy Code',
  'ReplacedBy Status','ReplacedBy Name','ReplacedBy Address',
  'ReplacedBy Trade Channel','ReplacedBy Local Sub Channel','Status',
  'Status Date','MG Local Code','MG Name','Beer','Wine','Liquor',
  'Modelled ACV Code','Clinic ','Clinic Name','Assistance Program',
  'Food Type','Pharmacy','Gas','Verification Date','Verification Source',
  'Grocery Supplier Number','Grocery Supplier verification Source',
  'Grocery Supplier verification Date','Confection Supplier Number',
  'Confection Supplier Verification Source','Confection Supplier Verification Date',
  'GM Supplier Number','GM Supplier Verification Source',
  'GM Supplier Verification Date','HBC Supplier Number',
  'HBC Supplier Verification Source','HBC Supplier Verification Date',
  'Frozen Supplier Number','Frozen Supplier Verification Source',
  'Frozen Supplier Verification Date','Postal Code Extension','PARTY_TYPE',
];

// ── Individual Query Functions ────────────────────────────────────────────────

/** Query 1: 01/06/08 channels with missing IRT and OP/FO status */
function query_1(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r => {
    const ch = val(r, 'Local Trade Channel');
    const st = val(r, 'Status');
    const irt = val(r, 'IRT Local Code');
    return (
      ['[06] Category Killers','[08] Mass Merchandise Stores',
       '[01] Wholesale Clubs','[13] Fulfillment'].includes(ch) &&
      isEmpty(irt) &&
      ['[OP] Open, Operating','[FO] Future Opening'].includes(st)
    );
  });
}

/** Query 10: Empty Beer/Wine/Liquor for non-unknown channels */
function query_10(rows) {
  requireCols(rows, REQUIRED_COLS);
  const excluded = ['[09] Unknown Retailers','[59] Unknown On-Premise'];
  return rows.filter(r => {
    const ch = val(r, 'Local Trade Channel');
    return (
      !excluded.includes(ch) &&
      (isEmpty(r['Beer']) || isEmpty(r['Wine']) || isEmpty(r['Liquor']))
    );
  });
}

/** Query 2: Exception Code 777793Z with status not UV */
function query_2(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r =>
    val(r, 'Exception Code') === '777793Z' &&
    val(r, 'Status') !== '[UV] Unverifiable'
  );
}

/** Query 3: Status OP/DUP/NA + Verification Source = Attempted Contact Failed */
function query_3(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r =>
    ['[OP] Open, Operating','[DUP] Duplicate','[NA] Inactive/Not Verified']
      .includes(val(r, 'Status')) &&
    val(r, 'Verification Source') === '[34] Attempted Contact Failed'
  );
}

/** Query 4: Invalid Verification Source for OP/FO/TC */
function query_4(rows) {
  requireCols(rows, REQUIRED_COLS);
  const allowed = [
    '[34] Attempted Contact Failed','[42] Web Lookup','[40] Web Sites, Other',
    '[12] Screen Scrape','[20] Licensing Agencies, Alochol','[23] Telephone, Indirect',
    '[29] Licensing Agencies, Drug','[2] Telephone, Direct','[32] Retailer Store List',
    '[39] New/press Release','[43] S.E.C.','[21] EM Verified through Research',
  ];
  return rows.filter(r =>
    ['[OP] Open, Operating','[FO] Future Opening','[TC] Closed'].includes(val(r, 'Status')) &&
    !allowed.includes(val(r, 'Verification Source'))
  );
}

/** Query 6: Null Food Type for on-premise channels */
function query_6(rows) {
  requireCols(rows, REQUIRED_COLS);
  const tradeChannels = ['[50] Dining','[51] Bar/Nightclub','[55] Caterers','[57] Military'];
  const subChannels   = ['[P] Coffee/Tea Shop','[H] Restaurant NA','[C] Concessionaire NA'];
  const statusList    = ['[FO] Future Opening','[OP] Open, Operating'];
  return rows.filter(r => {
    const foodEmpty = isEmpty(r['Food Type']);
    const st = val(r, 'Status');
    return (
      foodEmpty && statusList.includes(st) &&
      (tradeChannels.includes(val(r, 'Local Trade Channel')) ||
       subChannels.includes(val(r, 'Local Sub Channel')))
    );
  });
}

/** Query 7: Non-Standardized Address (not Duplicate) */
function query_7(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r =>
    val(r, 'Address Quality') === 'Non Standardized' &&
    val(r, 'Status') !== '[DUP] Duplicate '
  );
}

/** Query 8: Inactive/Not Verified with source ≠ Special Projects */
function query_8(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r =>
    val(r, 'Status') === '[NA] Inactive/Not Verified' &&
    val(r, 'Verification Source') !== '[13] Special Projects'
  );
}

/** Query 9: UV status with source ≠ Attempted Contact Failed */
function query_9(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r =>
    val(r, 'Status') === '[UV] Unverifiable' &&
    val(r, 'Verification Source') !== '[34] Attempted Contact Failed'
  );
}

/** Query 5: No IRT but supplier columns filled */
function query_5(rows) {
  requireCols(rows, REQUIRED_COLS);
  const supplierCols = [
    'Grocery Supplier Number','Confection Supplier Number',
    'GM Supplier Number','HBC Supplier Number','Frozen Supplier Number',
  ];
  return rows.filter(r => {
    const irtEmpty     = isEmpty(r['IRT Local Code']);
    const supplierFill = supplierCols.some(c => isPresent(r[c]));
    return irtEmpty && supplierFill;
  });
}

/** UV records without 93Z exception code */
function Unverifiable_Records(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r =>
    val(r, 'Status') === '[UV] Unverifiable' &&
    val(r, 'Exception Code') !== '777793Z'
  );
}

/** UV with different trade channel */
function Unverifiable_With_Diff_Trade(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r => {
    const st  = val(r, 'Status');
    const ch  = val(r, 'Local Trade Channel');
    const sub = val(r, 'Local Sub Channel');
    const ec  = val(r, 'Exception Code');
    const cond1 = (
      ch === '[09] Unknown Retailers' &&
      sub === '[X] Retail Other' &&
      st  === '[UV] Unverifiable' &&
      ec  !== '777793Z'
    );
    const cond2 = (
      st  === '[UV] Unverifiable' &&
      ch  !== '[09] Unknown Retailers'
    );
    return cond1 || cond2;
  });
}

/** IRT present but Store Number empty */
function IRT_With_Null_Store_No(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r =>
    isPresent(r['IRT Local Code']) &&
    isEmpty(r['Store Number']) &&
    ['[OP] Open, Operating','[FO] Future Opening'].includes(val(r, 'Status'))
  );
}

/** FO status with unknown/non-syndicate channel */
function FO_with_Non_Syndicate(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r =>
    ['[09] Unknown Retailers','[59] Unknown On-Premise'].includes(val(r, 'Local Trade Channel')) &&
    val(r, 'Status') === '[FO] Future Opening'
  );
}

/** Banner name case / special character / word check */
function query_banner_name_case(rows) {
  requireCols(rows, REQUIRED_COLS);
  const specifiedWords = [
    'Accounting','Advertising','Billing','Co','Company','Cos','Dist',
    'Distribution','Distributor','Ent','Enterprises','Headquarters','HQ',
    'Inc','LLC','Region','Warehouse','Whse','Bbq','Extramile',
  ];
  const wordPattern = new RegExp(`\\b(${specifiedWords.join('|')})\\b`);
  const specialCharPattern = /[^\w\s&]/;

  function isProperCase(name) {
    if (!name) return false;
    return name === name.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
  }
  function hasSpecialOrAnd(name) {
    if (!name) return false;
    return specialCharPattern.test(name) || name.includes('And');
  }
  function hasSpecifiedWords(name) {
    if (!name) return false;
    return wordPattern.test(name);
  }

  return rows.filter(r => {
    const name = val(r, 'Name');
    return !isProperCase(name) || hasSpecialOrAnd(name) || hasSpecifiedWords(name);
  });
}

/** IRT present but MG Local Code empty */
function query_irt_requires_mg_local_code(rows) {
  requireCols(rows, REQUIRED_COLS);
  const missing = ['','nan','None'];
  return rows.filter(r => {
    const irt = val(r, 'IRT Local Code');
    const mg  = val(r, 'MG Local Code');
    const st  = val(r, 'Status');
    return (
      !missing.includes(irt) &&
      missing.includes(mg) &&
      ['[OP] Open, Operating','[FO] Future Opening'].includes(st)
    );
  });
}

/** Verification Date validation (YYYYMMDD format) */
function query_invalid_verification_date(rows) {
    requireCols(rows, REQUIRED_COLS);

    const today = new Date();
    today.setHours(0,0,0,0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return rows.filter(r => {

        const dateStr = String(val(r,'Verification Date')).trim();

        // Skip blank values
        if (!dateStr || dateStr.length !== 8) {
            return true;
        }

        // Parse YYYYMMDD
        const year = parseInt(dateStr.substring(0,4));
        const month = parseInt(dateStr.substring(4,6)) - 1;
        const day = parseInt(dateStr.substring(6,8));

        const verificationDate =
            new Date(year, month, day);

        verificationDate.setHours(0,0,0,0);

        // Invalid date format
        if (isNaN(verificationDate.getTime())) {
            return true;
        }

        // Allow only yesterday, today, tomorrow
        return !(
            verificationDate.getTime() === yesterday.getTime() ||
            verificationDate.getTime() === today.getTime() ||
            verificationDate.getTime() === tomorrow.getTime()
        );
    });
}

/** Exception code check vs allowed MG names */
function check_exception_code(rows) {
  requireCols(rows, REQUIRED_COLS);
  return rows.filter(r =>
    allowed_mg_names.has(val(r, 'MG Name')) &&
    val(r, 'Exception Code') !== '777794Z'
  );
}

/** Check empty phone for open/FO non-unknown channels */
function check_empty_phone(rows) {
  requireCols(rows, REQUIRED_COLS);
  const excludedCh = ['[09] Unknown Retailers','[59] Unknown On-Premise','[13] Fulfillment'];
  return rows.filter(r =>
    isEmpty(r['Phone']) &&
    ['[OP] Open, Operating'].includes(val(r, 'Status')) &&
    !excludedCh.includes(val(r, 'Local Trade Channel'))
  );
}

/** Gas keyword in name but Gas flag null or N */
function query_banner_with_gas(rows) {
  return rows.filter(r => {
    const name = val(r, 'Name').toLowerCase();
    const hasGas = Gas_name.some(g => name.includes(g.toLowerCase()));
    const gasFlag = val(r, 'Gas');
    return hasGas && (isEmpty(gasFlag) || gasFlag === 'N');
  });
}

/** Drug store channel but Pharmacy flag N or null */
function query_pharmacy_flag(rows) {
  return rows.filter(r =>
    String(r['Local Trade Channel'] || '').includes('[03] Drug Stores and Pharmacies') &&
    (val(r, 'Pharmacy') === 'N' || isEmpty(r['Pharmacy']))
  );
}

/** Pet trade channel with EM-style banners */
function query_wrong_pet_banner(rows) {
  return rows.filter(r =>
    Pet_name.some(n => containsCI(val(r, 'Name'), n)) &&
    String(r['Local Trade Channel'] || '').toLowerCase().includes('[11] pet')
  );
}

/** Vet sub-channel with EM-style banners */
function query_wrong_vet_banner(rows) {
  return rows.filter(r =>
    Vet_name.some(n => containsCI(val(r, 'Name'), n)) &&
    String(r['Local Sub Channel'] || '').toLowerCase().includes('[3] vet clinic')
  );
}

/** Farm & Feed sub-channel with EM-style banners */
function query_wrong_farm_feed_banner(rows) {
  return rows.filter(r =>
    Farm_Feed.some(n => containsCI(val(r, 'Name'), n)) &&
    String(r['Local Sub Channel'] || '').toLowerCase().includes('[u] farm and feed')
  );
}

/** Banner contains alcohol term but flag is N or null */
function query_alcohol_banners(rows) {
  const categories = {
    Beer:   ['beer','Beer'],
    Wine:   ['wine','Wine'],
    Liquor: ['liquor','Liquor','Cocktail'],
  };
  const results = [];
  for (const [cat, names] of Object.entries(categories)) {
    for (const r of rows) {
      const name = val(r, 'Name');
      if (names.some(n => containsCI(name, n))) {
        const flag = val(r, cat);
        if (flag === 'N' || isEmpty(flag)) {
          results.push({ ...r, Category: 'Alcohol' });
        }
      }
    }
  }
  // De-duplicate by GSR_GLOBAL_ID
  const seen = new Set();
  return results.filter(r => {
    const id = r['GSR_GLOBAL_ID'] + r['Local Code'];
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/** Pet Super Store sub-channel without correct banner */
function query_wrong_pet_superstore_banner(rows) {
  return rows.filter(r =>
    String(r['Local Sub Channel'] || '').toLowerCase().includes('[1] pet super store') &&
    !Pet_superstore.some(n => containsCI(val(r, 'Name'), n))
  );
}

/** GeoCode Quality = ZIP centroid and not Certified/Standardized address */
function filter_geocode_quality(rows) {
  return rows.filter(r =>
    val(r, 'GeoCode Quality') === 'Centroid (5-digit ZIP)' &&
    !['Certified','Standardized'].includes(val(r, 'Address Quality'))
  );
}

/** Local sub-channel list with BWL flag null or Y */
function query_invalid_beer_wine_liquor(rows) {
  return rows.filter(r => {
    if (!Local_Sub_Channel_List.includes(val(r, 'Local Sub Channel'))) return false;
    return ['Beer','Wine','Liquor'].some(col =>
      isEmpty(r[col]) || val(r, col) === '[Y] Yes'
    );
  });
}

/** PCT sub-channel keywords but wrong sub-channel */
function query_wrong_pct_banner(rows) {
  return rows.filter(r =>
    List_PCT.some(n => containsCI(val(r, 'Name'), n)) &&
    val(r, 'Local Sub Channel') !== '[J] Pipe/Cigar/Tobacco'
  );
}

/** Cannabis in states where it's illegal */
function query_no_cannabis_states(rows) {
  return rows.filter(r =>
    No_cannabis.some(s => containsCI(val(r, 'State'), s)) &&
    val(r, 'Local Trade Channel') === '[14] Cannabis'
  );
}

/** Medical-only states with recreational/combo sub-channel */
function query_medical_cannabis_states(rows) {
  return rows.filter(r =>
    Medical_Cannabis.some(s => containsCI(val(r, 'State'), s)) &&
    ['[2] Recreational','[3] Combination'].includes(val(r, 'Local Sub Channel'))
  );
}

/** Pharmacy channel but non-covered banner */
function query_pharmacy_uncover_banner(rows) {
  const escaped = Pharmacy_uncover_banner.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(escaped.join('|'), 'i');
  return rows.filter(r =>
    pattern.test(val(r, 'Name')) &&
    val(r, 'Local Trade Channel') === '[03] Drug Stores and Pharmacies'
  );
}

/** State / BWL grid rules */
function query_combined_conditions(rows) {
  const liquorStates = [
    '[AL] Alabama','[CO] Colorado','[DC] District of Columbia','[GA] Georgia',
    '[HI] Hawaii','[ID] Idaho','[IN] Indiana','[KY] Kentucky','[MA] Massachusetts',
    '[ME] Maine','[MN] Minnesota','[MS] Mississippi','[MT] Montana',
    '[NC] North Carolina','[NH] New Hampshire','[OR] Oregon','[SC] South Carolina',
    '[TN] Tennessee','[TX] Texas','[VA] Virginia','[VT] Vermont','[WV] West Virginia',
  ];
  const wineLiquorStates = ['[NY] New York','[ND] North Dakota','[OK] Oklahoma','[AR] Arkansas'];

  const results = [];
  for (const r of rows) {
    const ch    = val(r, 'Local Trade Channel');
    const st    = val(r, 'State');
    const beer  = val(r, 'Beer');
    const wine  = val(r, 'Wine');
    const liq   = val(r, 'Liquor');

    // Liquor errors in Category Killers states
    if (ch === '[06] Category Killers' && liquorStates.includes(st) && liq === '[Y] Yes') {
      results.push(r); continue;
    }
    // Wine/Liquor errors in specified states
    if (ch === '[06] Category Killers' && wineLiquorStates.includes(st) &&
        (wine === '[Y] Yes' || liq === '[Y] Yes')) {
      results.push(r); continue;
    }
    // Beer errors in SC for Liquor/Wine stores
    if (String(r['Local Trade Channel'] || '').includes('[02] Liquor, Wine and Beer Stores') &&
        st === '[SC] South Carolina') {
      if ((beer === '[Y] Yes' && liq === '[Y] Yes') ||
          (beer === '[Y] Yes' && wine === '[Y] Yes' && liq === '[Y] Yes')) {
        results.push(r); continue;
      }
    }
    // Wine/Beer errors in New York
    if (String(r['Local Trade Channel'] || '').includes('[02] Liquor, Wine and Beer Stores') &&
        st === '[NY] New York' && beer === '[Y] Yes' && wine === '[Y] Yes') {
      results.push(r); continue;
    }
  }
  return results;
}

/** Null Supplier for specific channels with IRT */
function supplier_number_check(rows) {
  const statusList = ['[OP] Open, Operating','[FO] Future Opening'];

  const configs = [
    { ch: '[01] Wholesale Clubs',              cols: ['Grocery Supplier Number','Confection Supplier Number','GM Supplier Number','HBC Supplier Number','Frozen Supplier Number'] },
    { ch: '[03] Drug Stores and Pharmacies',   cols: ['Grocery Supplier Number','Confection Supplier Number','GM Supplier Number','HBC Supplier Number'] },
    { ch: '[04] Grocery Stores',               cols: ['Grocery Supplier Number','Confection Supplier Number','GM Supplier Number','HBC Supplier Number','Frozen Supplier Number'] },
    { ch: '[07] Convenience Stores',           cols: ['Grocery Supplier Number','Confection Supplier Number'] },
    { ch: '[08] Mass Merchandise Stores',      cols: ['Grocery Supplier Number','Confection Supplier Number','GM Supplier Number','HBC Supplier Number'] },
    { ch: '[11] Pet',                          cols: ['Grocery Supplier Number'] },
  ];

  return rows.filter(r => {
    if (!statusList.includes(val(r, 'Status'))) return false;
    if (isEmpty(r['IRT Local Code'])) return false;
    const ch = String(r['Local Trade Channel'] || '');
    for (const cfg of configs) {
      if (ch.includes(cfg.ch)) {
        return cfg.cols.some(c => isEmpty(r[c]));
      }
    }
    return false;
  });
}

/** Special Event / Client Internal banner mismatch */
function check_special_event_client_internal(rows) {
  requireCols(rows, REQUIRED_COLS);
  const validStatus = ['[OP] Open, Operating','[TC] Closed','[FO] Future Opening','[UV] Unverifiable'];
  return rows.filter(r => {
    const sub  = val(r, 'Local Sub Channel');
    const name = val(r, 'Name');
    const st   = val(r, 'Status');
    return (
      validStatus.includes(st) &&
      ((sub === '[N] Special Event' && name !== 'Special Event') ||
       (sub === '[K] Client Internal' && name !== 'Client Internal'))
    );
  });
}

/** Name vs MG Name mismatch (MG Name is not substring of Name) */
function check_mg_name_mismatch(rows) {
  requireCols(rows, REQUIRED_COLS);
  const validStatus = ['[OP] Open, Operating','[TC] Closed','[FO] Future Opening'];
  return rows.filter(r => {
    const name = val(r, 'Name').toLowerCase();
    const mg   = val(r, 'MG Name').toLowerCase();
    return (
      validStatus.includes(val(r, 'Status')) &&
      mg !== '' && !name.includes(mg)
    );
  });
}

// ── Main Orchestrator ─────────────────────────────────────────────────────────

function processCSV(rows) {
  const resultDict = {};

  function safe(key, fn) {
    try {
      resultDict[key] = fn();
    } catch (e) {
      resultDict[key + ' Error'] = [{ Error: String(e.message) }];
    }
  }

  safe('01_06_08_Without_IRT',              () => query_1(rows));
  safe('93Z_with_OP_TC_NA_FO',              () => query_2(rows));
  safe('NA_Atm_Cnt_Fld_OP_NA_FO',           () => query_3(rows));
  safe('Empty_BWL_Syndicate',               () => query_10(rows));
  safe('Invalid_Verification_Source_OP_FO_TC', () => query_4(rows));
  safe('Null_Food_Type_On_Premise',         () => query_6(rows));
  safe('Non_standardized_Address',          () => query_7(rows));
  safe('Inactive_Other_than_Spl_Proj',      () => query_8(rows));
  safe('UV_other_than_Attmp',               () => query_9(rows));
  safe('UV_other_than_93Z',                 () => Unverifiable_Records(rows));
  safe('UV_with_Different_Trade',           () => Unverifiable_With_Diff_Trade(rows));
  safe('IRT_With_Null_Store_No',            () => IRT_With_Null_Store_No(rows));
  safe('FO_with_Non_Syndicate',             () => FO_with_Non_Syndicate(rows));
  safe('Incorrect_Banner_Rule',             () => query_banner_name_case(rows));
  safe('IRT_without_MG',                    () => query_irt_requires_mg_local_code(rows));
  safe('Invalid_Verification_Date',         () => query_invalid_verification_date(rows));
  safe('Invalid_94Z_Exception_Code',        () => check_exception_code(rows));
  safe('Null_Phone',                        () => check_empty_phone(rows));
  safe('Banner_with_gas',                   () => query_banner_with_gas(rows));
  safe('03_With_Pharm_Flag_as_No_&_Null',   () => query_pharmacy_flag(rows));
  safe('Pet_Trade_with_EM_Banner',          () => query_wrong_pet_banner(rows));
  safe('Vet_Sub_Trade_with_EM_Banner',      () => query_wrong_vet_banner(rows));
  safe('Farm&Feed_with_EM_Banner',          () => query_wrong_farm_feed_banner(rows));
  safe('Banner_vs_Alcohol_Flags',           () => query_alcohol_banners(rows));
  safe('Excl_Banners_For_Pet_Super_str',    () => query_wrong_pet_superstore_banner(rows));
  safe('GeoCode_Quality_Flags',             () => filter_geocode_quality(rows));
  safe('06_11_13_14_BWL_Blank_YES',         () => query_invalid_beer_wine_liquor(rows));
  safe('Non_covered_Pharmacy',              () => query_pharmacy_uncover_banner(rows));
  safe('Incorrect_Vape_Trade_Using_Banner', () => query_wrong_pct_banner(rows));
  safe('Illegal_Cannabis_States',           () => query_no_cannabis_states(rows));
  safe('Cannabis_Medical_States',           () => query_medical_cannabis_states(rows));
  safe('State_BWL_Grid',                    () => query_combined_conditions(rows));
  safe('Null_Supplier',                     () => supplier_number_check(rows));
  safe('Improper_Supplier',                 () => query_5(rows));
  safe('Banner_Name_With_Spl_Proj_Cl_Inter',() => check_special_event_client_internal(rows));
  safe('Incorrect_MG',                      () => check_mg_name_mismatch(rows));

  // Add error summary
  const summary = Object.entries(resultDict).map(([k, v]) => ({
    'Sheet Name': k,
    'Error Count': Array.isArray(v) ? v.length : 0,
  }));
  resultDict['Error Summary'] = summary;

  return resultDict;
}

module.exports = { processCSV };
