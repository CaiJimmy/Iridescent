<template>
	<div>
		<md-progress-bar class="md-primary"
		    md-mode="indeterminate"
		    v-if="loading"></md-progress-bar>

		<div class="homepage container extend"
		    v-else>
			<div id="mainGrid"
			    class="md-layout md-gutter md-layout-column-xsmall md-alignment">
				<div class="md-layout-column md-layout-item md-size-70 md-small-size-100">
					<md-empty-state md-icon="add"
					    md-label="Guardar Tema"
					    md-description="Guardar temas a tu cuenta para accederlo más rápido"
					    v-if="!savedTopics.length">
						<md-progress-spinner md-mode="indeterminate"
						    v-if="loading"></md-progress-spinner>
					</md-empty-state>

					<div class="topicCards--wrapper"
					    v-else>
						<TopicCard v-for="topicID in savedTopics"
						    :key="topicID"
						    :topic="topics[topicID]"
						    :topicID="topicID"
						    :levels="levels" />
					</div>
				</div>

				<div class="md-small-hide md-layout-column md-layout-item md-size-30 md-small-size-100 md-gutter">
					<Updates class="md-elevation-1" />
				</div>
			</div>
			<md-button class="md-fab md-primary exploreButton"
			    v-on:click="$router.push('/explore')">
				<md-icon>search</md-icon>
			</md-button>
		</div>
	</div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import Updates from './Home/Updates.vue'
import TopicCard from './Home/TopicCard.vue'

import General from '@/mixins/general.js'
export default {
	name: 'Home',
	components: {
		Updates,
		TopicCard
	},
	mixins: [General],
	data () {
		return {
			checkingTopics: true
		}
	},
	computed: {
		savedTopics: function () {
			return this.user.savedTopics || [];
		},
		loading: function () {
			return this.$store.state.loading.levels | this.$store.state.loading.topics | this.checkingTopics;
		}
	},
	created () {
		this.deleteInvalidTopics(); // TODO: Move this function to somewhere else
	},
	methods: {
		deleteInvalidTopics: function () {
			let deletedTopics = [];
			this.savedTopics.forEach((topicID, i) => {
				if (!this.$store.state.topics.hasOwnProperty(topicID)) {
					deletedTopics.push(topicID);
				};
			});

			let deletedTopicsLength = deletedTopics.length;

			if (!deletedTopicsLength) {
				this.checkingTopics = false;
				console.log(`Invalid topic checking finished, ${deletedTopics.length} topics were deleted`);
				return;
			};

			deletedTopics.forEach((topicID, i) => {
				this.removeTopic(topicID).then(() => {
					if (i == deletedTopicsLength - 1) {
						this.checkingTopics = false;
						console.log(`Invalid topic checking finished, ${deletedTopics.length} topics were deleted`);
					}
				});
			})
		}
	}
}
</script>
<style>
body {
	background: #f4f7f6 !important;
}
</style>

<style lang="scss" scoped>
.homepage {
	margin: 2em auto;
}

.exploreButton {
	position: fixed;
	bottom: 20px;
	right: 20px;
}
</style>
