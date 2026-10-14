import { describe, expect, test } from 'vitest';
import { GITHUB_PROFILE_URL, LINKEDIN_URL } from '../consts';
import { COURSE_MODULES } from '../data/course-modules';
import {
  ORGANIZATION_ID,
  PERSON_ID,
  PERSON_SAME_AS,
  PERSON_TOPICS,
  PERSON_URL,
  organizationNode,
  organizationRef,
  personNode,
  personRef,
} from './entity';

describe('entity ids', () => {
  test('Person and Organization ids are the canonical ones', () => {
    expect(PERSON_ID).toBe('https://ginnytech.it/about#andrii-dyshkantiuk');
    expect(ORGANIZATION_ID).toBe('https://ginnytech.it/#ginnytech');
    expect(PERSON_URL).toBe('https://ginnytech.it/about');
  });
});

describe('personRef', () => {
  test('has exactly @type, @id, name, url', () => {
    const ref = personRef();
    expect(Object.keys(ref).sort()).toEqual(['@id', '@type', 'name', 'url']);
    expect(ref['@type']).toBe('Person');
    expect(ref['@id']).toBe(PERSON_ID);
    expect(ref.name).toBe('Andrii Dyshkantiuk');
    expect(ref.url).toBe('https://ginnytech.it/about');
  });
});

describe('personNode', () => {
  test('knowsAbout is derived from PERSON_TOPICS', () => {
    expect(personNode().knowsAbout).toEqual(PERSON_TOPICS.map((t) => t.name));
  });

  test('carries the fixed description, job title and organization link', () => {
    const node = personNode();
    expect(node['@id']).toBe(PERSON_ID);
    expect(node.jobTitle).toBe('MarTech Expert, Data Engineer e Formatore');
    expect(node.description).toBe(
      'Andrii Dyshkantiuk è un esperto di MarTech in Italia con oltre 15 anni di esperienza tra marketing analytics, data engineering e formazione pratica. È il fondatore di GinnyTech.',
    );
    expect(node.worksFor).toEqual({ '@id': ORGANIZATION_ID });
    expect(node.image).toBe('https://ginnytech.it/andrii.webp');
  });
});

describe('PERSON_TOPICS', () => {
  test('every topic links to an existing course module', () => {
    const moduleIds = new Set(COURSE_MODULES.map((m) => m.id));
    for (const topic of PERSON_TOPICS) {
      expect(topic.href).toMatch(/^\/course\/[a-z0-9-]+\/$/);
      expect(moduleIds.has(topic.href.split('/')[2])).toBe(true);
    }
  });
});

describe('PERSON_SAME_AS', () => {
  test('contains LinkedIn and GitHub profiles', () => {
    expect(PERSON_SAME_AS).toContain(LINKEDIN_URL);
    expect(PERSON_SAME_AS).toContain(GITHUB_PROFILE_URL);
  });
});

describe('organizationRef', () => {
  test('is a compact Organization with the canonical id and an ImageObject logo', () => {
    expect(organizationRef()).toEqual({
      '@type': 'Organization',
      '@id': 'https://ginnytech.it/#ginnytech',
      name: 'GinnyTech',
      url: 'https://ginnytech.it',
      logo: { '@type': 'ImageObject', url: 'https://ginnytech.it/ginni.webp' },
    });
  });
});

describe('organizationNode', () => {
  test('founder points at the Person id', () => {
    const org = organizationNode();
    expect(org['@id']).toBe(ORGANIZATION_ID);
    expect((org.founder as { '@id': string })['@id']).toBe(PERSON_ID);
    expect(org.sameAs).toEqual(PERSON_SAME_AS);
  });

  test('type can be switched to EducationalOrganization', () => {
    expect(organizationNode('EducationalOrganization')['@type']).toBe('EducationalOrganization');
    expect(organizationNode()['@type']).toBe('Organization');
  });
});
