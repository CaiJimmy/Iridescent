import store from '@/store'
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

export default {
	data() {
		return {
			ref: {
				topics: firebase.firestore().collection("topics"),
				levels: firebase.firestore().collection("levels")
			}
		}
	},
	computed: {
		user: function () {
			return store.state.user;
		},
		users: function () {
			return store.state.users;
		},
		levels: function () {
			return store.state.levels;
		},
		topics: function () {
			return store.state.topics;
		}
	}
}
