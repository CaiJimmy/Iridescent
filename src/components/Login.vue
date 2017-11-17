<template>
	<div class="login">
		<button v-on:click="login()">Login</button>
	</div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/auth";

export default {
	name: "login",
	data: function () {
		return {};
	},
	methods: {
		login: function () {
			var provider = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithPopup(provider).then(result => {
				this.loading = false;
			}).catch(error => {
				var errorCode = error.code;
				var errorMessage = error.message;
				var email = error.email;
				var credential = error.credential;
				if (errorCode === "auth/account-exists-with-different-credential") {
					alert(
						"You have already signed up with a different auth provider for that email."
					);
				} else {
					console.error(error);
				}
			});
		}
	}
};
</script>