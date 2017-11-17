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

// These imports load individual services into the firebase namespace.
import 'firebase/auth';


import VueFire from 'vuefire';
Vue.use(VueFire);

import VeeValidate from 'vee-validate';
Vue.use(VeeValidate);

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
	data () {
		return {
			firebaseReady: false
		}
	},
	firestore () {
		return {
			user: firebase.firestore().collection('users')
		}
	},
	created () {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				firestore.collection('users').doc(user.uid).set({
					'name': user.displayName,
					'email': user.email,
					'photoURL': user.photoURL
				});
			}
			this.firebaseReady = true;
		});
	}
});
