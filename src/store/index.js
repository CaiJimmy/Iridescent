import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		user: {},
		users: {},
		topics: {},
		levels: {},

		loading: {
			topics: true,
			levels: true,
			user: true
		}
	},
	mutations: {
		addUser(state, userData) {
			Vue.set(state.users, userData.uid, userData)
		},
		setUserData(state, userData) {
			state.user = userData;
		},
		updateObject(state, payload) {
			Vue.set(state[payload.object], payload.key, payload.data)
		},
		ready(state, where) {
			Vue.set(state.loading, where, false);
		},
		setPrimaryColor(state, color) {
			if (!color) {
				document.documentElement.style.removeProperty('--md-theme-default-primary');
				document.documentElement.style.removeProperty('--md-theme-default-primary-on-background');
				document.documentElement.style.removeProperty('--md-theme-default-primary-on-');
				document.documentElement.style.setProperty('--md-theme-default-text-primary-on-primary', "#fff");
			} else {
				let primaryColor = `rgb(${color.join(', ')})`;

				let colorArray = color.slice(0),
					opacity = 0.3;
				colorArray.push(opacity);
				let progressBarColor = `rgba(${colorArray.join(', ')})`;
				
				document.documentElement.style.setProperty('--md-theme-default-primary', primaryColor);
				document.documentElement.style.setProperty('--md-theme-default-primary-on-background', primaryColor);
				document.documentElement.style.setProperty('--md-theme-default-primary-on-', progressBarColor);
				document.documentElement.style.setProperty('--md-theme-default-text-primary-on-primary', "#fff");
			}
		}
	},
	actions: {
		initApp({
			commit
		}) {
			/// TODO: Replace it with VuexFire
			firebase.firestore().collection("topics").orderBy('name', 'asc').onSnapshot((snapshot) => { /// Listen and download /topics, and save it on state.topics
				snapshot.forEach((doc) => {
					let topic = doc.data();
					topic.id = doc.id;
					commit('updateObject', {
						'object': 'topics',
						'key': doc.id,
						'data': topic
					});
				});
				commit('ready', 'topics');
			});

			firebase.firestore().collection("levels").orderBy('name', 'asc').onSnapshot((snapshot) => {
				snapshot.forEach((doc) => {
					let level = doc.data();
					level.id = doc.id;
					commit('updateObject', {
						'object': 'levels',
						'key': doc.id,
						'data': doc.data()
					});
				});
				commit('ready', 'levels');
			});

			const user = firebase.auth().currentUser;
			firebase.firestore().collection('users').doc(user.uid).onSnapshot((snapshot) => {
				const userData = {
					...snapshot.data(),
					uid: user.uid
				};

				commit('setUserData', userData);
				commit('addUser', userData);
				commit('ready', 'user');
			});

			commit('setPrimaryColor', false);
		}
	}
})
