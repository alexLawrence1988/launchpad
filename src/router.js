import Vue from 'vue';
import Router from 'vue-router';
import Blocks from './views/Blocks.vue';
import Login from './views/Login.vue';
import Settings from './views/Settings.vue';
import VisitDetail from './views/VisitDetail.vue';
import Minimized from './views/Minimized.vue';
import Update from './views/Update.vue';

Vue.use(Router);

export default new Router({
  base: process.env.BASE_URL,
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Blocks,
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/detail/:visit',
      name: 'detail',
      component: VisitDetail,
      props: true,
    },
    {
      path: '/minimized',
      name: 'minimized',
      component: Minimized,
    },
    {
      path: '/update',
      name: 'update',
      component: Update,
    },
  ],
});
