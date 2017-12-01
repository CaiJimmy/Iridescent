<template>
    <div class="container extend">
        <div id="mainGrid"
            class="md-layout md-gutter md-layout-column-xsmall md-alignment">
            <div class="md-layout-column md-layout-item md-size-25 md-small-size-100">
                <div class="loader-wrapper"
                    v-if="loading.userQuestions">
                    <md-progress-spinner md-mode="indeterminate"
                        :md-diameter="30"
                        :md-stroke="3"></md-progress-spinner>
                </div>
                <md-card v-if="!loading.userQuestions && $parent.topic.questionCount">
                    <md-progress-bar md-mode="determinate"
                        :md-value="question_bar"></md-progress-bar>
                    <md-card-header>
                        <div class="md-subhead">Preparar el examen</div>
                    </md-card-header>
                    <md-card-content>Para este tema, necesitas enviar {{ $parent.topic.questionCount }} preguntas, llevas {{ userQuestions.length }}</md-card-content>
                </md-card>
            </div>

            <div class="md-layout-column md-layout-item md-size-75 md-small-size-100 md-gutter ">
                <div class="loader-wrapper"
                    v-if="loading.questions">
                    <md-progress-spinner md-mode="indeterminate"
                        :md-diameter="30"
                        :md-stroke="3"></md-progress-spinner>
                </div>

                <div v-else>
                    <div v-if="questions.length"
                        v-on:copy="copyBlock">
                        <md-card v-for="(item, index) in questions"
                            :key="item.id"
                            class="questionCard">
                            <md-card-header v-if="users.hasOwnProperty(item.author) && !users[item.author].loading">
                                <md-avatar>
                                    <img :src="users[item.author].photoURL"
                                        :alt="users[item.author].displayName">
                                </md-avatar>
                                <div class="md-title">{{ users[item.author].displayName }}</div>
                                <div class="md-subhead">
                                    <span>
                                        <timeago :auto-update="60"
                                            :since="item.date"></timeago>
                                    </span>
                                </div>
                            </md-card-header>
                            <md-progress-bar v-else
                                class="md-accent"
                                md-mode="indeterminate"
                                :md-diameter="30"
                                :md-stroke="3"></md-progress-bar>
                            <md-card-content>
                                {{ item.title }}
                                <md-list>
                                    <md-list-item v-for="(value, letter, index) in item.answers"
                                        v-bind:key="index">
                                        <div class="md-list-item-text">
                                            {{letter.toUpperCase()}}. {{value}}
                                        </div>
                                        <md-button v-if="item.correctAnswer == letter"
                                            class="md-icon-button md-list-action">
                                            <md-icon class="md-primary">star</md-icon>
                                        </md-button>
                                        <md-divider v-if="letter !== 'd'"></md-divider>
                                    </md-list-item>
                                </md-list>
                            </md-card-content>
                            <md-card-actions>
                                <md-button v-if="item.author == $store.state.user.uid || $store.state.user.isAdmin"
                                    v-on:click="deleteQuestionConfirm(index)">Eliminar</md-button>
                            </md-card-actions>
                        </md-card>
                        <mugen-scroll :handler="loadMore"
                            :should-handle="!loadMoreDisabled">
                            <div class="loader-wrapper"
                                v-if="!loadMoreDisabled">
                                <md-progress-spinner :md-diameter="30"
                                    :md-stroke="3"
                                    md-mode="indeterminate"></md-progress-spinner>
                            </div>
                        </mugen-scroll>
                    </div>
                    <md-empty-state v-else
                        md-icon="question_answer"
                        md-label="Crear preguntas"
                        md-description="Parece ser que no hay ninguna pregunta en este tema">
                    </md-empty-state>
                </div>
            </div>
        </div>
        <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>

        <md-dialog :md-fullscreen="false"
            :md-active.sync="showQuestionForm">
            <question-form :topicRef="$parent.ref.topic"
                :callback="closeDialog"
                :snackbar="snackbar" />
        </md-dialog>

        <md-dialog-confirm :md-active.sync="deleteConfirm.show"
            v-if="deleteConfirm.selected"
            md-title="Confirmación"
            :md-content="'Estas seguro de que quieres eliminar la pregunta <strong>' + deleteConfirm.selected.title + '</strong>, publicado por <strong>' + users[deleteConfirm.selected.author].displayName +'</strong>?'"
            md-confirm-text="Sí"
            md-cancel-text="Nope"
            @md-cancel="deleteConfirm.show = false;"
            @md-confirm="deleteQuestion(deleteConfirm.selected.id)" />

        <md-button class="md-fab md-primary addQuestion"
            v-on:click="showQuestionForm = true;">
            <md-icon>add</md-icon>
        </md-button>
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import moment from 'moment';
import General from '@/mixins/general.js'
import MugenScroll from 'vue-mugen-scroll';

import QuestionForm from './Send.vue';

export default {
    name: 'TopicPage',

    mixins: [General],
    data: () => ({
        showQuestionForm: false,
        deleteConfirm: {
            show: false,
            selected: null
        },

        snackbar: {
            display: false,
            message: null
        }
    }),
    components: {
        MugenScroll,
        QuestionForm
    },
    computed: {
        question_bar: function () {
            if (this.$parent.topic.questionCount) {
                let current = this.userQuestions.length,
                    total = this.$parent.topic.questionCount;

                return current / total * 100
            }
        },
        questions: function () {
            return (this.$parent.paginatedQuestions)
        },
        userQuestions: function () {
            return this.$parent.userQuestions
        },
        loading: function () {
            return this.$parent.loading
        },
        loadMoreDisabled: function () {
            return this.$parent.paging.loading | this.$parent.paging.end;
        }
    },
    methods: {
        deleteQuestionConfirm (questionIndex) {
            this.deleteConfirm.selected = this.questions[questionIndex];
            this.deleteConfirm.show = true;
        },
        deleteQuestion (questionID) {
            firebase.firestore().collection('questions').doc(questionID).delete().then(() => {
                this.snackbar.message = 'La pregunta ha sido eliminada';
                this.snackbar.display = true;
            });
        },
        closeDialog () {
            this.showQuestionForm = false;
        },
        loadMore: function () {
            this.$parent.loadMore();
        },
        toDate: function (date) {
            return moment(date).format("MM/DD/YYYY HH:mm")
        },
        copyBlock: function (e) {
            console.log('Copy event triggered');
            if (!isAdmin) {
                e.clipboardData.setData('text/plain', 'Pa k kieres copiar eso jaja salu2');
                e.preventDefault();
            };
        }
    }
}
</script>

<style lang="scss" scoped>
form {
  overflow-y: auto;
}

.questionCard {
  margin-bottom: 16px;
}

.md-dialog {
  width: 500px;
  max-height: 90%;
}

.loader-wrapper {
  text-align: center;
}

#mainGrid {
  & > .md-layout-item {
    margin-bottom: 16px;
  }
}

.addQuestion {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
