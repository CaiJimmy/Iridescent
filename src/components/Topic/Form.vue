<template>
    <form v-on:submit.prevent>
        <md-card>
            <md-progress-bar md-mode="indeterminate"
                v-if="loading.form" />

            <md-card-header>
                <md-avatar>
                    <img :src="user.photoURL"
                        :alt="user.displayName">
                </md-avatar>

                <div class="md-title">{{ user.displayName }}</div>
                <div class="md-subhead">{{ user.email }}</div>
            </md-card-header>

            <md-card-content>
                <md-field :class="{ 'md-invalid': errors.has('title') }">
                    <md-icon>title</md-icon>
                    <label>Pregunta</label>
                    <md-input v-model="question.title"
                        data-vv-name="title"
                        v-validate
                        data-vv-rules="required"></md-input>
                    <span class="md-error">{{errors.first('title')}}</span>
                </md-field>

                <div class="md-layout"
                    v-for="(value, letter, index) in question.answers"
                    :key="index">
                    <md-field class="md-layout-item"
                        :class="{ 'md-invalid': errors.has(letter) }">
                        <label>Repuesta {{letter.toUpperCase()}}</label>
                        <md-input :disabled="loading.form"
                            v-model="question.answers[letter]"
                            :data-vv-name="letter"
                            v-validate
                            data-vv-rules="required"></md-input>
                        <span class="md-error">{{errors.first(letter)}}</span>
                    </md-field>
                    <md-radio v-model="question.correctAnswer"
                        :value="letter"
                        class="md-primary"></md-radio>
                </div>

            </md-card-content>

            <md-card-actions>
                <md-button class="md-primary"
                    @click.native="addQuestion()"
                    v-if="type == 'send'"
                    :disabled="loading.form">Enviar</md-button>
                <div v-if="type == 'edit'">
                    <md-button class="md-accent"
                        v-on:click="deleteQuestionConfirm()">Eliminar</md-button>
                    <md-button class="md-primary"
                        v-on:click="callback(questionID)">Cancelar</md-button>
                    <md-button class="md-primary"
                        @click.native="editQuestion()"
                        :disabled="loading.form">Editar</md-button>
                </div>
            </md-card-actions>
        </md-card>

        <md-dialog-confirm :md-active.sync="deleteConfirm.show"
            v-if="deleteConfirm.selected"
            md-title="Confirmación"
            :md-content="'Estas seguro de que quieres eliminar la pregunta <strong>' + deleteConfirm.selected.title + '</strong>, publicado por <strong>' + $store.state.users[deleteConfirm.selected.author].displayName +'</strong>?'"
            md-confirm-text="Sí"
            md-cancel-text="Nope"
            @md-cancel="deleteConfirm.show = false;"
            @md-confirm="deleteQuestion(questionID)" />

    </form>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

export default {
    name: 'Send',
    props: ['topicRef', 'snackbar', 'callback', 'type', 'questionData', 'questionID'],
    data: () => ({
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
            form: false
        },
        deleteConfirm: {
            show: false,
            selected: null
        },

    }),
    created () {
        if (this.type == 'edit') {
            this.question = this.questionData;
        }
    },
    computed: {
        user () {
            if (this.type == 'edit') {
                return this.$store.state.users[this.questionData.author];
            }
            else {
                return firebase.auth().currentUser
            }
        }
    },
    methods: {
        deleteQuestionConfirm (questionIndex) {
            this.deleteConfirm.selected = this.questionData;
            this.deleteConfirm.show = true;
        },
        deleteQuestion (questionID) {
            firebase.firestore().collection('questions').doc(questionID).delete().then(() => {
                this.snackbar.message = 'La pregunta ha sido eliminada';
                this.snackbar.display = true;
            });
        },
        editQuestion () {
            this.loading.form = true;
            this.$validator.validateAll().then((result) => {
                if (result) {
                    var ref = firebase.firestore().collection('questions/').doc(this.questionID);
                    ref.set(this.question, { merge: true }).then((ref) => {

                        this.snackbar.message = "La pregunta ha sido editada correctamente";
                        this.snackbar.display = true;

                        if (this.callback) {
                            this.callback(this.questionID);
                        }
                    });
                }
                else {
                    this.loading.form = false;
                    this.snackbar.message = "Corrige los errores";
                    this.snackbar.display = true;
                }
            })
        },
        addQuestion () {
            this.loading.form = true;
            this.$validator.validateAll().then((result) => {
                if (result) {
                    this.question.topic = this.topicRef;
                    this.question.author = firebase.auth().currentUser.uid;

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

                        if (this.callback) {
                            this.callback('question');
                        }
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

