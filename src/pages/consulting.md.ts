import type { APIRoute } from 'astro';
import { MARKDOWN_HEADERS, renderConsultingDocument } from '../lib/agent-markdown';

export const prerender = true;

export const GET: APIRoute = () => {
  return new Response(renderConsultingDocument(), { headers: MARKDOWN_HEADERS });
};
