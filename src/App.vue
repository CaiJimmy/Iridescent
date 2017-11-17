<template>
	<div id="app" v-if="$root.firebaseReady">
		<md-toolbar class="md-primary md-dense md-transparent" md-elevation="0">
			<h3 class="md-title" style="flex:1">{{ $route.name }}</h3>
			<md-avatar>
				<img :src="user.photoURL" :alt="user.name">
			</md-avatar>
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
			}
		}
	},
	created: function () {
		firebase.auth().onAuthStateChanged((user) => {
			this.user = user;
		});
	}
};
</script>
<style lang="scss">
@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme("default", (
  primary: #3fffbe, 
  accent: #1a11e8 
));

@import "~vue-material/dist/theme/all"; // Apply the theme

.container {
  max-width: 850px;
  padding: 0 15px;
  margin: 0 auto;
}
</style>
