import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar'

export default defineConfig({
  title: 'Notes',
  description: '长期笔记、分析文档与研究记录',
  lang: 'zh-CN',
  base: '/notes/',
  srcExclude: ['README.md'],
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'AI Daily Brief', link: '/ai-daily-brief/' },
      { text: 'AI Infra', link: '/ai-infra/' },
      { text: 'Agents', link: '/agents/' },
      { text: 'Templates', link: '/templates/' },
    ],
    sidebar,
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有结果',
            resetButtonTitle: '清除',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
    outline: {
      label: '本页目录',
      level: [2, 3],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/tony00fang/notes' },
    ],
    lastUpdated: {
      text: '更新于',
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '外观',
  },
})
