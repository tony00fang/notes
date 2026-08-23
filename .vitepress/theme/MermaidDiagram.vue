<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  code: string
  caption?: string
}>()

const host = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref('')
let themeObserver: MutationObserver | undefined
let renderVersion = 0

const mermaidModuleUrl =
  'https://cdn.jsdelivr.net/npm/mermaid@11.17.0/dist/mermaid.esm.min.mjs'

async function renderDiagram(): Promise<void> {
  const version = ++renderVersion
  loading.value = true
  error.value = ''

  try {
    await nextTick()

    const module = await import(/* @vite-ignore */ mermaidModuleUrl)
    const mermaid = module.default
    const isDark = document.documentElement.classList.contains('dark')

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: isDark ? 'dark' : 'neutral',
      fontFamily:
        '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, sans-serif',
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
      },
    })

    const id = `mermaid-${Date.now()}-${version}-${Math.random()
      .toString(36)
      .slice(2)}`
    const result = await mermaid.render(id, props.code.trim())

    if (version !== renderVersion || !host.value) return

    host.value.innerHTML = result.svg
    result.bindFunctions?.(host.value)
  } catch (cause) {
    if (version !== renderVersion) return

    if (host.value) host.value.innerHTML = ''
    error.value =
      cause instanceof Error ? cause.message : 'Mermaid diagram failed to render.'
  } finally {
    if (version === renderVersion) loading.value = false
  }
}

onMounted(() => {
  void renderDiagram()

  themeObserver = new MutationObserver(() => {
    void renderDiagram()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

watch(
  () => props.code,
  () => {
    if (typeof document !== 'undefined') void renderDiagram()
  },
)

onBeforeUnmount(() => {
  renderVersion += 1
  themeObserver?.disconnect()
})
</script>

<template>
  <figure class="mermaid-figure">
    <div class="mermaid-frame">
      <div v-if="loading" class="mermaid-loading">Rendering diagram…</div>
      <div ref="host" class="mermaid-host" />
      <details v-if="error" class="mermaid-error">
        <summary>Diagram unavailable — show Mermaid source</summary>
        <pre><code>{{ props.code }}</code></pre>
      </details>
    </div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.mermaid-figure {
  margin: 28px 0 34px;
}

.mermaid-frame {
  min-height: 180px;
  padding: 20px;
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-elv);
}

.mermaid-host {
  display: flex;
  justify-content: center;
  min-width: 0;
}

.mermaid-host :deep(svg) {
  width: 100%;
  height: auto;
  max-width: 100%;
}

.mermaid-loading {
  display: grid;
  min-height: 140px;
  place-items: center;
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.mermaid-error {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.mermaid-error pre {
  margin-top: 12px;
  white-space: pre;
}

figcaption {
  margin-top: 10px;
  color: var(--vp-c-text-3);
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
}

@media (max-width: 640px) {
  .mermaid-frame {
    padding: 12px;
  }
}
</style>
