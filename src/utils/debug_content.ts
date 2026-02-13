
import { getCollection } from 'astro:content';

async function main() {
  const courseEntries = await getCollection('corso');

  console.log(`Found ${courseEntries.length} entries`);

  courseEntries.forEach(entry => {
    const parts = entry.id.split('/');
    if (parts.length < 2) {
      console.error(`Invalid ID format: ${entry.id}`);
    } else if (!parts[1]) {
        console.error(`Missing slug part in ID: ${entry.id}`);
    }
  });
}

main();
