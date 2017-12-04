<template>
	<div id="app">
		<md-progress-bar class="md-accent"
		    md-mode="indeterminate"
		    v-if="!firebaseReady || $store.state.loading.user"></md-progress-bar>
		<div v-else>
			<md-toolbar class="md-primary navBar"
			    :md-elevation="toolbarElevation"
			    v-if="loggedIn && !$route.meta.hideNav">

				<md-button class="md-icon-button"
				    @click="toggleMenu"
				    v-if="!menuVisible">
					<md-icon>menu</md-icon>
				</md-button>

				<div v-if="$route.path == '/'">
					<img class="siteLogo"
					    src="/static/android-chrome-192x192.png" />
					<span class="md-title">Elysian</span>
				</div>
				<span v-else-if="!$route.meta.hideToolbarTitle"
				    class="md-title">{{ $meta().refresh().titleChunk }}</span>
			</md-toolbar>

			<md-drawer :md-active.sync="menuVisible"
			    v-if="loggedIn && !$route.meta.hideNav && !$store.state.loading.user && !$store.state.loading.topics">
				<md-list>
					<md-list-item v-on:click="$router.push('/')">
						<md-icon>home</md-icon>
						<span class="md-list-item-text">Inicio</span>
					</md-list-item>

					<md-list-item v-on:click="$router.push('/settings/topics')"
					    v-if="isAdmin">
						<md-icon>settings</md-icon>
						<span class="md-list-item-text">Temas</span>
					</md-list-item>

					<md-list-item md-expand>
						<md-avatar>
							<img :src="user.photoURL"
							    :alt="user.displayName">
						</md-avatar>
						<span class="md-list-item-text">{{ user.displayName }}</span>

						<md-list slot="md-expand">
							<md-list-item>
								<md-icon>verified_user</md-icon>
								<span class="md-list-item-text">Role: {{ userRole }}</span>
							</md-list-item>
							<md-list-item v-on:click="logOut()">
								<md-icon>exit_to_app</md-icon>
								<span class="md-list-item-text">Cerrar sesión</span>
							</md-list-item>
						</md-list>
					</md-list-item>
				</md-list>
				<md-list v-if="savedTopics.length"
				    class="savedTopics--drawer">
					<md-subheader>Temas Guardados</md-subheader>

					<md-list-item v-for="topicID in user.savedTopics"
					    v-on:click="$router.push('/t/' + topicID)"
					    :key="topicID">
						<md-avatar v-if="topics[topicID]"
						    class="md-avatar-icon"
						    :style="{ background: `rgb(${topics[topicID].color.join(', ')})`}">
							{{ topics[topicID].name.slice(0, 1) }}
						</md-avatar>
						<span v-if="topics[topicID]"
						    class="md-list-item-text">{{ topics[topicID].name }}</span>
					</md-list-item>
				</md-list>

			</md-drawer>

			<router-view />

			<md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>
		</div>
	</div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import Auth from '@/mixins/auth.js';
import General from '@/mixins/general.js';
export default {
	name: "app",
	metaInfo: {
		title: 'Inicio',
		titleTemplate: '%s | Elysian'
	},
	mixins: [Auth, General],
	data () {
		return {
			snackbar: {
				display: false,
				message: null
			},
			firebaseReady: false,
			loggedIn: false,
			menuVisible: false
		}
	},
	created () {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				this.validAccountCheck().then((validAccount) => {  /// Check if user has a valid email account

					if (validAccount) {
						this.redirect();
						this.$store.dispatch('initApp'); /// Start down
					}
					else {
						this.snackbar.message = 'No es una cuenta válida';
						this.snackbar.display = true;
						this.logOut();
					};

				}).then(() => {
					this.roleCheck().then((isAdmin) => {
						this.$store.commit('isAdmin', isAdmin);
					});
				})

				this.loggedIn = true;
			}
			else {
				this.loggedIn = false;
			}
			this.firebaseReady = true;
			console.log('Firebase Auth Initialized');
		});
	},
	computed: {
		toolbarElevation(){
			if(this.$route.meta.hasOwnProperty('toolbarElevation')){   /// Have to do this because 0 == false
				return this.$route.meta.toolbarElevation;
			}
			else{
				return 1;
			};
		},
		isAdmin: function () {
			return this.$store.state.isAdmin;
		},
		savedTopics: function () {
			return this.$store.state.user.savedTopics || [];
		},
		userRole: function () {
			if (this.isAdmin) {
				return 'Admin'
			}
			else {
				return 'Alumno'
			}
		}
	},
	watch: {
		"$route.fullPath": function () {
			this.menuVisible = false;
		},
		"$store.state.loading.role": function () {
			if (this.$route.meta.isAdmin && !this.isAdmin && !this.$store.state.loading.role) {
				this.$router.push('/403');
			}
		}
	},
	methods: {
		toggleMenu () {
			this.menuVisible = !this.menuVisible
		},
		logOut: function () {
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
		redirect: function () {
			if (this.$route.query.go) {
				this.$router.replace({
					path: this.$route.query.go
				});
			}
		}
	}
};
</script>
<style lang="scss">
@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme("default", (
  primary: md-get-palette-color(teal, A700), 
  accent: md-get-palette-color(pink, 500) 
));

@import "~vue-material/dist/theme/all"; // Apply the theme
.container {
	max-width: 850px;
	padding: 0 15px;
	margin: 0 auto;
	&.extend {
		max-width: 1200px;
	}
	&.compact {
		max-width: 650px;
	}
}

.md-drawer {
	width: 230px !important;
	max-width: calc(100vw - 125px) !important;
	position: fixed !important;
}

.md-fab {
	z-index: 2;
}

#app {
	height: 100%;
}

@media only screen and (min-width: 500px) {
	.navBar {
		position: sticky !important;
		top: 0 !important;
		z-index: 3 !important;
	}
}

.siteLogo {
	width: 40px;
	height: 40px;

	& + .md-title {
		vertical-align: middle;
	}
}

.notFound {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate3d(-50%, -50%, 0);
	max-width: 400px;
	width: 100%;

	.md-card {
		padding: 15px;
	}
}
.mainContent {
	margin: 2em auto;
}
</style>
