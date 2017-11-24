<template>
    <div class="container extend">
        <div class="md-layout-row md-layout-column-small md-gutter">
            <div class="md-layout-column md-flex-large-25" v-if="!loading.userQuestions">
                <md-card v-if="$parent.topic.questionCount">
                    <md-progress-bar md-mode="determinate" :md-value="question_bar"></md-progress-bar>
                    <md-card-header>
                        <div class="md-subhead">Preparar el examen</div>
                    </md-card-header>
                    <md-card-content>Para este tema, necesitas enviar {{ $parent.topic.questionCount }} preguntas, llevas {{ userQuestions.length }}</md-card-content>
                </md-card>
            </div>

            <div class="md-layout-column md-flex-large-75 md-gutter" v-if="!loading.questions">
                <div v-if="questions.length">
                    <md-card v-for="(item, index) in questions" :key="item['.key']" class="questionCard">
                        <md-card-header>
                            <div v-if="users.hasOwnProperty(item.author)">
                                <md-avatar>
                                    <img :src="users[item.author].photoURL" :alt="users[item.author].displayName">
                                </md-avatar>
                                <div class="md-title">{{ users[item.author].displayName }}</div>
                                <div class="md-subhead">
                                    <span>
                                        <timeago :auto-update="60" :since="item.date"></timeago>
                                        <md-tooltip md-direction="bottom">{{ toDate(item.date) }}</md-tooltip>
                                    </span>
                                </div>
                            </div>
                            <md-progress-spinner :md-diameter="30" :md-stroke="3" md-mode="indeterminate" v-else></md-progress-spinner>
                        </md-card-header>
                        <md-card-content>
                            {{ item.title }}
                            <md-list>
                                <md-list-item v-for="(value, letter, index) in item.answers" v-bind:key="index">
                                    <div class="md-list-item-text">
                                        {{letter.toUpperCase()}}. {{value}}
                                    </div>
                                    <md-button v-if="item.correctAnswer == letter" class="md-icon-button md-list-action">
                                        <md-icon class="md-primary">star</md-icon>
                                        <md-tooltip md-direction="bottom">Respuesta Correcta</md-tooltip>
                                    </md-button>
                                    <md-divider v-if="letter !== 'd'"></md-divider>
                                </md-list-item>
                            </md-list>
                        </md-card-content>
                    </md-card>
                </div>
                <md-empty-state v-else md-icon="question_answer" md-label="Crear preguntas" md-description="Parece ser que no hay ninguna pregunta en este tema">
                </md-empty-state>
            </div>
        </div>
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import moment from 'moment';

export default {
    name: 'TopicPage',

    data: () => ({
        questions: [],
        userQuestions: [],

        loading: {
            questions: true,
            userQuestions: true
        },

        ref: {
            questions: null,
            userQuestions: null
        },
        showDialog: false
    }),
    computed: {
        question_bar: function () {
            if (this.$parent.topic.questionCount) {
                let current = this.userQuestions.length,
                    total = this.$parent.topic.questionCount;

                return current / total * 100
            }
        },
        users: function () {
            return this.$store.state.users;
        }
    },
    created: function () {
        this.ref.questions = firebase.firestore().collection('questions').where('topic', '==', this.$parent.ref.topic);
        this.$bind('questions', this.ref.questions).then(() => {
            this.loading.questions = false;
            this.fetchUserDatas();
        })

        this.ref.userQuestions = this.ref.questions.where('author', '==', this.$parent.user.uid);
        this.$bind('userQuestions', this.ref.userQuestions).then(() => {
            this.loading.userQuestions = false;
        });
    },
    methods: {
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
        toDate: function (date) {
            return moment(date).format("MM/DD/YYYY HH:mm")
        }
    }
}
</script>
<style scoped>
form {
  overflow-y: auto;
}

.questionCard {
  margin-bottom: 16px;
}
@media (min-width: 850px) {
  .md-dialog {
    width: 500px;
    max-height: 90%;
  }
}
</style>
