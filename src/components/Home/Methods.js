export default {
	methods: {
		removeTopic(topicID) {
			let savedTopics = this.user.savedTopics,
				index = savedTopics.indexOf(topicID);
			if (index > -1) {
				savedTopics.splice(index, 1);
				this.ref.user.update(this.user);
			}
		},
		saveTopic(topicID) {
			if (!this.user.savedTopics) {
				this.user.savedTopics = [];
			};
			if (!this.user.savedTopics.includes(topicID)) {
				this.user.savedTopics.push(topicID);
				this.ref.user.update(this.user);
			};
		}
	}
}