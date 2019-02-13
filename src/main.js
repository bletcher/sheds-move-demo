import Vue from 'vue'
import axios from 'axios'
import './plugins/vuetify'
import App from './App.vue'

Vue.config.productionTip = false

//export const eventBus = new Vue()
//axios.defaults.baseURL = config[process.env.NODE_ENV].api.url
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? 'http://ecosheds.org/dev/tagmove/' : 'http://localhost:8082/'

new Vue({
  render: h => h(App),
}).$mount('#app')
