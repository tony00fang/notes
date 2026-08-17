<script setup lang="ts">
import { withBase } from 'vitepress'
import { featuredNotes } from '../featured'
</script>

<template>
  <div class="note-home">
    <header class="note-home__masthead">
      <p class="note-home__kicker">Research notes</p>
      <h1>Notes</h1>
      <p class="note-home__lede">长期笔记、分析文档与研究记录。</p>
    </header>

    <section class="note-home__list" aria-label="现有条目">
      <a
        v-for="note in featuredNotes"
        :key="note.href"
        class="note-card"
        :href="withBase(note.href)"
      >
        <span class="note-card__section">{{ note.section }}</span>
        <strong class="note-card__title">{{ note.title }}</strong>
        <span class="note-card__summary">{{ note.summary }}</span>
      </a>
    </section>

    <p class="note-home__foot">
      分析类文档优先使用
      <a :href="withBase('/templates/analysis-note')">写作模板</a>。
      参考资料带原始链接，并区分事实来源与作者判断。
    </p>
  </div>
</template>
