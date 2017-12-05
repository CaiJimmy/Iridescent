<template>
	<div class="explore">
		<md-progress-bar class="md-primary"
		    md-mode="indeterminate"
		    v-if="loading"></md-progress-bar>

		<div class="container extend"
		    v-else>
			<!-- Left Side Start -->
			<div class="md-layout md-gutter md-layout-column-xsmall md-alignment mainGrid">
				<div class="leftSide md-layout-item md-size-70 md-small-size-100 md-gutter">
					<div v-for="(level, index) in arrayLevels"
					    :key="level.id">
						<div v-if="getTopicsByLevel(level.id).length"
						    class="levelWrapper md-layout md-gutter md-layout-column-xsmall md-alignment">
							<!-- Hide empty levels -->
							<div class="md-layout-column md-layout-item md-size-15 md-small-size-100">
								<h3 class="levelName">{{ level.name }}</h3>
							</div>
							<div class="topicCards--wrapper md-layout-column md-layout-item md-size-85 md-small-size-100 md-gutter">
								<div class="md-layout-item md-size-50 md-small-size-100 md-gutter"
								    v-for="(topic, index) in getTopicsByLevel(level.id)"
								    :key="topic.id">
									<TopicCard :topic="topic"
									    :topicID="topic.id"
									    :action="'save'" />
								</div>
							</div>
						</div>
					</div>
				</div>
				<!-- Left Side End -->
				<!-- Right Side Start -->
				<div class="rightSide md-layout-item md-size-30 md-small-size-100 md-gutter">
					<div class="userCard md-elevation-1">
						<header class="userCard--header">
							<div class="userCard--headerImage"
							    :style="headerImage"></div>
							<figure>
								<img :src="user.photoURL"
								    :alt="user.displayName">
							</figure>
						</header>
						<div class="userCard--meta">
							<h1>{{ user.displayName }}</h1>
							<h2>{{ user.email }} |
								<strong>{{ userRole }}</strong>
							</h2>
							<md-button class="md-accent"
							    v-on:click="signOut()">Cerrar sesión</md-button>
						</div>
					</div>
					<md-button v-if="isAdmin"
					    class="md-primary md-raised fullWidth"
					    v-on:click="$router.push('/settings/topics/')">Añadir Temas / Nivels</md-button>
				</div>
				<!-- Right Side End -->
			</div>
		</div>
	</div>
</template>
<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';

import TopicCard from './Home/TopicCard.vue'
import General from '@/mixins/general.js'
export default {
	name: 'Explore_Page',
	components: {
		TopicCard
	},
	metaInfo: {
		title: 'Explorar'
	},
	mixins: [General],
	computed: {
		loading: function () {
			return this.$store.state.loading.levels | this.$store.state.loading.topics;
		},
		isAdmin: function () {
			return this.$store.state.isAdmin;
		},
		userRole: function () {
			if (this.isAdmin) {
				return 'Admin'
			}
			else {
				return 'Alumno'
			}
		},
		arrayLevels () {
			let array = [];
			for (let value in this.levels) {
				let item = this.levels[value];
				item.id = value;
				array.push(item);
			};
			return array;
		},
		headerImage () {
			return {
				"background-image": "url(https://source.unsplash.com/500x400/daily?techonology)"
			}
		}
	},
	methods: {
		signOut: function () {
			firebase.auth().signOut().then(() => {
				if (!this.$route.query.go || this.$route.path !== '/login') {
					this.$router.replace({
						path: '/login',
						query: {
							go: this.$route.fullPath,
						},
					});
				}
			});
		},
	}
}
</script>
<style lang="scss" scoped>
.explore {
	.mainGrid {
		@media only screen and (max-width: 944px) {
			flex-direction: column-reverse;
		}
	}
}

.userCard {
	margin-top: 1em;
	background: #fff;

	header {
		position: relative;
		margin-bottom: 50px;
	}
	.userCard--headerImage {
		width: 100%;
		height: 150px;
		position: relative;
		overflow: hidden;
		background-size: cover !important;
		background-position: top center !important;
		background-repeat: no-repeat !important;
	}

	figure {
		margin: 0;
		height: 120px;
		width: 120px;
		position: absolute;
		bottom: -50px;
		display: block;
		left: 50%;
		transform: translateX(-50%);

		img {
			border-radius: 100%;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12),
				0 1px 2px rgba(0, 0, 0, 0.24);
			border: 2px solid #fff;
		}
	}

	.userCard--meta {
		padding: 5px 15px;
		text-align: center;

		h1,
		h2 {
			font-weight: lighter;
		}

		h1 {
			font-size: 20px;
		}
		h2 {
			color: #999;
			font-size: 15px;
		}
	}
}

.fullWidth {
	width: 100%;
	margin-left: 0;
	margin-right: 0;
}
.levelWrapper {
	&:first-child {
		margin-top: 1em;
	}
	.levelName {
		font-weight: lighter;
		color: #999;
		font-size: 20px;
	}
}

.topicCards--wrapper {
	flex-direction: row;

	.topicCards--grid {
		margin: 10px;
	}
}
</style>
