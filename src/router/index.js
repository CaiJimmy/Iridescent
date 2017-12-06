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
					component: require('@/components/Exam/App.vue').default,
					children: [{
							path: '',
							component: require('@/components/Exam/Home.vue').default
						}, {
							path: 'progress',
							component: require('@/components/Exam/InProgress.vue').default,
							meta: {
								'returnDisabled': true
							},
						},
						{
							path: 'results',
							component: require('@/components/Exam/Results.vue').default,
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

			},
			children: [{
				path: '/',
				component: require('@/components/Profile/Questions.vue').default,
				meta: {
					"hideToolbarTitle": true,
					"toolbarElevation": 0
				}
			}]
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
		if (to.meta.isAdmin && !store.state.isAdmin && !store.state.loading.role) {
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

	store.commit('setPrimaryColor', false); /// Reset to default color after route change;
})

export default router
