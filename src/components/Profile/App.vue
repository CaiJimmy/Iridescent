<template>
    <div class="userProfile">
        <md-progress-bar v-if="loading.user"
            class="md-primary"
            md-mode="indeterminate"
            :md-diameter="30"
            :md-stroke="3"></md-progress-bar>
        <div v-else>
            <header class="userProfile--header">
                <div class="container">
                    <figure>
                        <img :src="user.photoURL"
                            :alt="user.displayName">
                    </figure>
                    <div class="userProfile--meta">
                        <h1>{{ user.displayName }}</h1>
                        <h2>{{ user.email }}</h2>
                    </div>
                </div>
            </header>

            <md-progress-bar v-if="$store.state.loading.topics || $store.state.loading.levels"
                class="md-primary"
                md-mode="indeterminate"
                :md-diameter="30"
                :md-stroke="3"></md-progress-bar>
            <router-view v-else
                :user="user" />
        </div>
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";

export default {
    props: ['userID'],
    metaInfo () {
        return {
            title: this.user.displayName || 'Perfil'
        }
    },
    data () {
        return {
            user: {
                displayName: null
            },
            loading: {
                user: true
            }
        }
    },
    created () {
        if (this.$store.state.users.hasOwnProperty(this.userID)) {
            this.user = this.$store.state.users[this.userID];
            this.loading.user = false;
        }
        else {
            this.$bind('user', firebase.firestore().collection('users').doc(this.userID)).then(() => {
                this.user.uid = this.userID;
                this.$store.commit('addUser', this.user);
                this.loading.user = false;
            });
        }
    },
}
</script>
<style lang="scss" scoped>
.userProfile--header {
	background: var(--md-theme-default-primary);
	padding: 20px 0;

	.container {
		display: flex;
	}
	img {
		border-radius: 100%;
		height: 100px;
		width: 100px;
	}
	.userProfile--meta {
		display: flex;
		flex-direction: column;
		justify-content: center;

		h1 {
			color: #fff;
			font-weight: lighter;
			margin-bottom: 0;
		}

		h2 {
			color: #fff;
			font-size: 15px;
			font-weight: lighter;
		}
	}
}
</style>
