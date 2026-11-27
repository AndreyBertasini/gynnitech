import { italianSitemapEntries, renderUrlset, xmlResponse } from '../lib/sitemap-entries';

export const GET = async () => xmlResponse(renderUrlset(await italianSitemapEntries()));
