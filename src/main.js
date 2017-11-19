// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
Vue.use(VueMaterial)
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
})

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
	template: '<App/>',
	components: {
		App
	},
	data() {
		return {
			firebaseReady: false
		}
	},
	created() {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				firestore.collection('users').doc(user.uid).set({
					'displayName': user.displayName,
					'email': user.email,
					'photoURL': user.photoURL
				}, {
					merge: true
				});
			}
			this.firebaseReady = true;
		});
	}
});
