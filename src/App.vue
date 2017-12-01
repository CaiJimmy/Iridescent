<template>
	<div id="app"
	    v-if="firebaseReady">
		<md-toolbar class="md-primary"
		    md-elevation="0"
		    v-if="user && !$route.meta.hideNav">
			<md-button class="md-icon-button"
			    v-if="$route.path !== '/'"
			    v-on:click="$router.push('/')">
				<md-icon>keyboard_arrow_left</md-icon>
			</md-button>
			<h3 class="md-title"
			    style="flex:1">{{ $meta().refresh().titleChunk }}</h3>

			<md-menu md-direction="bottom-start">
				<md-avatar md-menu-trigger>
					<img :src="user.photoURL"
					    :alt="user.displayName">
				</md-avatar>
				<md-menu-content>
					<md-menu-item v-on:click="logOut()">
						<md-icon>exit_to_app</md-icon>
						<span>Cerrar sesión</span>
					</md-menu-item>
				</md-menu-content>
			</md-menu>
		</md-toolbar>

		<router-view />

		<md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>
	</div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import Auth from '@/mixins/auth.js'
export default {
	name: "app",
	metaInfo: {
		title: 'Inicio',
		titleTemplate: '%s | Elysian'
	},
	mixins: [Auth],
	data () {
		return {
			snackbar: {
				display: false,
				message: null
			},
			firebaseReady: false,
			user: {}
		}
	},
	created () {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				this.user = user;
				this.roleCheck(user).then((validAccount) => {  /// Check if user has a valid email account

					if (validAccount) {
						this.redirect();
						this.$store.dispatch('initApp') /// Start down
					}
					else {
						this.snackbar.message = 'No es una cuenta válida';
						this.snackbar.display = true;
						this.logOut();
					}
				})
			};
			this.firebaseReady = true;
			console.log('Firebase Auth Initialized');
		});
	},
	methods: {
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
			this.$router.replace({
				path: this.$route.query.go || '/'
			});
		}
	}
};
</script>
<style lang="scss">
@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme("default", (
  primary: #1de9b6, 
  accent: #00bfa5 
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
</style>
