export type NotionContentType = 'Blog' | 'Course' | 'Page';
export type NotionStatus = 'Published' | 'Draft' | 'Scheduled';

export interface NotionPageProperties {
    Name: { title: { plain_text: string }[] };
    Slug: { rich_text: { plain_text: string }[] };
    Type: { select: { name: NotionContentType } };
    Status: { status: { name: NotionStatus } };
    Date: { date: { start: string } };
    Summary: { rich_text: { plain_text: string }[] };
    Category: { select: { name: string } };
    Tags: { multi_select: { name: string }[] };
    Author: { people: { name: string }[] } | { rich_text: { plain_text: string }[] };
    Image: { files: { file?: { url: string }, external?: { url: string } }[] };
    MenuVisibility: { checkbox: boolean };
    Order: { number: number };
}

export interface ContentMetadata {
    title: string;
    slug: string;
    type: NotionContentType;
    status: NotionStatus;
    date: string;
    description: string;
    category?: string;
    tags?: string[];
    author?: string;
    image?: string;
    inMenu: boolean;
    order?: number;
    notionId: string;
    lastEdited: string;
}
