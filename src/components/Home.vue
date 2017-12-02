<template>
	<div>
		<md-progress-bar class="md-primary"
		    md-mode="indeterminate"
		    v-if="loading"></md-progress-bar>

		<div class="hompage"
		    v-else>
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
			this.savedTopics.forEach((topicID) => {
				if (!this.$store.state.topics.hasOwnProperty(topicID)) {
					this.removeTopic(topicID);
				}
			});
			this.checkingTopics = false
		}
	}
}
</script>
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

	&:after {
		content: "";
		flex-grow: 1;
		flex-basis: 1000000px;
	}
	.savedTopics--grid {
		flex-grow: 1;
		flex-basis: auto;
		width: 25%;
		max-width: 25%;
		position: relative;
		height: auto;

		&:before {
			/// Make it square
			content: "";
			float: left;
			padding-top: 100%;
		}

		@media only screen and (max-width: 500px) {
			flex: 0 1 100%;
			max-width: 100%;
		}

		@media only screen and (min-width: 500px) and (max-width: 1024px) {
			flex: 0 1 50%;
			max-width: 50%;
		}

		&:hover {
			.savedTopic--image {
				opacity: 0.4;
			}
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
			text-align: center;
			color: #fff;
			text-decoration: none !important;
			display: flex;
			height: 100%;
			justify-content: center;
			align-items: center;
			flex-direction: column;

			line-height: 1.5;
			h1 {
				font-size: 2em;
				margin: 0;
				font-weight: lighter;
				transition: transform 0.35s;
				transform: translate3d(0, 25px, 0);
			}

			h2 {
				padding: 20px 2.5em;
				margin-bottom: 0;
				opacity: 0;

				font-weight: lighter;
				transition: opacity 0.35s, transform 0.35s;
				transform: translate3d(0, 50px, 0);
			}
			&:before {
				position: absolute;
				top: 30px;
				right: 30px;
				bottom: 30px;
				left: 30px;
				border: 2px solid #fff;
				box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.2);
				content: "";
				opacity: 0;
				-webkit-transition: opacity 0.35s, -webkit-transform 0.35s;
				transition: opacity 0.35s, transform 0.35s;
				-webkit-transform: scale3d(1.4, 1.4, 1);
				transform: scale3d(1.4, 1.4, 1);
			}
		}

		&:hover {
			.savedTopic--meta {
				h1,
				h2 {
					opacity: 1;
					-webkit-transform: translate3d(0, 0, 0);
					transform: translate3d(0, 0, 0);
				}
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
			&::before,
			&::after {
				position: absolute;
				top: 30px;
				right: 30px;
				bottom: 30px;
				left: 30px;
				content: "";
				opacity: 0;
				-webkit-transition: opacity 0.35s, -webkit-transform 0.35s;
				transition: opacity 0.35s, transform 0.35s;
			}

			&::before {
				border-top: 1px solid #fff;
				border-bottom: 1px solid #fff;
				-webkit-transform: scale(0, 1);
				transform: scale(0, 1);
			}

			&::after {
				border-right: 1px solid #fff;
				border-left: 1px solid #fff;
				-webkit-transform: scale(1, 0);
				transform: scale(1, 0);
			}
		}

		&:hover {
			.savedTopic--filter::before,
			.savedTopic--filter::after {
				opacity: 1;
				-webkit-transform: scale(1);
				transform: scale(1);
			}
		}
	}
}
</style>
