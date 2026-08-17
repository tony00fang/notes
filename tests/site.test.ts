import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
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
})
