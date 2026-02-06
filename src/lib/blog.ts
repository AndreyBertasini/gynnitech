export interface BlogPost {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Real llms.txt examples from leading tech companies (and what they got right)',
    description: 'A practical look at real llms.txt files from leading developer platforms like Anthropic, Vercel, Stripe, and Cloudflare.',
    category: 'Best Practices',
    date: 'February 7, 2026',
    slug: 'real-llms-txt-examples'
  },
  {
    id: '2',
    title: 'Mintlify + Claude Opus 4.6: Powering AI-native knowledge management',
    description: 'How Mintlify is using Claude to deliver more concise, accurate documentation assistance.',
    category: 'AI Trends',
    date: 'February 5, 2026',
    slug: 'mintlify-claude-opus'
  },
  {
    id: '3',
    title: 'Analytics for AI and agent traffic',
    description: 'See how AI agents use your documentation and why building docs for agent consumption is becoming essential.',
    category: 'Announcements',
    date: 'February 2, 2026',
    slug: 'analytics-for-ai-agents'
  },
  {
    id: '4',
    title: 'A better way to edit and publish in Mintlify',
    description: 'A new web editor that brings publishing, editing, and previewing into one workflow for anyone on your team.',
    category: 'Announcements',
    date: 'January 30, 2026',
    slug: 'better-way-to-edit'
  },
  {
    id: '5',
    title: 'Improved agent experience with llms.txt and content negotiation',
    description: 'Clear, accessible documentation is a prerequisite for agents to successfully perform real world tasks. By improving llms.txt discoverability, we reduce friction.',
    category: 'Best Practices',
    date: 'January 29, 2026',
    slug: 'improved-agent-experience'
  },
  {
    id: '6',
    title: 'Your docs are now discoverable by agents',
    description: 'Every Mintlify docs site now supports automatic skills discovery. Run npx skills add with any docs URL and the CLI finds and installs skills for you.',
    category: 'Announcements',
    date: 'January 28, 2026',
    slug: 'docs-discoverable-by-agents'
  }
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  // Simulating async fetch if we were calling an API
  return new Promise((resolve) => {
    setTimeout(() => resolve(blogPosts), 100);
  });
}
