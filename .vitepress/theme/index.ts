import DefaultTheme from 'vitepress/theme'
import HomeNotes from './HomeNotes.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeNotes', HomeNotes)
  },
}
