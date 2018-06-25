<template>
    <div class="container extend">
        <div id="mainGrid"
            class="md-layout md-gutter md-layout-column-xsmall md-alignment">

            <div class="md-layout-column md-layout-item md-size-25 md-small-size-100 questions--sidebar">
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

                <TopicStat :topicData="topic" />
            </div>

            <div class="md-layout-column md-layout-item md-size-75 md-small-size-100 md-gutter">
                <div class="loader-wrapper"
                    v-if="loading.questions">
                    <md-progress-spinner md-mode="indeterminate"
                        :md-diameter="30"
                        :md-stroke="3"></md-progress-spinner>
                </div>

                <div v-else>
                    <div v-if="questions.length">
                        <div class="questionContainer"
                            v-for="(item) in questions"
                            :key="item.id">
                            <question-card :question="item"
                                :snackbar="snackbar"
                                :onUpdate="onUpdate"
                                :showProfile="showProfile" />
                        </div>
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
            :md-active.sync="dialog.question">
            <question-form :topicRef="$parent.ref.topic"
                :callback="closeDialog"
                :snackbar="snackbar"
                type="send" />
        </md-dialog>

        <md-snackbar id="newQuestionAlert"
            :md-active.sync="newQuestionAlert"
            md-position="left"
            :md-duration="Infinity">
            <span>Hay nuevas preguntas</span>
            <md-button class="md-primary"
                @click="pushNewQuestions()">Mostrar</md-button>
        </md-snackbar>

        <md-button class="md-fab md-primary addQuestion"
            v-on:click="dialog.question = true;">
            <md-icon>add</md-icon>
        </md-button>

        <md-dialog :md-active.sync="dialog.embedProfile"
            class="embedProfile">
            <md-toolbar class="embedProfile--toolbar">
                <h3 class="md-title"
                    style="flex: 1">Perfil</h3>
                <md-button class="md-icon-button"
                    v-on:click="$router.push({ path: '/profile/' + activeQuestion.author, query: { topic: activeQuestion.topic }})">
                    <md-icon>open_in_new</md-icon>
                </md-button>
                <md-button class="md-icon-button"
                    v-on:click="dialog.embedProfile = false;">
                    <md-icon>close</md-icon>
                </md-button>
            </md-toolbar>
            <profile-page :userID="activeQuestion.author"
                :embed="true"
                :topicID="activeQuestion.topic" />
        </md-dialog>
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import QuestionForm from './Form.vue';
import QuestionCard from './components/QuestionCard.vue';
import ProfilePage from '@/components/Profile/App.vue';
import TopicStat from './components/TopicStat.vue';

export default {
    name: 'TopicPage',
    data: () => ({
        dialog: {
            question: false,
            embedProfile: false,
        },

        snackbar: {
            display: false,
            message: null
        },

        activeQuestion: {},

        newQuestionAlert: false,
    }),
    components: {
        QuestionForm,
        QuestionCard,
        ProfilePage,
        TopicStat
    },
    watch: {
        newQuestions: function () {
            if(this.dialog.question){
                this.pushNewQuestions();
                return;
            };
            
            if (this.newQuestions.length) {
                this.newQuestionAlert = true;
            }
        }
    },
    computed: {
        pushNewQuestions(){
            return this.$parent.pushNewQuestions;
        },
        newQuestions(){
            return this.$parent.newQuestions;
        },
        question_bar: function () {
            return this.$parent.question_bar;
        },
        questions: function () {
            return (this.$parent.questions)
        },
        userQuestions: function () {
            return this.$parent.userQuestions
        },
        loading: function () {
            return this.$parent.loading
        },
        loadMoreDisabled: function () {
            return this.$parent.paging.loading | this.$parent.paging.end;
        },
        isAdmin () {
            return this.$store.state.user.isAdmin;
        },
        topic(){
            return this.$parent.topic;
        }
    },
    methods: {
        showProfile (question) {
            this.activeQuestion = question;
            this.dialog.embedProfile = true;
        },
        onUpdate (data) {
            let type = data.type,
                index = -1;

            if (!type) {
                return;
            };

            if (data.question) {
                index = this.questions.findIndex((question) => question.id == data.question.id);
            }
            switch (type) {
                case 'edit':
                    if (index > -1) {
                        this.$parent.questions[index] = data.question;
                    };
                    break;

                case 'delete':
                case 'move':
                    if (index > -1) {
                        this.$parent.questions.splice(index, 1);
                    };
            }

        },
        closeDialog (where) {
            this.dialog[where] = false;
        },
        loadMore: function () {
            this.$parent.loadMore();
        }
    }
}
</script>

<style lang="scss" scoped>
form {
  overflow-y: auto;
}

.questionContainer {
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
  z-index: 2;
}
@media only screen and (min-width: 944px) {
  .questions--sidebar {
    position: sticky;
    top: 80px;
    align-self: flex-start;
  }
}

.endOfPage {
  text-align: center;
  display: block;
  color: #999;
}

.embedProfile {
  @media (min-width: 600px) {
    height: 100vh;
    width: 95vw;
  }

  .embedProfile--toolbar {
    position: sticky;
    top: 0;
    left: 0;
  }

  .userProfile {
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #fafafa;
    background-color: var(--md-theme-default-background-variant, #fafafa);
  }
}
</style>
