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
                <md-tabs class="md-primary"
                    md-alignment="centered"
                    md-sync-route>
                    <md-tab id="tab-home"
                        md-label="Preguntas"
                        :to="'/t/' + topicID + '/'"></md-tab>
                    <md-tab id="tab-pages"
                        md-label="Examinar"
                        :to="'/t/' + topicID + '/exam/'"></md-tab>
                </md-tabs>
                <router-view :topicID="topicID"
                    class="mainContent"
                    :key="$route.name + (topicID|| '')"></router-view>
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
    props: ['topicID'],
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
            question_per_page: 20, /// Number of questions per page
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
            userQuestions: null,
            questionsFirst: null,
            questionsNext: null
        },

        snackbar: {
            display: false,
            message: null
        },

        question_bar: 0
    }),
    computed: {
        topic () {
            if (!this.$store.state.loading.topics && this.$store.state.topics.hasOwnProperty(this.topicID)) {  /// If not ready yet, then wait till it's ready, but return .name to avoid error
                return this.$store.state.topics[this.topicID]
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
        userQuestions: function () {
            this.renderQuestionProgressBar();
        },
        "topic.questionCount": function () {
            this.renderQuestionProgressBar();
        },
        topicID: function (id) {  /// When topic ID changes, re-render page
            if (this.topicID) {
                this.loading = {
                    metadata: true,
                    questions: true,
                    userQuestions: true
                };

                this.paging.current = 1;
                this.paging.end = false;

                this.notFound = false;
                if (!this.$store.state.loading.topics) {
                    this.bindTopic()
                }
            }
        }
    },
    created: function () {
        this.ref.topic = firebase.firestore().collection('topics').doc(this.topicID);
        this.ref.questions = firebase.firestore().collection('questions').where('topic', '==', this.ref.topic.id).orderBy("date", 'desc');

        if (!this.$store.state.loading.topics) {
            this.bindTopic()
        }
    },
    methods: {
        loadMore () {
            if (this.paging.end) {
                return;
            };

            this.paging.loading = true;
            this.handleQuestions(this.ref.questionsNext).then((documentSnapshots) => {
                this.paging.loading = false;

                if (documentSnapshots.empty) {
                    this.paging.end = true;
                }
            })
        },
        handleQuestions (ref) {
            return new Promise((resolve, reject) => {
                ref.onSnapshot((documentSnapshots) => {
                    if (documentSnapshots.empty) {
                        this.paging.end = true;
                        resolve(documentSnapshots);
                    };

                    documentSnapshots.docChanges.forEach((change) => {
                        let oldQuestionIndex = this.questions.findIndex((item) => {
                            return item.id == change.doc.id;
                        });
                        let questionData = change.doc.data();
                        questionData.id = change.doc.id;

                        if (oldQuestionIndex == -1) {
                            if (change.newIndex == 0 && change.oldIndex == -1) {   /// == New question added by user => prepend to array
                                this.questions.unshift(questionData);
                            }
                            else {   /// Rest of questions are ordered by date, so there's no need to do so
                                this.questions.push(questionData);
                            }
                        }
                        else {
                            if (change.type === "removed") {
                                this.questions.splice(oldQuestionIndex, 1);
                            }
                            else {
                                this.questions[oldQuestionIndex] = questionData;
                            }
                        }
                    });

                    var lastVisible = documentSnapshots.docChanges[documentSnapshots.docChanges.length - 1];  /// Build query for next page
                    
                    if(!lastVisible){
                        return;
                    };
                    
                    this.ref.questionsNext = this.ref.questions
                        .startAfter(lastVisible.doc)
                        .limit(this.paging.question_per_page);

                    fetchUserDatas(documentSnapshots)
                    resolve(documentSnapshots);
                });
            });
        },
        renderQuestionProgressBar () {
            if (this.topic.questionCount) {
                let current = this.userQuestions.length,
                    total = this.topic.questionCount;

                this.question_bar = current / total * 100
            }
        },
        bindTopic () {
            if (this.$store.state.topics.hasOwnProperty(this.topicID)) {
                this.loading.metadata = false;
                this.bindQuestions();
            }
            else {
                this.loading.metadata = false;
                this.notFound = true;
            }
        },
        bindQuestions () {
            this.ref.questionsFirst = this.ref.questions.limit(this.paging.question_per_page);

            this.handleQuestions(this.ref.questionsFirst).then(() => {
                this.loading.questions = false;
            });

            this.ref.userQuestions = this.ref.questions.where('author', '==', firebase.auth().currentUser.uid);
            this.$bind('userQuestions', this.ref.userQuestions).then(() => {
                this.loading.userQuestions = false;
            });

            if (this.topic.color) {
                this.$store.commit('setPrimaryColor', this.topic.color);
            }
        }
    }
}
</script>