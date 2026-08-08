const fs = require('fs');
const https = require('https');

https.get('https://irreferencias.blogspot.com/feeds/posts/default?alt=json&max-results=500', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const json = JSON.parse(data);
    const parsedPosts = (json.feed?.entry || []).map((entry) => {
      const id = entry.id?.$t || Math.random().toString();
      return {
        id,
        title: entry.title?.$t || 'Sin título',
        content: entry.content?.$t || '',
        published: entry.published?.$t || new Date().toISOString(),
        tags: entry.category ? entry.category.map((c) => c.term) : [],
        link: entry.link?.find((l) => l.rel === 'alternate')?.href || '',
      };
    });
    fs.writeFileSync('src/data.json', JSON.stringify(parsedPosts, null, 2));
    console.log('Saved ' + parsedPosts.length + ' posts.');
  });
});
