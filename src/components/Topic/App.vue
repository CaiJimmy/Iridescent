<template>
    <div>
        <md-progress-bar v-if="loading.metadata" class="md-accent" md-mode="indeterminate" :md-diameter="30" :md-stroke="3"></md-progress-bar>

        <div v-if="!loading.metadata">
            <md-tabs md-sync-route class="md-primary" md-alignment="centered">
                <md-tab id="tab-home" md-label="Inicio" :to="'/t/' + $route.params.id + '/'"></md-tab>
                <md-tab id="tab-posts" md-label="Enviar" :to="'/t/' + $route.params.id + '/send'"></md-tab>
            </md-tabs>

            <router-view class="mainContent"></router-view>
        </div>

        <div class="questionsList container">
            <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>
        </div>
    </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import General from '@/mixins/general.js'

export default {
    name: 'TopicPage',
    mixins: [General],
    metaInfo () {
        return {
            title: this.topic.name
        }
    },
    data: () => ({
        topic: {
            name: 'Tema'
        },

        questions: [],

        paging: {
            current: 1,/// Current Page
            question_per_page: 5, /// Number of questions per page
            clone: null,  /// Workaround: https://github.com/vuejs/vuefire/issues/83#issuecomment-338427854
            end: false,
            loading: false
        },

        loading: {
            metadata: true,
            questions: true,
            userQuestions: true
        },

        ref: {
            topic: null,
            questions: null,
            userQuestions: null
        },

        snackbar: {
            display: false,
            message: null
        }
    }),
    computed: {
        headerImage: function () {
            if (this.topic.image) {
                return this.topic.image;
            }
            else {
                return 'https://source.unsplash.com/1200x500/?technology';
            }
        }
    },
    watch: {
        questions: function () {
            this.fetchUserDatas();
        }
    },
    created: function () {
        this.ref.topic = firebase.firestore().collection('topics').doc(this.$route.params.id);
        this.ref.topic.get().then((data) => {
            if (data.exists) {
                this.$bind('topic', this.ref.topic).then(() => {
                    this.loading.metadata = false;
                    this.ref.questions = firebase.firestore().collection('questions').where('topic', '==', this.ref.topic).orderBy("date", 'desc');
                    this.$bind('questions', this.ref.questions.limit(this.paging.question_per_page)).then(() => {
                        this.loading.questions = false;
                    })
                    this.ref.userQuestions = this.ref.questions.where('author', '==', this.user.uid);
                    this.$bind('userQuestions', this.ref.userQuestions).then(() => {
                        this.loading.userQuestions = false;
                    });
                })
            }
            else {
                this.$router.replace('/');
            }
        });
    },
    methods: {
        loadMore () {
            /// TODO: https://github.com/vuejs/vuefire/issues/83
            this.paging.clone = this.questions;

            let oldCount = this.paging.clone.length;

            this.paging.loading = true;
            this.$bind('questions', this.ref.questions.limit((this.paging.current + 1) * this.paging.question_per_page)).then(() => {
                this.paging.clone = null
                this.paging.current += 1;
                this.paging.loading = false;

                if (oldCount == this.questions.length) {  /// If new data is same as old one, then there's no more data to be loaded
                    this.paging.end = true;
                    this.snackbar.message = 'Todas las preguntas han sido cargadas'
                    this.snackbar.display = true;
                };
            })
        },
        fetchUserDatas: function () {
            this.questions.forEach((question) => {
                if (!this.users.hasOwnProperty(question.author)) {
                    firebase.firestore().collection('users').doc(question.author).get().then(snapshot => {
                        let userData = snapshot.data();
                        userData.id = question.author;
                        this.$store.commit('addUser', userData);
                    })
                }
            })
        },
    }
}
</script>

<style lang="scss" scoped>
.topicHeader {
  height: 50vh;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
  .topicHeader--image {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }
  .topicHeader--meta {
    z-index: 2;
    position: relative;
    padding: 0 25px;

    h1 {
      color: #fff;
      font-size: 3em;
    }

    h2 {
      color: #e1e1e1;
      font-size: 1.5em;
      line-height: 1.5;
      font-weight: lighter;
    }
  }
}

.mainContent {
  margin: 2em auto;
}
</style>
