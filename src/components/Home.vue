<template>
	<div class="homepage container extend" v-if="!loading">
		<md-empty-state md-icon="add" md-label="Guardar Tema" md-description="Guardar temas a tu cuenta para accederlo más rápido" v-if="!savedTopics.length">
			<md-progress-spinner md-mode="indeterminate" v-if="loading"></md-progress-spinner>
			<md-button class="md-primary md-raised" v-else v-on:click="showDialog.topics = true">Explorar</md-button>
		</md-empty-state>

		<div class="md-layout-row md-layout-column-small md-gutter" v-else>
			<div class="md-layout-column md-flex-large-25 md-gutter" v-for="topicID in savedTopics" :key="topicID">
				<router-link :to="'/t/' + topicID">
					<md-card>
						<md-card-media-cover md-solid>
							<md-card-media>
								<img src="https://source.unsplash.com/random/300x300">
							</md-card-media>

							<md-card-area>
								<md-card-header>
									<div class="md-title">{{ topics[topicID].name }}</div>
									<div class="md-subhead">{{ levels[topics[topicID].level].name }}</div>
								</md-card-header>
							</md-card-area>
						</md-card-media-cover>
					</md-card>
				</router-link>
			</div>
		</div>
		<md-dialog :md-active.sync="showDialog.topics" :md-fullscreen="false">
			<Explore />
		</md-dialog>

		<md-button class="md-fab md-primary exploreButton" v-on:click="showDialog.topics = true">
			<md-icon>add</md-icon>
		</md-button>

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
	created () {
		this.deleteInvalidTopics(); // TODO: Move this function to somewhere else
	},
	methods: {
		deleteInvalidTopics: function () {
			this.savedTopics.forEach((topicID) => {
				if (!this.$store.state.topics.hasOwnProperty(topicID)) {
					removeTopic(topicID);
				}
			})
		}
	}
}
</script>
<style scoped>
.homepage {
  margin: 2em auto;
}

.exploreButton {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
