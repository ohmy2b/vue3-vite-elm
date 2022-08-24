import { createApp } from 'vue'
import store from './store/index'
import router from './router/router'
import axios from '@/utils/axios'
import './style.css'
import App from './App.vue'

const app=createApp(App)
// const router = new VueRouter({
// 	routes,
// 	mode: routerMode,
// 	strict: process.env.NODE_ENV !== 'production',
// 	scrollBehavior (to, from, savedPosition) {
// 	    if (savedPosition) {
// 		    return savedPosition
// 		} else {
// 			if (from.meta.keepAlive) {
// 				from.meta.savedPosition = document.body.scrollTop;
// 			}
// 		    return { x: 0, y: to.meta.savedPosition || 0 }
// 		}
// 	}
// })
app.use(router)
app.use(store)
app.config.globalProperties.$http = axios   // 全局挂载axios
app.mount('#app')
