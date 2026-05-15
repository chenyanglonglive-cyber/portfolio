const fs = require('fs');
const path = require('path');

const videoPath = 'D:\\blog\\video\\H264\\B1247-超燃变身2-Ai-竖-3.02-Wcy.mp4';
const apiUrl = 'https://wcyblog.space/api/presigned-upload';

async function testUpload() {
  console.log('Testing upload for:', videoPath);
  
  if (!fs.existsSync(videoPath)) {
    console.error('File not found:', videoPath);
    return;
  }

  const stat = fs.statSync(videoPath);
  const buffer = fs.readFileSync(videoPath);

  console.log('1. Fetching presigned URL...');
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: 'test-direct-video.mp4', contentType: 'video/mp4' })
  });
  
  const data = await res.json();
  if (!data.uploadUrl) {
    console.error('Failed to get presigned URL:', data);
    return;
  }
  
  console.log('2. Presigned URL obtained. Uploading directly to R2...');
  console.log('Bucket check in URL:', data.uploadUrl.substring(0, 150));
  
  const uploadRes = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4' },
    body: buffer,
    duplex: 'half'
  });
  
  if (uploadRes.ok) {
    console.log('3. Upload successful! File should now be in R2.');
    console.log('Public URL:', data.publicUrl);
  } else {
    console.error('Upload failed with status:', uploadRes.status);
    const text = await uploadRes.text();
    console.error('Error text:', text);
  }
}

testUpload();
