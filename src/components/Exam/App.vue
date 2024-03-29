<template>
    <div class="container extend">
        <md-empty-state v-if="!topicData.count.total"
            md-icon="question_answer"
            md-label="No hay preguntas"
            md-description="No hay preguntas bajo este tema para poder realizar examen">
        </md-empty-state>

        <router-view v-else
            :chosen="chosen"
            :examQuestions="examQuestions"
            :config="config"
            :onChosen="onChosen"
            :topicID="topicID"
            :topicData="topicData" />
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";

export default {
    name: 'ExamPage',
    props: {
        topicID: String   /* Passed though Vue Router */
    },
    data () {
        return {
            ref: {
                questions: firebase.firestore().collection('questions').where('topic', '==', this.topicID)
            },
            allQuestions: [],
            examQuestions: [],

            config: {
                numberOfQuestions: 10,
                examTime: 20,
            },

            chosen: {}   /* Question ID - Letter of answer chosen */
        }
    },
    computed: {
        topicData () {
            return this.$store.state.topics[this.topicID];
        },
        questions () {
            return this.$parent.questions;
        }
    },
    methods: {
        shuffle (array) {
            /* From https://stackoverflow.com/a/2450976 */

            var currentIndex = array.length, temporaryValue, randomIndex;

            /* While there remain elements to shuffle... */
            while (0 !== currentIndex) {

                /* Pick a remaining element... */
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                /* And swap it with the current element. */
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        },
        prepareQuestions(){
            return new Promise(async resolve => {
                if(this.topicData.count.total && !this.allQuestions.length){
                    /* 
                        Questions not downloaded yet.
                    */

                    await this.$bind('allQuestions', this.ref.questions);
                };

                this.examQuestions = this.shuffle(this.allQuestions).slice(0, this.config.numberOfQuestions);
                resolve();
            })
        },
        startExam (config) {
            /*
                This function is called in Exam/Home.vue, with parameter `config`
            */
            this.config = config;

            /* Once copied config, start to download and shuffle questions */
            this.prepareQuestions().then(() => {
                this.$router.replace('/t/' + this.topicID + '/exam/progress');
            });
        },
        onChosen (questionID, letter) {
            /*
                This function is passed to ExamQuestionCard
                To create a pair of `questionID - chosen answer letter`
            */
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
