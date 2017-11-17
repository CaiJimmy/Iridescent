<template>
	<div id="app" v-if="$root.firebaseReady">
		<md-toolbar class="md-primary md-dense md-transparent" md-elevation="0" v-if="loggedIn">
			<h3 class="md-title" style="flex:1">{{ $route.name }}</h3>
			<md-menu md-direction="bottom-start">
				<md-avatar md-menu-trigger>
					<img :src="user.photoURL" :alt="user.displayName">
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
	</div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

export default {
	name: "app",
	data () {
		return {
			user: {
				photoURL: null,
				name: null,
				email: null
			},
			loggedIn: false
		}
	},
	created: function () {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				this.user = user;
				this.loggedIn = true;
				this.$router.replace({
					path: this.$route.query.go || '/'
				});
			}
			else {
				this.loggedIn = false;
			}
		});
	},
	methods: {
		logOut: function () {
			firebase.auth().signOut();
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
}
</style>
