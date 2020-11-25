import Vue from 'vue';
import App from './App.vue';
import router from './router';
import getClientStore from './store';
import vuetify from './plugins/vuetify';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

Vue.config.productionTip = false;

new Vue({
  router,
  store: getClientStore(Vue),
  vuetify,
  render: h => h(App),
}).$mount('#app');
