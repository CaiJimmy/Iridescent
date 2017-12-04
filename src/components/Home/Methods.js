import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import store from '@/store';

export default {
	methods: {
		removeTopic(topicID) {
			let savedTopics = store.state.user.savedTopics,
				user = store.state.user;
			let index = savedTopics.indexOf(topicID);
			if (index > -1) {
				savedTopics.splice(index, 1);
				return firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update(user);
			}
		},
		saveTopic(topicID) {
			let savedTopics = store.state.user.savedTopics,
				user = store.state.user;
			if (!savedTopics) {
				savedTopics = [];
			};
			if (!savedTopics.includes(topicID)) {
				savedTopics.push(topicID);
				firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update(user);
			};
		}
	}
}
