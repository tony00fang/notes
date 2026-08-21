import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { featuredNotes } from '../.vitepress/featured'
import { sidebar } from '../.vitepress/sidebar'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function pagePath(link: string): string {
  const relative = link.replace(/\/$/, '/index').replace(/^\//, '')
  return join(root, `${relative}.md`)
}

describe('notes site', () => {
  it('publishes under the GitHub Pages project path', () => {
    const config = readFileSync(join(root, '.vitepress/config.ts'), 'utf8')
    expect(config).toContain("base: '/notes/'")
  })

  it('keeps every sidebar link pointing at a markdown file', () => {
    const links = sidebar.flatMap((section) => section.items.map((item) => item.link))
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(existsSync(pagePath(link)), link).toBe(true)
    }
  })

  it('keeps featured home notes pointing at markdown files', () => {
    expect(featuredNotes.length).toBeGreaterThan(0)
    for (const note of featuredNotes) {
      expect(existsSync(pagePath(note.href)), note.href).toBe(true)
    }
  })

  it('prefixes home note links with the GitHub Pages base', () => {
    const source = readFileSync(join(root, '.vitepress/theme/HomeNotes.vue'), 'utf8')
    expect(source).toContain('withBase(note.href)')
  })

  it('keeps markdown article links relative so they stay under /notes/', () => {
    const files = [
      'ai-daily-brief/index.md',
      'ai-infra/index.md',
      'agents/index.md',
      'templates/index.md',
    ]
    for (const file of files) {
      const text = readFileSync(join(root, file), 'utf8')
      expect(text, file).not.toMatch(/\]\(\/[a-zA-Z]/)
    }
  })

  it('keeps the daily brief public index free of private thread identifiers', () => {
    const text = readFileSync(join(root, 'ai-daily-brief/index.md'), 'utf8')
    expect(text).not.toContain('source_thread_id')
    expect(text).not.toMatch(/01[a-z0-9]{6,}-[a-z0-9-]{12,}/i)
  })
})
