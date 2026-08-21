export const sidebar = [
  {
    text: 'AI Daily Brief',
    collapsed: false,
    items: [
      { text: '历史归档', link: '/ai-daily-brief/' },
    ],
  },
  {
    text: 'AI Infra',
    collapsed: false,
    items: [
      { text: '概览', link: '/ai-infra/' },
      { text: 'NVIDIA 五层蛋糕与护城河', link: '/ai-infra/nvidia-five-layer-cake-and-moat' },
    ],
  },
  {
    text: 'Agents',
    collapsed: false,
    items: [
      { text: '概览', link: '/agents/' },
      { text: 'Manus Agent 发展与模型栈', link: '/agents/manus-agent-development-and-model-stack' },
    ],
  },
  {
    text: 'Templates',
    collapsed: false,
    items: [
      { text: '概览', link: '/templates/' },
      { text: '分析笔记模板', link: '/templates/analysis-note' },
    ],
  },
] as const
