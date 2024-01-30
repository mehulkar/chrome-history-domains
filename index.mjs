// Import the sqlite3 module
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import extractDomain from "extract-domain";

// Function to extract the domain from a URL
async function getDomain(url) {
  try {
    const res = await extractDomain(url, { tld: true });
    return res;
    // const newUrl = new URL(url);
    // return newUrl.hostname;
  } catch (e) {
    console.error(`Invalid URL: ${url}`);
    return null;
  }
}

// Function to get the unique domains from the Chrome history
async function getUniqueDomains(historyPath) {
  const db = await open({
    filename: historyPath,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });

  try {
    const rows = await db.all("SELECT url FROM urls");
    const promises = rows.map((row) => getDomain(row.url));
    const res = await Promise.all(promises);
    const domainsArr = res.filter(Boolean);
    const domains = new Set(domainsArr);
    return [...domains].sort();
  } catch (e) {
    console.error(e.message);
    return [];
  } finally {
    db.close();
  }
}

// Path to your Chrome history file
const historyPath = `${process.env.HOME}/Library/Application Support/Google/Chrome/Default/History`;

// Call the function and log the output
getUniqueDomains(historyPath).then((domains) => {
  console.log("Unique Domains:");
  for (const domain of domains) {
    console.log(domain);
  }
});
