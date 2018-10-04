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
                        :disabled="loading.form"
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
                    :disabled="loading.form"
                    type="submit">Enviar</md-button>
                <div v-if="type == 'edit'">
                    <md-button class="md-accent"
                        v-on:click="deleteQuestionConfirm()">Eliminar</md-button>
                    <md-button class="md-primary"
                        v-on:click="callback({type: 'edit', edited: false})">Cancelar</md-button>
                    <md-button class="md-primary"
                        @click.native="editQuestion()"
                        :disabled="loading.form"
                        type="submit">Editar</md-button>
                </div>
            </md-card-actions>
        </md-card>
        <md-dialog :md-active.sync="deleteConfirm.show"
            :md-fullscreen="false"
            v-if="deleteConfirm.selected">
            <md-dialog-title>Confirmación</md-dialog-title>
            <div class="md-dialog-content"
                v-html="deleteConfirmContent"></div>
            <md-dialog-actions>
                <md-button class="md-accent"
                    @click="deleteQuestion(questionID)">Sí</md-button>
                <md-button class="md-primary"
                    @click="deleteConfirm.show = false">Nope</md-button>
            </md-dialog-actions>
        </md-dialog>
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
            },
            hidden: false
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
            this.question = Object.assign({}, this.questionData);  /// Don't mutate the original data
        }
    },
    computed: {
        "deleteConfirmContent" () {
            let questionTitle = this.deleteConfirm.selected.title,
                authorDisplayName = this.$store.state.users[this.deleteConfirm.selected.author].displayName
            return 'Estas seguro de que quieres eliminar la pregunta <strong>' + questionTitle + '</strong>, publicado por <strong>' + authorDisplayName + '</strong>?'
        },
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
            let questionData = this.question;

            firebase.firestore().collection('questions').doc(questionID).delete().then(() => {
                this.snackbar.message = 'La pregunta ha sido eliminada';
                this.snackbar.display = true;

                if (this.callback) {
                    this.callback({
                        type: 'delete',
                        deleted: true,
                        question: questionData
                    })
                }
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
                            this.callback({
                                type: 'edit',
                                edited: true,
                                question: this.question
                            });
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
                    this.question.topic = this.topicRef.id;
                    this.question.author = firebase.auth().currentUser.uid;

                    var ref = firebase.firestore().collection('questions/');
                    ref.add({
                        ...this.question,
                        date: firebase.firestore.FieldValue.serverTimestamp()
                    }).then((ref) => {

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
                            },
							hidden: false
                        };
                        this.$validator.reset();
                        this.loading.form = false;

                        this.snackbar.message = "La pregunta ha sido publicada";
                        this.snackbar.display = true;

                        if (this.callback) {
                            this.callback({
                                type: 'add'
                            });
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

