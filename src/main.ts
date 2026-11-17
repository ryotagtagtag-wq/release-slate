import './style.css'
import { createApp } from 'vue'
import App from './App.vue'

const mountPoint = document.querySelector<HTMLDivElement>('#app')
if (!mountPoint) throw new Error('#app が見つかりません')

createApp(App).mount(mountPoint)
