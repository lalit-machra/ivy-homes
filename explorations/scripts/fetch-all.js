import "dotenv/config";
import axios from "axios";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;
const LIMIT = 50;

async function login() {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: process.env.EMAIL1,
      password: process.env.PASSWORD
    }, {
      headers: { 'X-API-Key': API_KEY }
    });
    return res.data.access_token;
}

async function fetchAll(endpoint, token) {
    let offset = 0;
    let hasMore = true;
    const all = [];

    while (hasMore) {
        const res = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: { 'X-API-Key': API_KEY, 'Authorization': `Bearer ${token}` },
            params: { limit: LIMIT, offset }
        });

        const { count, total, has_more, results } = res.data;
        all.push(...results);

        if (offset === 0) {
            console.log(`${endpoint} — reported total: ${total}, count per page: ${count}`);
          }
      
        hasMore = has_more;

        offset += LIMIT;
    }

    console.log(`${endpoint} — fetched ${all.length} records total`);

    return all;
}

async function main() {
    const outDir = path.join(process.cwd(), 'data');
    fs.mkdirSync(outDir, { recursive: true });

    const token = await login();

    console.log("Fetching listings...");
    const listings = await fetchAll("/v1/listings", token);
    countNotLiveEntries(listings);
    fs.writeFileSync(path.join(outDir, "listings.json"), JSON.stringify(listings, null, 2));

    console.log("Fetching rentals...");
    const rentals = await fetchAll('/v1/rentals', token);
    fs.writeFileSync(path.join(outDir, 'rentals.json'), JSON.stringify(rentals, null, 2));

    console.log("Fetching projects...");
    const projects = await fetchAll('/v1/projects', token);
    countNotLiveEntries(projects);
    fs.writeFileSync(path.join(outDir, 'projects.json'), JSON.stringify(projects, null, 2));
}

main().catch(err => {
    console.error('Fetch failed:', err.response?.data || err.message);
    process.exit(1);
});