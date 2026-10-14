import type { APIRoute } from 'astro';
import { MARKDOWN_HEADERS, renderAboutDocument } from '../lib/agent-markdown';

export const GET: APIRoute = () => new Response(renderAboutDocument(), { headers: MARKDOWN_HEADERS });
