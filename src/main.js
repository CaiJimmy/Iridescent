// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import "babel-core/register"
import 'babel-polyfill'

import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

/*
	Import Vue Material components
	Only import needed components
*/
import {
	MdButton,
	MdAvatar,
	MdCard,
	MdCheckbox,
	MdDivider,
	MdDialog,
	MdElevation,
	MdEmptyState,
	MdField,
	MdIcon,
	MdList,
	MdLayout,
	MdRadio,
	MdRipple,
	MdProgress,
	MdSnackbar,
	MdSubheader,
	MdToolbar,
	MdTooltip,
	MdTabs
} from 'vue-material/dist/components';
import 'vue-material/dist/vue-material.min.css';

/*
	Load Vue Material components
*/
Vue.use(MdButton)
Vue.use(MdAvatar)
Vue.use(MdCard)
Vue.use(MdCheckbox)
Vue.use(MdDivider)
Vue.use(MdElevation)
Vue.use(MdField)
Vue.use(MdIcon)
Vue.use(MdList)
Vue.use(MdRadio)
Vue.use(MdRipple)
Vue.use(MdProgress)
Vue.use(MdSnackbar)
Vue.use(MdToolbar)
Vue.use(MdLayout)
Vue.use(MdEmptyState)
Vue.use(MdDialog)
Vue.use(MdSubheader)
Vue.use(MdTooltip)
Vue.use(MdTabs)

/*
	Prevent the production tip on Vue startup.
*/
Vue.config.productionTip = false;

/*
	Import & Load Firebase base
*/
import * as firebase from 'firebase/app';
import 'firebase/auth';

/*
	Import & Load VueFire
*/
import VueFire from 'vuefire';
Vue.use(VueFire);

/*
	Import & Load VeeValidate
*/
import VeeValidate from 'vee-validate';
Vue.use(VeeValidate);

/*
	Import & Load VueTimeago
*/
import VueTimeago from 'vue-timeago'
Vue.use(VueTimeago, {
	name: 'timeago',
	locale: 'es-ES',
	locales: {
		'es-ES': [
			"ahora", ["hace %s segundo", "hace %s segundos"],
			["hace %s minuto", "hace %s minutos"],
			["hace %s hora", "hace %s horas"],
			["hace %s día", "hace %s días"],
			["hace %s semana", "hace %s semanas"],
			["hace %s mes", "hace %s meses"],
			["hace %s año", "hace %s años"]
		]
	}
});

/*
	Import & Load VueAnalytics
*/
if (process.env.NODE_ENV == 'production' && process.env.GA_TRACKINGID) {
	import ('vue-analytics').then((VueAnalytics) => {
		Vue.use(VueAnalytics, {
			id: process.env.GA_TRACKINGID,
			router
		})
	});
}

/*
	Import & Load Sentry.io
*/
if (process.env.NODE_ENV == 'production' && process.env.SENTRY_API) {
	import ('raven-js').then((Raven) => {
		import ('raven-js/plugins/vue').then((RavenVue) => {
			Raven
				.config(process.env.SENTRY_API)
				.addPlugin(RavenVue, Vue)
				.install();
		});
	});
};

/*
	Initialize Firebase App using environment variables
*/
firebase.initializeApp({
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.FIREBASE_DATABASE_URL,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	template: '<App/>',
	components: {
		App
	}
});