import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase/app';
import 'firebase/auth';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		user: {},
		users: {},
		topics: {},
		levels: {},
		isAdmin: false,

		loading: {
			topics: true,
			levels: true,
			role: true
		}
	},
	mutations: {
		addUser(state, userData) {
			Vue.set(state.users, userData.uid, userData)
		},
		setUserData(state, userData) {
			state.user = userData;
		},
		isAdmin(state, isAdmin){
			state.isAdmin = isAdmin;
			state.loading.role = false;
		},
		updateObject(state, payload) {
			Vue.set(state[payload.object], payload.key, payload.data)
		},
		ready(state, where) {
			Vue.set(state.loading, where, false);
		}
	},
	actions: {
		initApp({
			commit
		}) {
			/// TODO: Replace it with VuexFire
			firebase.firestore().collection("topics").get().then((snapshot) => { /// Download Topic Data, and save it on state.topics
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

			firebase.firestore().collection("levels").get().then((snapshot) => {
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

			let user = firebase.auth().currentUser;
			firestore.collection('users').doc(user.uid).onSnapshot((snapshot) => {
				let userData = snapshot.data();
				userData.uid = user.uid;
				commit('setUserData', userData);
				commit('addUser', userData);
				commit('ready', 'user');
			});

		}
	}
})
