import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';

/**
 * Reads an entry's Markdown body straight from its source file. The `corso` collection is loaded with
 * `retainBody: false` (to keep the content store small), so `entry.body` is empty there.
 */
export async function readEntryBody(filePath: string): Promise<string> {
  return matter(await readFile(filePath, 'utf-8')).content;
}
