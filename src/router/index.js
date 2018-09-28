import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import * as firebase from 'firebase/app';
import 'firebase/auth';
import store from '@/store';

Vue.use(Meta)
Vue.use(Router)

var router = new Router({
	routes: [{
			path: '*',
			component: require('@/components/NotFound.vue').default,
			meta: {
				hideNav: true
			}
		},
		{
			path: '/403',
			component: require('@/components/NotAllowed.vue').default,
			meta: {
				hideNav: true
			}
		},
		{
			path: '/',
			component: () =>
				import ('@/components/Home.vue'),
			auth: true
		},
		{
			path: '/admin/',
			component: () =>
				import ('@/components/Admin/App.vue'),
			auth: true,
			meta: {
				isAdmin: true
			},
			children: [{
					path: '',
					component: () =>
						import ('@/components/Admin/Home.vue')
				},
				{
					path: 'taxonomy',
					component: () =>
						import ('@/components/Admin/Taxonomy/App.vue'),
				},
				{
					path: 'export',
					component: () =>
						import ('@/components/Admin/Export/App.vue'),
				},
				{
					path: 'bulk',
					component: () =>
						import ('@/components/Admin/Bulk/App.vue'),
				}
			]
		},
		{
			path: '/t/:topicID/',
			component: () =>
				import ('@/components/Topic/App.vue'),
			auth: true,
			props: true,
			children: [{
					path: '',
					component: () =>
						import ('@/components/Topic/Home.vue')
				},
				{
					path: 'exam',
					component: () =>
						import ('@/components/Exam/App.vue'),
					children: [{
							path: '',
							component: () =>
								import ('@/components/Exam/Home.vue')
						}, {
							path: 'progress',
							component: () =>
								import ('@/components/Exam/InProgress.vue'),
							meta: {
								'returnDisabled': true
							},
						},
						{
							path: 'results',
							component: () =>
								import ('@/components/Exam/Results.vue'),
							meta: {
								'returnDisabled': true
							},
						}
					]
				}
			]
		},
		{
			path: '/login',
			component: require('@/components/Login.vue').default
		},
		{
			path: '/profile/:userID',
			component: () =>
				import ('@/components/Profile/App.vue'),
			props: true,
			meta: {
				"hideToolbarTitle": true,
				"toolbarElevation": 0
			}
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
		if (to.matched.some(m => m.meta.isAdmin) && !store.state.user.isAdmin && !store.state.loading.user) {
			next({
				path: '/403'
			})
		} else {
			next();
		}
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
	}
})

export default router
