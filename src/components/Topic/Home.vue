<template>
<div class="container extend">
    <div class="md-layout-row md-gutter">
        <div class="md-layout-column md-flex-25">
            <md-card>
                <md-progress-bar md-mode="determinate" :md-value="question_bar"></md-progress-bar>
      <md-card-header>
        <div class="md-subhead">Número de Preguntas</div>
      </md-card-header>
      <md-card-content>Para este tema, necesitas enviar {{ $parent.topic.questionCount }} preguntas, llevas {{ userQuestions.length }}</md-card-content>
    </md-card>
        </div>
        <div class="md-layout-column md-flex-75">
            <div v-if="questions.length">
                <md-card v-for="(item, index) in questions" :key="item['.key']">
                    <md-card-content>
                        {{ item.title }} {{item.id}}
                        <md-list>
                            <md-list-item v-for="(value, letter, index) in item.answers" v-bind:key="index">
                                <div class="md-list-text-container">
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
            <md-empty-state v-else md-icon="question_answer"
                md-label="Crear preguntas"
                md-description="Parece ser que no hay ninguna pregunta en este tema">
            </md-empty-state>
        </div>
    </div>
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

export default {
    name: 'TopicPage',
    data: () => ({
        questions: [],

        userQuestions: [],

        loading: {
            questions: true
        },

        ref: {
            questions: null,
            userQuestions: null
        }
    }),
    computed:{
        question_bar: function(){
            if(this.$parent.topic.questionCount){
                let current = this.userQuestions.length,
                    total = this.$parent.topic.questionCount;
                
                return current / total * 100
            }
        }
    },
    watch: {
        questions: function () {
            this.loading.questions = false;
        }
    },
    created: function () {
        this.ref.questions = firebase.firestore().collection('questions').where('topic', '==', this.$parent.ref.topic);
        this.$bind('questions', this.ref.questions);

        this.ref.userQuestions = ref.questions.where('author', '==', this.$parent.user.uid);
        this.$bind('userQuestions', this.ref.userQuestions);
    }
}
</script>