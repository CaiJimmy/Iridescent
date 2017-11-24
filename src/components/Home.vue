<template>
	<div class="homepage container compact">
		<md-empty-state md-icon="add" md-label="Guardar Tema" md-description="Guardar temas a tu cuenta para accederlo más rápido">
			<md-progress-spinner md-mode="indeterminate" v-if="loading"></md-progress-spinner>
			<md-button class="md-primary md-raised" v-else v-on:click="showDialog.topics = true">Explorar</md-button>
		</md-empty-state>

		<md-list class="md-elevation-2 md-double-line" v-if="!loading">
			<md-subheader>
				<span class="md-list-item-text">Temas Guardados</span>
			</md-subheader>

			<md-list-item v-for="topicID in savedTopics" :key="topicID" v-on:click="$router.push('/t/' + topicID)">
				<span class="md-list-item-text">
					<span>{{ topics[topicID].name }}</span>
					<span>{{ levels[topics[topicID].level].name }}</span>
				</span>
			</md-list-item>
		</md-list>

		<md-dialog :md-active.sync="showDialog.topics" :md-fullscreen="false">
			<Explore />
		</md-dialog>

	</div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import Explore from './Home/Explore.vue'
import Methods from './Home/Methods.js'

import General from '@/mixins/general.js'
export default {
	name: 'Home',
	components: {
		Explore
	},
	mixins: [General, Methods],
	data () {
		return {
			showDialog: {
				topics: false
			}
		}
	},
	computed: {
		savedTopics: function () {
			return this.user.savedTopics || [];
		},
		loading: function () {
			return this.$store.state.loading.levels | this.$store.state.loading.topics;
		}
	},
	created(){
		this.deleteInvalidTopics(); // TODO: Move this function to somewhere else
	},
	methods: {
		deleteInvalidTopics: function(){
			this.savedTopics.forEach((topicID) => {
				firebase.firestore().collection('topics').doc(topicID).get().then((doc) => {
					if(!doc.exist){
						this.removeTopic(topicID);
					}
				})
			})
		}
	}
}
</script>
<style scoped>
.homepage {
  margin: 2em auto;
}
</style>
