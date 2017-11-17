<template>
    <div>
        <header>
            <md-progress-spinner v-if="loading.metadata" class="md-accent" md-mode="indeterminate" :md-diameter="30" :md-stroke="3"></md-progress-spinner>
            <div v-else>
                <h1 class="md-title">{{ topic.name }}</h1>
                <h2>{{ topic.description }}</h2>
            </div>
        </header>
        <div class="questionsList container">
            <form v-on:submit.prevent>
                <md-card>
                    <md-progress-bar md-mode="indeterminate" v-if="loading.form" />

                    <md-card-header>
                        <md-avatar>
                            <img :src="user.photoURL" :alt="user.displayName">
                        </md-avatar>

                        <div class="md-title">{{ user.displayName }}</div>
                        <div class="md-subtitle">{{ user.email }}</div>
                    </md-card-header>

                    <md-card-content>
                        <md-field :class="{ 'md-invalid': errors.has('title') }">
                            <md-icon>title</md-icon>
                            <label>Pregunta</label>
                            <md-input v-model="question.title" data-vv-name="title" v-validate data-vv-rules="required"></md-input>
                            <span class="md-error">{{errors.first('title')}}</span>
                        </md-field>

                        <div class="md-layout-row" v-for="(value, letter, index) in question.answers" :key="index">
                            <md-field :class="{ 'md-invalid': errors.has(letter) }">
                                <label>Repuesta {{letter.toUpperCase()}}</label>
                                <md-input :disabled="loading.form" v-model="question.answers[letter]" :data-vv-name="letter" v-validate data-vv-rules="required"></md-input>
                                <span class="md-error">{{errors.first(letter)}}</span>
                            </md-field>
                            <md-radio v-model="question.correctAnswer" :value="letter"></md-radio>
                        </div>

                    </md-card-content>

                    <md-card-actions>
                        <md-button class="md-primary" @click.native="addQuestion()">Enviar</md-button>
                    </md-card-actions>
                </md-card>
            </form>
            <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>

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
        topic: {
            name: null,
            description: null,
            image: null
        },
        questions: [],
        
        question: {
            title: null,
            date: null,
            correctAnswer: 'a',
            answers: {
                a: null,
                b: null,
                c: null,
                d: null
            }
        },

        loading: {
            metadata: true,
            form: false
        },

        ref: {
            topic: null,
            questions: null
        },

        snackbar: {
            display: false,
            message: null
        }
    }),
    computed: {
        user: () => {
            return firebase.auth().currentUser;
        }
    },
    watch: {
        topic: function () {
            if (this.topic.name !== null) {
                this.loading.metadata = false;
            }
        }
    },
    created: function () {
        this.ref.topic = firebase.firestore().collection('topics').doc(this.$route.params.id);
        this.ref.topic.get().then((data) => {
            if (data.exists) {
                this.$bind('topic', this.ref.topic);

                this.ref.questions = firebase.firestore().collection('questions').where('topic', '==', this.ref.topic);

                this.$bind('questions', this.ref.questions);
            }
            else {
                this.$router.go('/');
            }
        })
    },
    methods: {
        addQuestion () {
            this.loading.form = true;
            this.$validator.validateAll().then((result) => {
                if (result) {
                    this.question.topic = this.ref.topic;

                    var ref = firebase.firestore().collection('questions/');
                    ref.add(this.question).then((ref) => {

                        ref.set({
                            date: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });

                        this.question = {
                            title: null,
                            date: null,
                            author: firebase.auth().currentUser.uid,
                            correctAnswer: 'a',
                            answers: {
                                a: null,
                                b: null,
                                c: null,
                                d: null
                            }
                        };
                        this.$validator.reset();
                        this.loading.form = false;

                        this.snackbar.message = "La pregunta ha sido publicada";
                        this.snackbar.display = true;
                    });
                }
                else {
                    this.loading.form = false;
                    this.snackbar.message = "Corrige los errores";
                    this.snackbar.display = true;
                }
            })
        }
    }
}
</script>