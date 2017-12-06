// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import "babel-core/register"
import 'babel-polyfill'

import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import {
	MdButton,
	MdAvatar,
	MdCard,
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

Vue.use(MdButton)
Vue.use(MdAvatar)
Vue.use(MdCard)
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

Vue.config.productionTip = false;

import * as firebase from 'firebase/app';
import 'firebase/auth';

import VueFire from 'vuefire';
Vue.use(VueFire);

import VeeValidate from 'vee-validate';
Vue.use(VeeValidate);

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

import VueAnalytics from 'vue-analytics'
Vue.use(VueAnalytics, {
	id: 'UA-109882635-1',
	router
})

import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

if (process.env.NODE_ENV == 'production') {
	Raven
		.config('https://4df6cbc1bf6649558d711777044cf971@sentry.io/253780')
		.addPlugin(RavenVue, Vue)
		.install();
};

var config = {
	apiKey: "AIzaSyB-E8FlF70tYS8Rq4fQURI2HcfeisSrSls",
	authDomain: "elysian-9d52f.firebaseapp.com",
	databaseURL: "https://elysian-9d52f.firebaseio.com",
	projectId: "elysian-9d52f",
	storageBucket: "elysian-9d52f.appspot.com",
	messagingSenderId: "434339917281"
};

firebase.initializeApp(config);
window.firestore = firebase.firestore();

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
