import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import * as firebase from 'firebase/app';
import 'firebase/auth';

Vue.use(Meta)
Vue.use(Router)

var router = new Router({
	routes: [
		{
			path: '/',
			component: require('@/components/HelloWorld.vue').default,
			auth: true
		},
		{
			path: '/settings/topics/',
			component: require('@/components/Settings/Topics.vue').default,
			auth: true
		},
		{
			path: '/t/:id/',
			component: require('@/components/Topic/App.vue').default,
			auth: true,
			children: [
				{
					path: '',
					component: require('@/components/Topic/Home.vue').default
				},
				{
					path: 'send',
					component: require('@/components/Topic/Send.vue').default
				}
			]
		},
		{
			path: '/login',
			component: require('@/components/Login.vue').default
		}
	]
})

router.beforeEach(function (to, from, next) {
	if (to.auth && !firebase.auth().currentUser) {
		next({
			path: '/login',
			query: {
				go: to.path,
			}
		})
	} else {
		next()
	}
});

router.afterEach(function (to, from, next) {
	if (to.path !== '/login' && !firebase.auth().currentUser) {
		router.replace({
			path: '/login',
			query: {
				go: to.fullPath,
			},
		});
	};
})

export default router
