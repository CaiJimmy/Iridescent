<template>
    <div class="md-elevation-1"
        v-if="editing">
        <question-form type="edit"
            :questionData="question"
            :questionID="question.id"
            :callback="exitEditing"
            :snackbar="snackbar" />
    </div>
    <div class="md-elevation-1"
        v-else-if="movingQuestion">
        <MoveQuestion :currentTopicID="question.topic"
            :questionID="question.id"
            :questionData="question"
            :authorData="users[question.author]"
            :snackbar="snackbar"
            :callback="onMove"
            :exitMoving="exitMoving" />
    </div>
    <div v-on:copy="copyBlock"
        v-else>
        <md-card class="questionCard"
            :id="question.id"
            :class="{'hidden': hidden}">

            <template v-if="isProfile">
                <!-- Card header for profile page -->
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
                                :datetime="question.date.toDate()"></timeago>
                        </span>
                    </div>
                </md-card-header>
            </template>

            <template v-else>
                <!-- Card header for topic page -->
                <template v-if="(isAdmin || isAuthor)">
                    <md-card-header v-if="users.hasOwnProperty(question.author) && !users[question.author].loading">
                        <md-card-header-text>
                            <md-avatar>
                                <img :src="users[question.author].photoURL"
                                    :alt="users[question.author].displayName">
                            </md-avatar>
                            <div class="md-title">
                                <a v-on:click="showProfile(question)"
                                    class="embedProfile--trigger">
                                    {{ users[question.author].displayName }}
                                </a>
                            </div>
                            <div class="md-subhead">
                                <span>
                                    <timeago :auto-update="60"
                                        :datetime="question.date.toDate()"></timeago>
                                </span>
                            </div>
                        </md-card-header-text>
                        <md-button class="md-icon-button"
                            v-on:click="toggleHidden()">
                            <md-icon v-if="hidden">visibility_off</md-icon>
                            <md-icon v-else>visibility</md-icon>
                        </md-button>
                    </md-card-header>
                    <md-progress-bar v-else
                        class="md-primary"
                        md-mode="indeterminate"
                        :md-diameter="30"
                        :md-stroke="3"></md-progress-bar>
                </template>
            </template>
            <md-card-content>
                {{ question.title }}
                <md-list>
                    <md-list-item v-for="(value, letter, index) in question.answers"
                        v-bind:key="index">
                        <div class="md-list-item-text"
                            :class="{'correctAnswer':question.correctAnswer == letter }">
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
                    v-on:click="toggleMoveQuestion()">Mover la pregunta</md-button>
                <md-button v-if="question.author == $store.state.user.uid || isAdmin"
                    v-on:click="editQuestion()">Editar</md-button>
            </md-card-actions>
        </md-card>
    </div>
</template>
<script>
import {Firestore} from '@/firebase/firestore';

import QuestionForm from './../Form.vue';
import MoveQuestion from './MoveQuestion.vue';

export default {
    data () {
        return {
            editing: false,
            movingQuestion: false,
            hidden: false
        }
    },
    props: ['question', 'snackbar', 'onUpdate', 'showProfile', 'isProfile'],
    components: {
        QuestionForm,
        MoveQuestion
    },
    created () {
        this.hidden = this.question.hidden || false;
    },
    computed: {
        users () {
            return this.$store.state.users
        },
        isAdmin: function () {
            return this.$store.state.user.isAdmin;
        },
        isAuthor () {
            return this.question.author == this.$store.state.user.uid;
        },
        topics () {
            return this.$store.state.topics
        },
    },
    methods: {
        toggleHidden () {
            const questionRef = Firestore.collection('questions').doc(this.question.id);

            this.hidden = !this.hidden; /* Invert true/false */

            questionRef.set({
                hidden: this.hidden
            }, {
                    merge: true
                });
        },
        toggleMoveQuestion () {
            this.movingQuestion = !this.movingQuestion;
        },
        onMove (data) {
            if (this.onUpdate) {
                this.onUpdate({
                    type: 'move',
                    question: data
                })
            }
        },
        exitMoving () {
            this.movingQuestion = false;
        },
        exitEditing (data) {
            this.editing = false;
            if (this.onUpdate) {
                this.onUpdate(data);
            }
        },
        editQuestion () {
            this.editing = true;
        },
        copyBlock: function (e) {
            console.log('Copy event triggered');
            if (!this.isAdmin) {
                e.clipboardData.setData('text/plain', 'Pa k kieres copiar eso jaja salu2');
                e.preventDefault();
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.questionCard {
  &.hidden {
    opacity: 0.5;
  }
  .md-list-item-text {
    white-space: normal !important;
    line-height: 1.5 !important;
    margin-bottom: 0.5em !important;
  }
  .correctAnswer {
    font-weight: bold !important;
  }
}

.embedProfile--trigger {
  cursor: pointer;
}
</style>