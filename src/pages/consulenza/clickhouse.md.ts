import type { APIRoute } from 'astro';
import { MARKDOWN_HEADERS, renderClickHouseConsultingDocument } from '../../lib/agent-markdown';

export const prerender = true;

export const GET: APIRoute = () => {
  return new Response(renderClickHouseConsultingDocument(), { headers: MARKDOWN_HEADERS });
};
