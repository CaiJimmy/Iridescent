<template>
    <div class="container extend mainContent">
        <!-- Start Grid -->
        <div class="examResult md-layout md-gutter md-layout-column-xsmall md-alignment mainGrid">

            <!-- Start left side -->
            <div class="leftSide md-layout-item md-size-30 md-small-size-100 md-gutter">
                <md-card>
                    <md-card-header>
                        <div class="md-title">Resultado del examen</div>
                    </md-card-header>

                    <md-card-content>
                        <md-list>
                            <md-list-item v-if="result.grade">
                                <md-icon>grade</md-icon>
                                <span class="md-list-item-text">Nota final : {{ result.grade }}</span>
                            </md-list-item>
                            <md-list-item v-if="correctCount">
                                <md-icon>thumb_up</md-icon>
                                <span class="md-list-item-text">{{ correctCount }} Correctas</span>
                            </md-list-item>

                            <md-list-item v-if="wrongCount">
                                <md-icon>thumb_down</md-icon>
                                <span class="md-list-item-text">{{ wrongCount }} Incorrectas</span>
                            </md-list-item>
                            <md-list-item v-if="blankCount">
                                <md-icon>check_box_outline_blank</md-icon>
                                <span class="md-list-item-text">{{ blankCount }} en blanco</span>
                            </md-list-item>
                        </md-list>

                    </md-card-content>
                </md-card>
                <md-button class="md-primary md-raised exitExam"
                    v-on:click="$router.replace('/t/' + topicID)">Terminar</md-button>
            </div>
            <!-- End left side -->

            <!-- Start right side -->
            <div class="rightSide md-layout-item md-size-70 md-small-size-100 md-gutter">
                <QuestionCard v-for="(question,index) in examQuestions"
                    :key="question.id"
                    :item="question"
                    :index="index"
                    :total="examQuestions.length"
                    :correctAnswer="question.correctAnswer"
                    :itemChosen="chosen[question.id]" />
            </div>
            <!-- End right side -->

        </div>
        <!-- End Grid -->
    </div>
</template>
<script>
import QuestionCard from './QuestionCard.vue';

export default {
    name: 'ExamResults',
    props: {
        chosen: Object,   /* Pair of `questionID - chosen answer letter` */
        examQuestions: Array,
        topicID: String
    },
    components: {
        QuestionCard
    },
    data () {
        return {
            result: {
                blank: [],
                correct: [],
                wrong: [],
                grade: 0
            }
        }
    },
    created () {
        if (!this.examQuestions.length) {
            /* 
                If user entered this page directly
            */
            this.$router.replace('/t/' + this.topicID);
        }
        else {
            this.checkAnswers();
            window.scrollTo(0, 0);
        }
    },
    computed: {
        blankCount () {
            return this.result.blank.length
        },
        correctCount () {
            return this.result.correct.length;
        },
        wrongCount () {
            return this.result.wrong.length;
        }
    },
    methods: {
        checkAnswers () {
            let chosen = this.chosen,
                result = this.result;
            
            /*
                Loop though all exam questions
                And check if chosen answer == correct answer
            */
            this.examQuestions.forEach((question) => {
                if (!chosen.hasOwnProperty(question.id)) {
                    result.blank.push({
                        'id': question.id
                    });
                } else if (chosen[question.id] == question.correctAnswer) {
                    result.correct.push({
                        'id': question.id
                    });
                } else {
                    result.wrong.push({
                        'id': question.id,
                        'chosen': chosen[question.id]
                    });
                }
            });
            this.result.grade = (this.result.correct.length / this.examQuestions.length) * 10;
        }
    }
}
</script>
<style lang="scss" scoped>
.md-card {
  margin-bottom: 1em;
}
.exitExam {
  width: 100%;
  margin: 0;
}
.leftSide {
  @media only screen and (min-width: 944px) {
    position: sticky;
    top: 80px;
    align-self: flex-start;
  }
}
</style>
