# Notes

公开文档站：[https://tony00fang.github.io/notes/](https://tony00fang.github.io/notes/)

长期笔记、分析文档、研究记录和写作模板。用 VitePress 构建，发布到 GitHub Pages。

## 本地

```bash
npm install
npm test
npm run dev
```

生产构建：

```bash
npm run build
```

## 目录

```text
.
├── index.md
├── ai-daily-brief/
├── ai-infra/
├── agents/
└── templates/
```

`ai-daily-brief/` 由本机 Codex Automation 每日生成、校验并推送。

推到 `main` 后，GitHub Actions 会自动构建并发布。
