import DefaultTheme from 'vitepress/theme'
import HomeNotes from './HomeNotes.vue'
import MermaidDiagram from './MermaidDiagram.vue'
import Layout from './Layout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomeNotes', HomeNotes)
    app.component('MermaidDiagram', MermaidDiagram)
  },
}
