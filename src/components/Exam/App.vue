<template>
    <div class="container extend">
        <router-view :questions="questions"
            :chosen="chosen"
            :shuffledQuestions="shuffledQuestions"
            :config="config"
            :onChosen="onChosen"
            :topicID="topicID"
            :topic="topic" />
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
export default {
    props: ['topicID'],
    data () {
        return {
            ref: {
                questions: null
            },
            shuffledQuestions: [],
            config: {
                numberOfQuestions: 10,
                examTime: 20,
            },
            chosen: {}
        }
    },
    created () {

    },
    computed: {
        topic () {
            return this.$store.state.topics[this.topicID];
        },
        questions () {
            return this.$parent.questions;
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

            this.$router.replace('/t/' + this.topicID + '/exam/progress');
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
