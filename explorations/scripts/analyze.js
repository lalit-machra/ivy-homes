import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const listings = JSON.parse(fs.readFileSync(path.join(dataDir, 'listings.json')));
const rentals = JSON.parse(fs.readFileSync(path.join(dataDir, 'rentals.json')));
const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json')));


console.log('Loaded: ', listings.length, ' listings, ', rentals.length, ' rentals, ', projects.length, ' projects');


// ---------- Q1: total_listing_records ----------
const q1 = listings.length;
console.log('Q1 total_listing_records: ', q1);


// ---------- Q3: active_listings ----------
const q3 = listings.filter((listing) => listing.is_live === true).length;
console.log('Q3 active_listings:', q3);


// ---------- Q5: total_monthly_rent (your assigned locality) ----------
const ASSIGNED_LOCALITY = 'Dwarka Expressway';
const matchedRentals = rentals.filter((rental) => rental.locality?.toLowerCase() === ASSIGNED_LOCALITY.toLowerCase());
const q5 = matchedRentals.reduce((sum, currRental) => sum + currRental.price, 0);
console.log('Q5 total_monthly_rent:', q5);


// ---------- Q8: listings_last_7_days ----------
const REFERENCE_IST = new Date('2026-09-10T00:00:00+05:30');
const WINDOW_START = new Date(REFERENCE_IST.getTime() - 7 * 24 * 60 * 60 * 1000);

const q8 = listings.filter(l => {
  const posted = new Date(l.posted_at); // posted_at is UTC (Z suffix); Date compares absolute instants correctly regardless of offset
  return posted >= WINDOW_START && posted < REFERENCE_IST;
}).length;

console.log('Q8 listings_last_7_days:', q8);


// ----------  Q7: costliest_project ----------
const sortedProjectsPrice = projects.toSorted((a, b) => b.price_max - a.price_max);
const costliestProject = sortedProjectsPrice.find(p => p.price_min < 50 && p.price_max < 50);
const q7 = { "project_id": costliestProject.project_id, "price_max_inr": costliestProject.price_max * 10000000 }
console.log('Q7 costliest_project:', q7);


// ----------  Q10: projects_with_wrong_listing_count ----------
let counter = 0;
projects.forEach((project) => {
   const listingCounter = listings.filter((listing) => listing.project_id === project.project_id).length;
   if (listingCounter !== project.total_listings) counter++;
})
console.log('Q10 projects_with_wrong_listing_count:', counter);


// ----------  Q2: unique_properties ----------
function roundCoord(val, decimals = 3) {
  return Math.round(val * 10 ** decimals) / 10 ** decimals;
}

function isSameProperty(a, b) {
  if (a.apartment_name !== b.apartment_name) return false;
  if (a.bedroom !== b.bedroom) return false;
  if (Math.abs(a.floor - b.floor) > 1) return false;
  if (Math.abs(a.carpet_area - b.carpet_area) > 100) return false;
  return true;
}

// bucket by rounded coordinates so pairwise checks only happen within same-location groups
const buckets = new Map();
listings.forEach(l => {
  const key = `${roundCoord(l.latitude)}_${roundCoord(l.longitude)}`;
  if (!buckets.has(key)) buckets.set(key, []);
  buckets.get(key).push(l);
});

const parent = new Map();
function find(id) {
  if (parent.get(id) !== id) parent.set(id, find(parent.get(id)));
  return parent.get(id);
}
function union(a, b) {
  parent.set(find(a), find(b));
}
listings.forEach(l => parent.set(l.listing_id, l.listing_id));

let comparisons = 0;
buckets.forEach(group => {
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      comparisons++;
      if (isSameProperty(group[i], group[j])) {
        union(group[i].listing_id, group[j].listing_id);
      }
    }
  }
});

const uniqueGroups = new Set(listings.map(l => find(l.listing_id)));
console.log('Q2 unique_properties:', uniqueGroups.size);


// ----------  Q4: corrupt_listing_ids ----------
const corruptChecks = {
  carpet_gt_super: l => l.carpet_area > l.super_built_up_area,
  floor_gt_total: l => l.floor > l.total_floors,
  negative_or_zero_price: l => l.price <= 0,
  negative_or_zero_area: l => l.carpet_area <= 0 || l.super_built_up_area <= 0,
  bhk_zero_non_plot: l => l.bedroom === 0 && l.property_type !== 'plot',
  bathroom_way_more_than_bedroom: l => l.bathroom > l.bedroom + 3,
  floor_negative: l => l.floor < 0,
};

Object.entries(corruptChecks).forEach(([name, fn]) => {
  const matches = listings.filter(fn);
  console.log(`${name}: ${matches.length}`, matches.slice(0, 3).map(l => l.listing_id));
});

const allCorruptIds = new Set();
Object.entries(corruptChecks).forEach(([name, fn]) => {
  listings.filter(fn).forEach(l => allCorruptIds.add(l.listing_id));
});
console.log("corrupt_listing_ids: ", [...allCorruptIds]);


// ----------  Q9: fake_listing_ids ----------
// Phone number linked to multiple different seller names 
const phoneToNames = {};
listings.forEach(l => {
  if (!phoneToNames[l.posted_by_contact]) phoneToNames[l.posted_by_contact] = new Map();
  const names = phoneToNames[l.posted_by_contact];
  if (!names.has(l.posted_by_name)) names.set(l.posted_by_name, []);
  names.get(l.posted_by_name).push(l.listing_id);
});

const nameCountDistribution = {};
Object.values(phoneToNames).forEach(names => {
  const size = names.size;
  nameCountDistribution[size] = (nameCountDistribution[size] || 0) + 1;
});
console.log('Distribution of distinct-name-count per phone number:', nameCountDistribution);

// flag phones with a high number of distinct identities, not just >1
const THRESHOLD = 3; // more than 3 distinct names behind one number is hard to explain as a small real office
const suspiciousPhones = Object.entries(phoneToNames).filter(([_, names]) => names.size > THRESHOLD);

console.log('Phones with >', THRESHOLD, 'distinct names:', suspiciousPhones.length);

const fakeListingIds = new Set();
suspiciousPhones.forEach(([phone, names]) => {
  console.log(phone, names.size, 'names,', [...names.values()].flat().length, 'listings');
  names.forEach(ids => ids.forEach(id => fakeListingIds.add(id)));
});

console.log('Total fake_listing_ids candidates:', fakeListingIds.size);
// const sortedCorruptIds = [...fakeListingIds].sort();
// const printInRows = (arr, perRow = 5) => {
//   for (let i = 0; i < arr.length; i += perRow) {
//     console.log(arr.slice(i, i + perRow).map(id => `"${id}"`).join(', ') + ',');
//   }
// }
// printInRows(sortedCorruptIds);


// ----------  Q6: avg_price_per_sqft_2bhk ----------
const excludedIds = new Set([...allCorruptIds, ...fakeListingIds]); // your Q4 + Q9 results

const eligible = listings.filter(l =>
  l.is_live === true &&
  l.bedroom === 2 &&
  !excludedIds.has(l.listing_id)
);

const pricePerSqft = eligible.map(l => l.price / l.carpet_area);
const avg = pricePerSqft.reduce((sum, v) => sum + v, 0) / pricePerSqft.length;

console.log('Eligible 2BHK listings:', eligible.length);
console.log('Q6 avg_price_per_sqft_2bhk:', Math.round(avg * 100) / 100);