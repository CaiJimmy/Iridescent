<template>
    <div class="userProfile">
        <md-progress-bar v-if="loading.user"
            class="md-primary"
            md-mode="indeterminate"
            :md-diameter="30"
            :md-stroke="3"></md-progress-bar>
        <div v-else>
            <div v-if="notFound"
                class="notFound container">
                <md-card>
                    <md-card-header>
                        <div class="md-title">Usuario no encontrado</div>
                    </md-card-header>

                    <md-card-content>
                        Comprueba de nuevo el link.
                    </md-card-content>

                    <md-card-actions>
                        <md-button class="md-raised md-primary"
                            v-on:click="$router.push('/')">Back to home</md-button>
                    </md-card-actions>
                </md-card>
            </div>
            <div v-else>
                <header class="userProfile--header md-elevation-1">
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

                <div v-else>
                    <QuestionList :user="user"
                        :embed="embed"
                        :topicID="topicID" />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import QuestionList from './QuestionList.vue'

export default {
    props: ['userID', 'embed', 'topicID'],
    components: {
        QuestionList
    },
    metaInfo () {
        if (!this.embed) {
            return {
                title: this.user.displayName || 'Perfil'
            }
        }
    },
    data () {
        return {
            user: {
                displayName: null
            },
            loading: {
                user: true
            },
            notFound: false
        }
    },
    watch: {
        userID: function (id) {  /// When topic ID changes, re-render page
            if (this.userID) {
                this.loading = {
                    user: true
                };
                this.notFound = false;
                this.init();
            }
        }
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            if (this.$store.state.users.hasOwnProperty(this.userID)) {
                this.user = this.$store.state.users[this.userID];
                this.loading.user = false;
            }
            else {
                firebase.firestore().collection('users').doc(this.userID).get().then((snapshot) => {
                    if (snapshot.exists) {
                        this.user = snapshot.data();
                        this.user.uid = this.userID;
                        this.$store.commit('addUser', this.user);
                        this.loading.user = false;
                    }
                    else {
                        this.notFound = true;
                        this.loading.user = false;
                    }
                });
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.userProfile--header {
	background: var(--md-theme-default-primary);
	padding: 20px 0;

	.container {
		display: flex;
		@media only screen and (max-width: 944px) {
			flex-direction: column;
			text-align: center;
		}
	}
	img {
		border-radius: 100%;
		height: 100px;
		width: 100px;
		flex-basis: 100px;
	}
	.userProfile--meta {
		display: flex;
		flex-direction: column;
		justify-content: center;

		h1 {
			color: #fff;
			font-weight: lighter;
			margin-bottom: 0;
            line-height: 1;
		}

		h2 {
			color: #fff;
			font-size: 15px;
			font-weight: lighter;
		}
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
</style>
