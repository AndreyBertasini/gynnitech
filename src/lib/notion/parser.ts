import { NotionToMarkdown } from "notion-to-md";
import type { Client } from "@notionhq/client";
import type { NotionPageProperties, ContentMetadata } from "./types";

export class NotionParser {
    private n2m: NotionToMarkdown;

    constructor(client: Client) {
        this.n2m = new NotionToMarkdown({ notionClient: client });
    }

    async getPageContent(pageId: string): Promise<string> {
        const mdblocks = await this.n2m.pageToMarkdown(pageId);
        const mdString = this.n2m.toMarkdownString(mdblocks);
        return mdString.parent;
    }

    extractMetadata(page: any): ContentMetadata {
        const props = page.properties; // Type assertion handled loosely to avoid deep API types
        
        // Helper to safely get values
        const getText = (prop: any) => prop?.rich_text?.[0]?.plain_text || '';
        const getTitle = (prop: any) => prop?.title?.[0]?.plain_text || 'Untitled';
        const getSelect = (prop: any) => prop?.select?.name;
        const getStatus = (prop: any) => prop?.status?.name || prop?.select?.name;
        const getMultiSelect = (prop: any) => prop?.multi_select?.map((i: any) => i.name) || [];
        const getDate = (prop: any) => prop?.date?.start || new Date().toISOString();
        const getCheckbox = (prop: any) => prop?.checkbox || false;
        const getNumber = (prop: any) => prop?.number || 0;
        
        // Author handling (Person or text fallback)
        let author = 'GynniTech Team';
        if (props.Author?.people?.[0]) {
            author = props.Author.people[0].name || author;
        } else if (props.Author?.rich_text?.[0]) {
            author = getText(props.Author);
        }

        // Image handling
        let image = undefined;
        if (props.Image?.files?.[0]) {
            image = props.Image.files[0].file?.url || props.Image.files[0].external?.url;
        }

        return {
            title: getTitle(props.Name),
            slug: getText(props.Slug) || page.id, // Fallback to ID if slug missing
            type: getSelect(props.Type) || 'Page',
            status: getStatus(props.Status) || 'Draft',
            date: getDate(props.Date),
            description: getText(props.Summary),
            category: getSelect(props.Category),
            tags: getMultiSelect(props.Tags),
            author,
            image,
            inMenu: getCheckbox(props.MenuVisibility),
            order: getNumber(props.Order),
            notionId: page.id,
            lastEdited: page.last_edited_time,
        };
    }
}
