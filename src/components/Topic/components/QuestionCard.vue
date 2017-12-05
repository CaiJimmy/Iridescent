<template>
    <md-content class="md-elevation-1"
        v-if="editing">
        <question-form type="edit"
            :questionData="question"
            :questionID="question.id"
            :callback="exitEditing"
            :snackbar="snackbar" />
    </md-content>
    <div v-on:copy="copyBlock"
        v-else>
        <md-card class="questionCard">
            <md-card-header v-if="users.hasOwnProperty(question.author) && !users[question.author].loading">
                <md-avatar>
                    <img :src="users[question.author].photoURL"
                        :alt="users[question.author].displayName">
                </md-avatar>
                <div class="md-title">
                    <router-link :to="{ path: '/profile/' + question.author, query: { topic: question.topic }}">
                        {{ users[question.author].displayName }}
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
                <md-button v-if="question.author == $store.state.user.uid || isAdmin"
                    v-on:click="editQuestion()">Editar</md-button>
            </md-card-actions>
        </md-card>
    </div>
</template>
<script>
import QuestionForm from './../Form.vue';
import moment from 'moment';
import General from '@/mixins/general.js';

export default {
    data () {
        return {
            editing: false,
        }
    },
    props: ['question', 'snackbar'],
    mixins: [General],
    components: {
        QuestionForm
    },
    methods: {
        exitEditing () {
            this.editing = false
        },
        editQuestion () {
            this.editing = true;
        },
        toDate: function (date) {
            return moment(date).format("MM/DD/YYYY HH:mm")
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
