import store from '@/store'
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

export default {
	data() {
		return {
			ref: {
				user: firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid),
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
	},
	methods: {
		getTopicsByLevel(levelId) {
            let topics = Object.keys(this.topics).map((k) => this.topics[k])  /// Transform state.topics (object) to an array, to use filter() method

			return topics.filter(topic => topic.level == levelId);
		}
	}
}
