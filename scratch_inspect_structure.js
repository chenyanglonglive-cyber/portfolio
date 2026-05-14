const https = require('https');

const url = 'https://dazzling-family-6d1f24102d.strapiapp.com/api/works?populate=*';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      // Print the full structure of the first work that has a video
      const workWithVideo = json.data.find(w => w.Video);
      if (workWithVideo) {
        console.log('Full structure of Work with Video:', JSON.stringify(workWithVideo, null, 2));
      } else {
        console.log('No work with Video found in:', JSON.stringify(json.data[0], null, 2));
      }
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching data:', err.message);
});
