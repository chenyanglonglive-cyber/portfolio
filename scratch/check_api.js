const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}. Status code: ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  const host = 'https://strapi.wcyblog.space';
  console.log(`Querying Strapi API at ${host}...`);

  try {
    // 1. Query published videos
    const videosRes = await fetchUrl(`${host}/api/videos?populate=*&pagination[pageSize]=100`);
    console.log('\n--- Published Videos ---');
    if (videosRes.data && Array.isArray(videosRes.data)) {
      console.log(`Found ${videosRes.data.length} published videos:`);
      videosRes.data.forEach((v) => {
        console.log(`- ID: ${v.id}, Title: "${v.Title}", publishedAt: ${v.publishedAt}, Rank: ${v.Rank}, IsFeatured: ${v.IsFeatured}`);
        if (v.video) {
          console.log(`  Video File URL: ${v.video.url}`);
        } else {
          console.log(`  [WARNING] Video file is missing!`);
        }
        if (v.cover) {
          console.log(`  Cover Image URL: ${v.cover.url}`);
        } else {
          console.log(`  [WARNING] Cover image is missing!`);
        }
      });
    } else {
      console.log('No published videos data returned, or response format is unexpected:', videosRes);
    }
  } catch (err) {
    console.error('Error fetching published videos:', err.message);
  }
}

run();
