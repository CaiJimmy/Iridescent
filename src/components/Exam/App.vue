<template>
    <router-view :questions="questions"
        :chosen="chosen"
        :shuffledQuestions="shuffledQuestions"
        :config="config"
        :onChosen="onChosen"
        :topicID="topicID"
        :topic="topic" />
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
export default {
    props: ['topicID'],
    data () {
        return {
            questions: [],
            ref: {
                questions: null
            },
            shuffledQuestions: [],
            config: {
                numberOfQuestions: 10,
                examTime: 20,
            },
            chosen: {

            }
        }
    },
    created () {
        this.ref.questions = firebase.firestore().collection('questions').where('topic', '==', this.topicID).orderBy("date", 'desc');
        this.$bind('questions', this.ref.questions);
        if (this.topic.color) {
            this.$store.commit('setPrimaryColor', this.topic.color);
        };
    },
    computed: {
        topic () {
            return this.$store.state.topics[this.topicID];
        }
    },
    methods: {
        startExam (config) {
            this.config = config;

            var questionListShuffled = this.questions.slice();
            questionListShuffled.sort(function () {
                return 0.5 - Math.random()
            });
            let shuffledQuestions = questionListShuffled.slice(0, this.config.numberOfQuestions);
            console.log(shuffledQuestions);
            this.shuffledQuestions = shuffledQuestions;

            this.$router.replace('/exam/' + this.topicID + '/progress');
        },
        onChosen (questionID, letter) {
            this.chosen[questionID] = letter;
        }
    }
}
</script>
<style lang="scss" scoped>
.mainGrid {
	margin-top: 2em;
}
</style>
