const q = `[out:json][timeout:15];
(
  node["shop"="chemist"](around:5000,18.5204,73.8567);
  node["shop"="agrarian"](around:15000,18.5204,73.8567);
  way["shop"="agrarian"](around:15000,18.5204,73.8567);
);
out center tags 5;`;

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'KisanSarthi/1.0',
  },
  body: 'data=' + encodeURIComponent(q),
});

const data = await res.json();
console.log('Sample elements:');
data.elements.forEach((el, idx) => {
  const lat = el.lat || el.center?.lat;
  const lon = el.lon || el.center?.lon;
  console.log(`${idx+1}. [${el.type}] Name: "${el.tags?.name || 'N/A'}" Lat: ${lat}, Lon: ${lon}`);
});
