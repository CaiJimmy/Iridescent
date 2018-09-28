import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import * as firebase from 'firebase/app';
import 'firebase/auth';
import store from '@/store';

Vue.use(Meta)
Vue.use(Router)

function loadComponent(view) {
    return () =>
        import( /* webpackChunkName: "view-[request]" */ `@/components/${view}.vue`)
}

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
            component: loadComponent('Home'),
            auth: true
        },
        {
            path: '/admin/',
            component: loadComponent('Admin/App'),
            auth: true,
            meta: {
                isAdmin: true
            },
            children: [{
                    path: '',
                    component: loadComponent('Admin/Home')
                },
                {
                    path: 'taxonomy',
                    component: loadComponent('Admin/Taxonomy/App'),
                },
                {
                    path: 'export',
                    component: loadComponent('Admin/Export/App'),
                },
                {
                    path: 'bulk',
                    component: loadComponent('Admin/Bulk/App'),
                }
            ]
        },
        {
            path: '/t/:topicID/',
            component: loadComponent('Topic/App'),
            auth: true,
            props: true,
            children: [{
                    path: '',
                    component: loadComponent('Topic/Home')
                },
                {
                    path: 'exam',
                    component: loadComponent('Exam/App'),
                    children: [{
                            path: '',
                            component: loadComponent('Exam/Home')
                        }, {
                            path: 'progress',
                            component: loadComponent('Exam/InProgress'),
                            meta: {
                                'returnDisabled': true
                            },
                        },
                        {
                            path: 'results',
                            component: loadComponent('Exam/Results'),
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
            component: loadComponent('Profile/App'),
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
