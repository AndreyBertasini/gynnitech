import type { APIRoute, GetStaticPaths } from 'astro';
import { type CollectionEntry, getCollection } from 'astro:content';
import { SITE_URL } from '../../../consts';
import { MARKDOWN_HEADERS, renderAgentDocument } from '../../../lib/agent-markdown';
import { readEntryBody } from '../../../lib/entry-body';

const slugOf = (file: string) => file.replace(/\.[^/.]+$/, '');

export const getStaticPaths = (async () => {
  const lessons = (await getCollection('corso')).filter((entry) => entry.id.includes('/'));
  return lessons.map((entry) => {
    const [module, file] = entry.id.split('/');
    return { params: { module, slug: slugOf(file) }, props: { entry } };
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, params }) => {
  const { entry } = props as { entry: CollectionEntry<'corso'> };
  if (!entry.filePath) {
    throw new Error(`corso entry "${entry.id}" has no filePath; cannot read its Markdown body`);
  }
  const text = renderAgentDocument(
    {
      title: entry.data.title,
      description: entry.data.description,
      url: `${SITE_URL}/course/${params.module}/${params.slug}/`,
      dateModified: entry.data.dateModified,
    },
    await readEntryBody(entry.filePath),
  );
  return new Response(text, { headers: MARKDOWN_HEADERS });
};
