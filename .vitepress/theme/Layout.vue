<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'
import AgentArticleVisuals from './AgentArticleVisuals.vue'

const { Layout } = DefaultTheme
const { page } = useData()

const isAgentEngineeringArticle = computed(
  () =>
    page.value.relativePath ===
    'agents/agent-and-traditional-software-engineering.md',
)
</script>

<template>
  <Layout>
    <template #doc-before>
      <AgentArticleVisuals
        v-if="isAgentEngineeringArticle"
        placement="before"
      />
    </template>

    <template #doc-after>
      <AgentArticleVisuals
        v-if="isAgentEngineeringArticle"
        placement="after"
      />
    </template>
  </Layout>
</template>
