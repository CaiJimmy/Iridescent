import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Login from '@/components/Login'

import * as firebase from 'firebase/app';
import 'firebase/auth';

Vue.use(Router)

var router = new Router({
	routes: [
		{
			path: '/',
			component: HelloWorld,
			name: 'Dashboard',
			auth: true
		},
		{
			path: '/settings/topics/',
			name: "Administrar temas",
			component: require('@/components/Settings/Topics.vue').default,
			auth: true
		},
		{
			path: '/t/:id/',
			name: "{{ id }}",
			component: require('@/components/Topic/Index.vue').default,
			auth: true
		},
		{
			path: '/login',
			component: Login
		}
	]
})

router.beforeEach(function (to, from, next) {
	if (to.auth && !firebase.auth().currentUser) {
		next('/login')
	} else {
		next()
	}
})

export default router
