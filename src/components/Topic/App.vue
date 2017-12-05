<template>
    <div>
        <md-progress-bar v-if="loading.metadata"
            class="md-primary"
            md-mode="indeterminate"
            :md-diameter="30"
            :md-stroke="3"></md-progress-bar>

        <div v-if="!loading.metadata">
            <div v-if="notFound"
                class="notFound container">
                <md-card>
                    <md-card-header>
                        <div class="md-title">Topic Not Found</div>
                    </md-card-header>

                    <md-card-content>
                        Look for it on Explore, or double-check your link.
                    </md-card-content>

                    <md-card-actions>
                        <md-button class="md-raised md-primary"
                            v-on:click="$router.push('/')">Back to home</md-button>
                    </md-card-actions>
                </md-card>
            </div>
            <div v-else>
                <TopicHeader :topic="topic"
                    :topicRef="ref.topic" />
                <router-view class="mainContent"
                    :key="$route.name + ($route.params.id || '')"></router-view>
            </div>
        </div>
        <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>
    </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import TopicHeader from './components/Header.vue';
import fetchUserDatas from '@/methods/fetchUserDatas.js';

export default {
    name: 'TopicPage',
    components: {
        TopicHeader
    },
    metaInfo () {
        return {
            title: this.topic.name || 'Tema'
        }
    },
    data: () => ({
        notFound: false,

        questions: [],
        userQuestions: [],

        paging: {
            current: 1,/// Current Page
            question_per_page: 20, /// Number of questions per page
            clone: null,  /// Workaround: https://github.com/vuejs/vuefire/issues/83#issuecomment-338427854
            end: false,
            loading: false,
            oldCount: 0
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
        },

        question_bar: 0
    }),
    computed: {
        paginatedQuestions: function () {
            return this.questions.slice(0, this.paging.question_per_page * this.paging.current);
        },
        topic () {
            if (!this.$store.state.loading.topics && this.$store.state.topics.hasOwnProperty(this.$route.params.id)) {  /// If not ready yet, then wait till it's ready, but return .name to avoid error
                return this.$store.state.topics[this.$route.params.id]
            }
            else {
                return {};
            };
        }
    },
    watch: {
        "$store.state.loading.topics": function () {
            if (!this.$store.state.loading.topics) {
                this.bindTopic()
            }
        },
        questions: function () {
            this.paging.end = false;
        },
        userQuestions: function () {
            this.renderQuestionProgressBar();
        },
        "topic.questionCount": function () {
            this.renderQuestionProgressBar();
        },
        paginatedQuestions: function () {
            fetchUserDatas(this.paginatedQuestions);
        },
        '$route.params.id': function (id) {  /// When topic ID changes, re-render page
            if (this.$route.params.hasOwnProperty('id')) {
                this.loading = {
                    metadata: true,
                    questions: true,
                    userQuestions: true
                };

                this.paging.current = 1;
                this.paging.end = false;

                this.notFound = false;
                this.init();
            }
        }
    },
    created: function () {
        this.ref.topic = firebase.firestore().collection('topics').doc(this.$route.params.id);
        this.ref.questions = firebase.firestore().collection('questions').where('topic', '==', this.ref.topic.id).orderBy("date", 'desc');

        if (!this.$store.state.loading.topics) {
            this.bindTopic()
        }
    },
    methods: {
        renderQuestionProgressBar () {
            if (this.topic.questionCount) {
                let current = this.userQuestions.length,
                    total = this.topic.questionCount;

                this.question_bar = current / total * 100
            }
        },
        bindTopic () {
            if (this.$store.state.topics.hasOwnProperty(this.$route.params.id)) {
                this.loading.metadata = false;
                this.bindQuestions();
            }
            else {
                this.loading.metadata = false;
                this.notFound = true;
            }
        },
        bindQuestions () {
            this.$bind('questions', this.ref.questions).then(() => {
                this.loading.questions = false;
            })
            this.ref.userQuestions = this.ref.questions.where('author', '==', firebase.auth().currentUser.uid);
            this.$bind('userQuestions', this.ref.userQuestions).then(() => {
                this.loading.userQuestions = false;
            });

            if (this.topic.color) {
                this.$store.commit('setPrimaryColor', this.topic.color);
            }
        },
        loadMore () {
            if (this.paging.end) {
                return;
            };

            if (this.paging.question_per_page * this.paging.current >= this.questions.length) {
                this.paging.end = true;
                return;
            };

            this.paging.current += 1;
        },
        loadMore_old () {   /// Real paging, without fetching all questions
            if (this.paging.loading) {
                return;
            };

            /// TODO: https://github.com/vuejs/vuefire/issues/83
            this.paging.clone = this.questions;

            this.paging.oldCount = this.paging.clone.length;

            this.paging.loading = true;
            return this.$bind('questions', this.ref.questions.limit((this.paging.current + 1) * this.paging.question_per_page)).then(() => {
                this.paging.clone = null
                this.paging.current += 1;
                this.paging.loading = false;
            }).then(() => {
                if (this.paging.oldCount == this.questions.length) {  /// If new data is same as old one, then there's no more data to be loaded
                    this.paging.end = true;
                    this.snackbar.message = 'Todas las preguntas han sido cargadas'
                    this.snackbar.display = true;
                };
            })
        }
    }
}
</script>