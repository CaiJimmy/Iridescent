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
			component: require('@/components/Home.vue').default,
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
			}]
		},
		{
			path: '/settings/topics/',
			component: () =>
				import ('@/components/Settings/Topics.vue'),
			auth: true,
			meta: {
				isAdmin: true
			}
		},
		{
			path: '/t/:topicID/',
			component: require('@/components/Topic/App.vue').default,
			auth: true,
			props: true,
			children: [{
					path: '',
					component: require('@/components/Topic/Home.vue').default
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
			component: require('@/components/Profile/App.vue').default,
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
		if (to.meta.isAdmin && !store.state.user.isAdmin && !store.state.loading.user) {
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
	};
})

export default router
