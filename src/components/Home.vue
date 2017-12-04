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

					<div class="savedTopics--wrapper"
					    v-else>
						<div class="savedTopics--grid"
						    v-for="topicID in savedTopics"
						    :key="topicID">
							<md-menu md-direction="top-start"
							    class="removeTopic">
								<md-button md-menu-trigger
								    class="md-icon-button">
									<md-icon>more_vert</md-icon>
								</md-button>
								<md-menu-content>
									<md-menu-item v-on:click="removeTopic(topicID)">Quitar</md-menu-item>
								</md-menu-content>
							</md-menu>

							<router-link :to="'/t/' + topicID">
								<div class="savedTopic--image"
								    :style="{ background: `url(${topics[topicID].image})`}"></div>
								<div class="savedTopic--filter"
								    :style="{background: `rgb(${topics[topicID].color.join(',')})`}"></div>
								<div class="savedTopic--meta">
									<h1>{{ topics[topicID].name }}</h1>
									<h2>{{ levels[topics[topicID].level].name }}</h2>
								</div>
							</router-link>
						</div>
					</div>
				</div>

				<div class="md-small-hide md-layout-column md-layout-item md-size-30 md-small-size-100 md-gutter">
					<Updates class="md-elevation-1" />
				</div>
			</div>
			<md-button class="md-fab md-primary exploreButton"
			    v-on:click="showDialog.topics = true">
				<md-icon>add</md-icon>
			</md-button>
		</div>
		<md-dialog :md-active.sync="showDialog.topics"
		    :md-fullscreen="false">
			<Explore />
		</md-dialog>

	</div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import Explore from './Home/Explore.vue';
import Updates from './Home/Updates.vue'
import Methods from './Home/Methods.js'

import General from '@/mixins/general.js'
export default {
	name: 'Home',
	components: {
		Explore,
		Updates
	},
	mixins: [General, Methods],
	data () {
		return {
			showDialog: {
				topics: false
			},
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

.savedTopics--wrapper {
	overflow: hidden;
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-start;
	flex-direction: column;
	.savedTopics--grid {
		flex-basis: auto;
		position: relative;
		height: auto;
		box-shadow: 8px 14px 38px rgba(39, 44, 49, 0.06),
			1px 3px 8px rgba(39, 44, 49, 0.03);
		margin-bottom: 2em;
		border-radius: 4px;
		overflow: hidden;
		padding: 20px 10px;
		transition: all 0.5s ease;

		&:hover {
			box-shadow: 0 0 1px rgba(39, 44, 49, 0.1),
				0 3px 16px rgba(39, 44, 49, 0.07);
			transition: all 0.3s ease;
			transform: translate3D(0, -1px, 0);
		}
		a:hover {
			text-decoration: none;
		}

		.savedTopic--image {
			height: 100%;
			width: 100%;
			position: absolute;
			top: 0;
			left: 0;
			background-size: cover !important;
			background-position: center center !important;
			opacity: 0.7;
			-webkit-transition: opacity 0.35s;
			transition: opacity 0.35s;
		}

		.savedTopic--meta {
			position: relative;
			z-index: 2;
			color: #fff;
			text-decoration: none !important;
			display: flex;
			height: 100%;
			justify-content: center;
			flex-direction: column;
			padding: 20px 25px;
			line-height: 1.5;

			h1 {
				font-size: 20px;
				margin: 0;
				font-weight: lighter;
			}

			h2 {
				margin-bottom: 0;
				font-weight: lighter;
				font-size: 15px;
			}
		}

		.savedTopic--filter {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			opacity: 0.6;
			background: #000;
		}

		.removeTopic {
			opacity: 0;
			transition: all 0.5s ease;
			position: absolute;
			right: 0;
			top: 0;
		}

		&:hover {
			.removeTopic {
				opacity: 1;
			}
		}
	}
}
</style>
