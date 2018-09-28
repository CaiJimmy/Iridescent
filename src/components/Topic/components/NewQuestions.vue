<template>
    <div id="newQuestionWrapper">
        <div class="questionContainer"
            v-for="(item) in newQuestions"
            :key="item.id">
            <question-card :question="item"
                :snackbar="snackbar"
                :showProfile="showProfile" />
        </div>
        <md-snackbar id="newQuestionAlert"
            :md-active.sync="newQuestionAlert"
            md-position="left"
            :md-duration="Infinity">
            <span>Hay nuevas preguntas</span>
            <md-button class="md-primary"
                @click="pushNewQuestions()">Mostrar</md-button>
        </md-snackbar>

        <div v-if="newQuestions.length"
            class="separator">
            <span class="md-elevation-1">Preguntas Antiguas</span>
        </div>
    </div>
</template>
<script>
import Firestore from '@/firebase/firestore';

import QuestionCard from './QuestionCard.vue';
import fetchUserDatas from '@/methods/fetchUserDatas.js';

export default {
    name: 'NewQuestions',
    props: ['questionsRef', 'isQuestionDialogActive', 'snackbar', 'showProfile'],
    components: {
        QuestionCard
    },
    data () {
        return {
            newQuestionAlert: false,

            ref: {
                newQuestions: null
            },

            newQuestions: []
        }
    },
    created () {
        this.ref.newQuestions = this.questionsRef.where('date', '>', new Date());
        window.newQuestionsRef = this.ref.newQuestions;
        this.$bind('newQuestions', this.ref.newQuestions);
    },
    watch: {
        newQuestions (newArr, oldArr) {
            if (newArr.length && newArr.length > oldArr.length) {
                /* Triggered only when a question is added (newArr.length > oldArr.length) */
                this.newQuestionAlert = true;
            }
        }
    },
    methods: {
        pushNewQuestions () {
            this.newQuestions.forEach((question) => {
                fetchUserDatas(question.author);
            });

            this.newQuestionAlert = false;  /// Hide notification
            document.getElementById("newQuestionWrapper").scrollIntoView();
        },
    }
}
</script>
<style lang="scss" scoped>
.separator {
  text-align: center;
  margin: 20px auto;
  position: relative;

  span {
    background-color: #fff;
    padding: 10px 15px;
    font-weight: bold;
    color: #999;
  }
  &:before {
    content: "";
    width: 100%;
    height: 1px;
    background: #e1e1e1;
    display: block;
    position: absolute;
    top: 50%;
    z-index: -1;
    transform: translateY(-50%);
  }
}
</style>
