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
        <md-card class="questionCard">
            <md-card-header v-if="users.hasOwnProperty(question.author) && !users[question.author].loading">
                <md-avatar>
                    <img :src="topics[question.topic].image"
                        :alt="topics[question.topic].name">
                </md-avatar>
                <div class="md-title">
                    <router-link :to="{ path: '/profile/' + question.author, query: { topic: question.topic }}">
                        {{ topics[question.topic].name }}
                    </router-link>
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

        <md-dialog :md-active.sync="moveQuestion"
            :md-fullscreen="false">
            <md-dialog-title>Mover Pregunta</md-dialog-title>
            <div class="md-dialog-content">
                <MoveQuestion :currentTopicID="question.topic"
                    :questionID="question.id"
                    :questionData="question"
                    :authorData="users[question.author]"
                    :snackbar="snackbar"
                    :callback="moveQuestionCallback" />
            </div>
        </md-dialog>

    </div>
</template>
<script>
import QuestionForm from '@/components/Topic/Form.vue';
import MoveQuestion from '@/components/Topic/components/MoveQuestion.vue';

export default {
    data () {
        return {
            editing: false,
            moveQuestion: false
        }
    },
    props: ['question', 'snackbar'],
    components: {
        QuestionForm,
        MoveQuestion
    },
    computed: {
        users () {
            return this.$store.state.users
        },
        topics () {
            return this.$store.state.topics
        },
        isAdmin: function () {
            return this.$store.state.user.isAdmin;
        }
    },
    methods: {
        moveQuestionCallback () {
            this.moveQuestion = false;
        },
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
</style>
