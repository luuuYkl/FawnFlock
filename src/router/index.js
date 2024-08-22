import { createRouter, createWebHistory } from 'vue-router';
import LoginPage1 from '../views/LoginPage/LoginPage1.vue';


const routes = [
  {
    path: '/',
    name: 'LoginPage1',
    component: LoginPage1,
  },
  {
    path: '/about',
    name: 'About',
    // 懒加载路由
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/LoginPagePhoneNumber',
    name: 'LoginPagePhoneNumber',
    component: () => import('../views/LoginPage/LoginPagePhoneNumber.vue'),
  },
  {
    path: '/LoginPagePN2',
    name: 'LoginPagePN2',
    component: () => import('../views/LoginPage/LoginPagePN2.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
