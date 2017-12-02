import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

export default {
	methods: {
		removeTopic(topicID) {
			let savedTopics = this.user.savedTopics,
				index = savedTopics.indexOf(topicID);
			if (index > -1) {
				savedTopics.splice(index, 1);
				firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update(this.user);
			}
		},
		saveTopic(topicID) {
			if (!this.user.savedTopics) {
				this.user.savedTopics = [];
			};
			if (!this.user.savedTopics.includes(topicID)) {
				this.user.savedTopics.push(topicID);
				firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update(this.user);
			};
		}
	}
}
