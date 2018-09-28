<template>
	<div>
		<md-progress-bar class="md-primary"
		    md-mode="indeterminate"
		    v-if="loading.login"></md-progress-bar>
		<div id="loginScreen">
			<md-empty-state md-rounded
			    class="md-primary"
			    md-icon="account_circle"
			    md-label="Bienvenidos"
			    md-description="Por favor, inicie la sesión con la cuenta institucional.">
				<md-button class="md-primary md-raised"
				    v-on:click="login()"
				    :disabled="loading.login">Comenzar</md-button>
			</md-empty-state>
		</div>
		<md-snackbar :md-duration="10000"
		    :md-active.sync="snackbar.display"
		    md-position="left">{{ snackbar.message }}</md-snackbar>
	</div>
</template>

<script>
import auth from '@/firebase/auth';
import { validAccountCheck } from '@/methods/auth.js';

export default {
	name: "Login",
	metaInfo: {
		title: 'Iniciar Sesión'
	},
	data: function () {
		return {
			loading: {
				login: false
			},
			snackbar: {
				display: false,
				message: null
			}
		};
	},
	created: function () {
		if (auth.currentUser) { // Already Logged In
			/*
				Start downloading datas (levels and topics)
			*/
			this.$store.dispatch('initApp');

			/*
				If the user is logged in, he/she must have passed domain validation
				So it can be ignored.
			*/
			this.$store.commit('ready', 'userValidation');   

			this.redirect();
		}
	},
	methods: {
		redirect: function () {
			this.$router.replace({
				path: this.$route.query.go || '/'
			});
		},
		login: function () {
			this.loading.login = true;

			let provider = new firebase.auth.GoogleAuthProvider();
			auth.signInWithPopup(provider).then(result => {

				validAccountCheck().then((validAccount) => {  /// Check if user has a valid email account

					if (validAccount == true) {
						this.redirect();
						this.$store.dispatch('initApp');
						this.$store.commit('ready', 'userValidation');
					}
					else {
						this.snackbar.message = 'No es una cuenta válida';
						this.snackbar.display = true;
						auth.signOut();
					}

				}).then(() => {
					this.loading.login = false;
				});

			}).catch(error => {
				let errorCode = error.code,
					errorMessage = error.message;

				console.error(error);

				this.snackbar.message = errorMessage; /// Display error message using snackbar
				this.snackbar.display = true;

				this.loading.login = false;
			});
		}
	}
};
</script>
<style>
.md-icon.md-empty-state-icon {
  width: 160px !important;
  min-width: 160px !important;
  height: 160px !important;
  font-size: 160px !important;
  margin: 0 !important;
}
</style>
<style scoped lang="scss">
#loginScreen {
  min-height: 100vh;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
}
</style>
