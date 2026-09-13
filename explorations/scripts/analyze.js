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