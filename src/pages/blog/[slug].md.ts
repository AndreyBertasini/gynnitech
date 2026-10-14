import type { APIRoute, GetStaticPaths } from 'astro';
import { type CollectionEntry, getCollection } from 'astro:content';
import { SITE_URL } from '../../consts';
import { MARKDOWN_HEADERS, renderAgentDocument } from '../../lib/agent-markdown';

const slugOf = (id: string) => id.replace(/\.[^/.]+$/, '');

export const getStaticPaths = (async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ params: { slug: slugOf(post.id) }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { post } = props as { post: CollectionEntry<'blog'> };
  const text = renderAgentDocument(
    {
      title: post.data.title,
      description: post.data.description,
      url: `${SITE_URL}/blog/${slugOf(post.id)}/`,
      datePublished: post.data.date,
      dateModified: post.data.dateModified ?? post.data.date,
    },
    post.body ?? '',
  );
  return new Response(text, { headers: MARKDOWN_HEADERS });
};
