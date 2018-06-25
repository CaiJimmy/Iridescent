<template>
    <md-card v-if="!loading && topicData.questionCount">
        <md-progress-bar md-mode="determinate"
            :md-value="question_bar"></md-progress-bar>
        <md-card-header>
            <div class="md-subhead">Preparar el examen</div>
        </md-card-header>
        <md-card-content>Para este tema, necesitas enviar {{ topicData.questionCount }} preguntas, llevas {{ userQuestions.length }}</md-card-content>
    </md-card>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

export default {
    name: 'UserStat',
    props: ['topicData'],
    data () {
        return {
            userQuestions: [],
            userQuestionsRef: null,
            loading: true,
            question_bar: 0
        }
    },
    created () {
        const topicID = this.topicData.id;
        this.userQuestionsRef = firebase.firestore().collection('questions')
            .where('topic', '==', topicID)
            .where('author', '==', firebase.auth().currentUser.uid);

        this.$bind('userQuestions', this.userQuestionsRef).then(() => {
            this.loading = false;
        });
    },
    watch: {
        userQuestions () {
            this.renderQuestionProgressBar();
        },
        "topic.questionCount": function () {
            this.renderQuestionProgressBar();
        },
    },
    methods: {
        renderQuestionProgressBar () {
            if (this.topicData.questionCount) {
                let current = this.userQuestions.length,
                    total = this.topicData.questionCount;

                this.question_bar = current / total * 100
            }
        },
    }
}
</script>
