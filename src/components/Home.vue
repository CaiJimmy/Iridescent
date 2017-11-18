<template>
	<div class="homepage container">
		<md-empty-state md-icon="add" md-label="Guardar Tema" md-description="Guardar temas a tu cuenta para accederlo más rápido">
			<md-button class="md-primary md-raised" v-on:click="showDialog.topics = true">Explorar</md-button>
		</md-empty-state>

		<md-list class="md-elevation-2" v-if="savedTopics.length">
			<md-subheader>
				<span class="md-list-item-text">Temas Guardados</span>
			</md-subheader>

			<md-list-item v-for="topicID in savedTopics" :key="topicID">
				<span class="md-list-item-text">{{ getTopicByID(topicID).name }}</span>
				<md-button class="md-icon-button" v-on:click="$router.push('/t/' + topicID)">
					<md-icon>remove_red_eye</md-icon>
				</md-button>
			</md-list-item>
		</md-list>

		<md-dialog :md-active.sync="showDialog.topics" :md-fullscreen="false">
			<Explore v-bind:firebaseRefs="ref" v-bind:levels="levels" v-bind:topics="topics" v-bind:user="user"/>
		</md-dialog>

	</div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import Explore from './Home/Explore.vue'

export default {
	name: 'Home',
	components: {
		Explore
	},
	data () {
		return {
			topics: [],
			levels: [],

			user: {},

			ref: {
				topics: null,
				user: null,
			},

			showDialog: {
				topics: false
			}
		}
	},
	computed: {
		savedTopics: function () {
			return this.user.savedTopics ||  [];
		}
	},
	created: function () {
		let userID = firebase.auth().currentUser.uid;
		this.ref.user = firebase.firestore().collection("users").doc(userID);
		this.$bind("user", this.ref.user);

		this.ref.topics = firebase.firestore().collection("topics");
		this.$bind("topics", this.ref.topics);

		this.ref.levels = firebase.firestore().collection("levels");
		this.$bind("levels", this.ref.levels);

	},
	methods: {
		getTopicByID (topicID) {
			return this.topics.filter(topic => topic.id == topicID)[0];
		},
	}
}
</script>
<style scoped>
.homepage {
  margin: 2em auto;
}
</style>
