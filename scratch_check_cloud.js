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
      console.log('Works count:', json.data.length);
      json.data.forEach((work, index) => {
        console.log(`Work ${index + 1}:`, {
          id: work.id,
          documentId: work.documentId,
          Title: work.Title,
          Type: work.Type,
          IsFeatured: work.IsFeatured,
          VideoUrl: work.Video?.url ? 'YES' : 'NO',
          CoverUrl: work.Cover?.url ? 'YES' : 'NO',
        });
      });
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw data sample:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Error fetching data:', err.message);
});
