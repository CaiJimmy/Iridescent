<template>
    <div class="md-elevation-1"
        v-if="editing">
        <question-form type="edit"
            :questionData="question"
            :questionID="question.id"
            :callback="exitEditing"
            :snackbar="snackbar" />
    </div>
    <div v-on:copy="copyBlock"
        v-else>
        <md-card class="questionCard" :id="question.id">
            <md-card-header v-if="users.hasOwnProperty(question.author) && !users[question.author].loading">
                <md-avatar>
                    <img :src="users[question.author].photoURL"
                        :alt="users[question.author].displayName">
                </md-avatar>
                <div class="md-title">
                    <a v-on:click="showProfile = true"
                        class="embedProfile--trigger">
                        {{ users[question.author].displayName }}
                    </a>
                </div>
                <div class="md-subhead">
                    <span>
                        <timeago :auto-update="60"
                            :since="question.date"></timeago>
                    </span>
                </div>
            </md-card-header>
            <md-progress-bar v-else
                class="md-primary"
                md-mode="indeterminate"
                :md-diameter="30"
                :md-stroke="3"></md-progress-bar>
            <md-card-content>
                {{ question.title }}
                <md-list>
                    <md-list-item v-for="(value, letter, index) in question.answers"
                        v-bind:key="index">
                        <div class="md-list-item-text">
                            {{letter.toUpperCase()}}. {{value}}
                        </div>
                        <md-button v-if="question.correctAnswer == letter"
                            class="md-icon-button md-list-action">
                            <md-icon class="md-primary">star</md-icon>
                        </md-button>
                        <md-divider v-if="letter !== 'd'"></md-divider>
                    </md-list-item>
                </md-list>
            </md-card-content>
            <md-card-actions>
                <md-button v-if="isAdmin"
                    v-on:click="moveQuestion = true">Mover la pregunta</md-button>
                <md-button v-if="question.author == $store.state.user.uid || isAdmin"
                    v-on:click="editQuestion()">Editar</md-button>
            </md-card-actions>
        </md-card>

        <md-dialog :md-active.sync="moveQuestion">
            <md-dialog-title>Mover Pregunta</md-dialog-title>
            <MoveQuestion :currentTopicID="question.topic"
                :questionID="question.id"
                :questionData="question"
                :authorData="users[question.author]"
                :snackbar="snackbar" />
        </md-dialog>

        <md-dialog :md-active.sync="showProfile"
            class="embedProfile">
            <md-toolbar class="embedProfile--toolbar">
                <h3 class="md-title"
                    style="flex: 1">Perfil</h3>
                <md-button class="md-icon-button"
                    v-on:click="$router.push({ path: '/profile/' + question.author, query: { topic: question.topic }})">
                    <md-icon>open_in_new</md-icon>
                </md-button>
                <md-button class="md-icon-button"
                    v-on:click="showProfile = false;">
                    <md-icon>close</md-icon>
                </md-button>
            </md-toolbar>
            <profile-page :userID="question.author"
                :embed="true"
                :topicID="question.topic" />
        </md-dialog>
    </div>
</template>
<script>
import QuestionForm from './../Form.vue';
import ProfilePage from '@/components/Profile/App.vue';
import MoveQuestion from './MoveQuestion.vue';

export default {
    data () {
        return {
            editing: false,
            showProfile: false,
            moveQuestion: false
        }
    },
    props: ['question', 'snackbar'],
    components: {
        QuestionForm,
        ProfilePage,
        MoveQuestion
    },
    computed: {
        users () {
            return this.$store.state.users
        },
        isAdmin: function () {
            return this.$store.state.isAdmin;
        }
    },
    methods: {
        exitEditing () {
            this.editing = false
        },
        editQuestion () {
            this.editing = true;
        },
        copyBlock: function (e) {
            console.log('Copy event triggered');
            if (!this.isAdmin) {
                e.clipboardData.setData('text/plain', 'Pa k kieres copiar eso jaja salu2');
                e.preventDefault();
            };
        }
    }
}
</script>
<style lang="scss" scoped>
.questionCard {
	.md-list-item-text {
		white-space: normal !important;
	}
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
	}
}

.embedProfile--trigger {
	cursor: pointer;
}
</style>