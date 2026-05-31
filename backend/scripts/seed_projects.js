const { createStrapi } = require('@strapi/strapi');

async function main() {
  console.log('Starting Strapi in bootstrap mode...');
  const app = await createStrapi({ distDir: './dist' }).load();

  // 1. Fetch all tags from the database
  console.log('Fetching existing tags...');
  const tags = await app.documents('api::tag.tag').findMany();
  console.log(`Found ${tags.length} tags:`, tags.map(t => t.Name));

  // 2. Prepare projects to be created
  // Default ranks for known tags to keep them clean
  const rankMap = {
    '雷霆战机': 100,
    'bingo clash': 90,
    'bingo tour': 80,
    'bingo frenzy': 70,
    'Movie puzzle': 60,
    '无敌冲冲冲': 50,
    '奇幻魔力消': 40,
    'Bible': 30,
    '其他': 10
  };

  const projectsToCreate = tags.map(t => ({
    Name: t.Name,
    Rank: rankMap[t.Name] || 50
  }));

  // Add "其他" default project if it doesn't exist in tags
  if (!projectsToCreate.some(p => p.Name === '其他')) {
    projectsToCreate.push({ Name: '其他', Rank: 10 });
  }

  // 3. Create projects in database
  const projectMap = {}; // name -> documentId
  console.log('\nCreating projects...');
  for (const p of projectsToCreate) {
    let exist = await app.documents('api::project.project').findFirst({
      filters: { Name: p.Name }
    });
    if (!exist) {
      exist = await app.documents('api::project.project').create({
        data: p,
        status: 'published'
      });
      console.log(`Created project: "${p.Name}" with DocumentID: ${exist.documentId}`);
    } else {
      console.log(`Project already exists: "${p.Name}" with DocumentID: ${exist.documentId}`);
    }
    projectMap[p.Name] = exist.documentId;
  }

  // Define keywords for matching projects based on titles
  const keywordRules = [
    { name: '雷霆战机', match: ['雷霆', '战机', '悍将'] },
    { name: 'bingo clash', match: ['bingo clash', 'bingoclash', 'clash'] },
    { name: 'bingo tour', match: ['bingo tour', 'bingotour', 'tour'] },
    { name: 'bingo frenzy', match: ['bingo frenzy', 'bingofrenzy', 'frenzy'] },
    { name: 'Movie puzzle', match: ['movie', 'puzzle'] },
    { name: '无敌冲冲冲', match: ['无敌', '冲冲冲'] },
    { name: '奇幻魔力消', match: ['魔力消', '奇幻'] },
    { name: 'Bible', match: ['bible'] },
  ];

  // Helper to find project by title matching
  function findProjectByTitle(title) {
    const titleLower = title.toLowerCase();
    for (const rule of keywordRules) {
      if (rule.match.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
        return rule.name;
      }
    }
    return '其他';
  }

  // 4. Link videos
  console.log('\nScanning and linking videos...');
  const videos = await app.documents('api::video.video').findMany({
    populate: ['tags']
  });

  for (const v of videos) {
    let projName = null;
    
    // First Priority: check associated tags
    if (v.tags && v.tags.length > 0) {
      // Find if any tag matches a project name
      const matchingTag = v.tags.find(t => projectMap[t.Name]);
      if (matchingTag) {
        projName = matchingTag.Name;
        console.log(`[Tag Match] Video "${v.Title}" has tag "${matchingTag.Name}"`);
      }
    }

    // Second Priority: fallback to title keywords
    if (!projName) {
      projName = findProjectByTitle(v.Title);
      console.log(`[Title Match] Video "${v.Title}" fallback to "${projName}"`);
    }

    const projId = projectMap[projName];
    if (projId) {
      await app.documents('api::video.video').update({
        documentId: v.documentId,
        data: { project: projId },
        status: 'published'
      });
      console.log(`Linked video "${v.Title}" to project "${projName}"`);
    }
  }

  // 5. Link images
  console.log('\nScanning and linking images...');
  const images = await app.documents('api::image.image').findMany({
    populate: ['tags']
  });

  for (const img of images) {
    let projName = null;

    // First Priority: check associated tags
    if (img.tags && img.tags.length > 0) {
      const matchingTag = img.tags.find(t => projectMap[t.Name]);
      if (matchingTag) {
        projName = matchingTag.Name;
        console.log(`[Tag Match] Image "${img.Title}" has tag "${matchingTag.Name}"`);
      }
    }

    // Second Priority: fallback to title keywords
    if (!projName) {
      projName = findProjectByTitle(img.Title);
      console.log(`[Title Match] Image "${img.Title}" fallback to "${projName}"`);
    }

    const projId = projectMap[projName];
    if (projId) {
      await app.documents('api::image.image').update({
        documentId: img.documentId,
        data: { project: projId },
        status: 'published'
      });
      console.log(`Linked image "${img.Title}" to project "${projName}"`);
    }
  }

  console.log('\nSeeding completed successfully!');
  await app.destroy();
}

main().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
