<template>
    <div class="container extend">
        <div id="mainGrid"
            class="md-layout md-gutter md-layout-column-xsmall md-alignment">

            <div id="sidebar"
                class="md-layout-column md-layout-item md-size-25 md-small-size-100">

                <UserStat :topicData="topic" />
                <TopicStat v-if="isAdmin"
                    :topicData="topic" />

            </div>

            <div class="md-layout-column md-layout-item md-size-75 md-small-size-100 md-gutter">
                <QuestionList :topicData="topic"
                    :showProfile="showProfile" />
            </div>
        </div>

        <md-dialog :md-fullscreen="false"
            :md-active.sync="dialog.question">
            <question-form :topicRef="$parent.ref.topic"
                :callback="closeDialog"
                :snackbar="snackbar"
                type="send" />
        </md-dialog>

        <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>

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
import QuestionForm from './Form.vue';
import ProfilePage from '@/components/Profile/App.vue';
import TopicStat from './components/TopicStat.vue';
import UserStat from './components/UserStat.vue';
import QuestionList from './components/QuestionList.vue';

export default {
    name: 'TopicPage',
    data: () => ({
        dialog: {
            question: false,
            embedProfile: false,
        },

        activeQuestion: {},

        newQuestionAlert: false,

        ref: {
            newQuestions: null
        },

        newQuestions: [],
        
        snackbar: {
            display: false,
            message: null
        },
    }),
    components: {
        QuestionForm,
        ProfilePage,
        TopicStat,
        UserStat,
        QuestionList
    },
    watch: {
        newQuestions: function () {
            if (this.dialog.question) {
                this.pushNewQuestions();
                return;
            };

            if (this.newQuestions.length) {
                this.newQuestionAlert = true;
            }
        }
    },
    computed: {
        pushNewQuestions () {
            return this.$parent.pushNewQuestions;
        },
        isAdmin () {
            return this.$store.state.user.isAdmin;
        },
        topic () {
            return this.$parent.topic;
        }
    },
    methods: {
        showProfile (question) {
            this.activeQuestion = question;
            this.dialog.embedProfile = true;
        },
        closeDialog (where) {
            this.dialog[where] = false;
        }
    }
}
</script>

<style lang="scss" scoped>
form {
  overflow-y: auto;
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

#sidebar {
  @media only screen and (min-width: 944px) {
    position: sticky;
    top: 80px;
    align-self: flex-start;
  }

  .md-card {
    margin-bottom: 16px;
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
