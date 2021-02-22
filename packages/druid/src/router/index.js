import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  // {
  //   path: '/d3',
  //   name: 'd3',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/D3.vue')
  // },
  // {
  //   path: '/c3',
  //   name: 'c3',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/C3.vue')
  // },
  // {
  //   path: '/vue-d3-charts',
  //   name: 'vd3charts',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/vD3Charts.vue')
  // },
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
