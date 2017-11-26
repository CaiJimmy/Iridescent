<template>
    <div class="container extend">
        <div class="md-layout-row md-layout-column-small md-gutter">
            <div class="md-layout-column md-flex-large-25">
                <md-card v-if="!loading.userQuestions && $parent.topic.questionCount">
                    <md-progress-bar md-mode="determinate" :md-value="question_bar"></md-progress-bar>
                    <md-card-header>
                        <div class="md-subhead">Preparar el examen</div>
                    </md-card-header>
                    <md-card-content>Para este tema, necesitas enviar {{ $parent.topic.questionCount }} preguntas, llevas {{ userQuestions.length }}</md-card-content>
                </md-card>
            </div>

            <div class="md-layout-column md-flex-large-75 md-gutter" v-if="!loading.questions">
                <div v-if="questions.length">
                    <md-card v-for="(item, index) in questions" :key="item['.key']" class="questionCard">

                        <md-card-header v-if="users.hasOwnProperty(item.author)">
                            <md-avatar>
                                <img :src="users[item.author].photoURL" :alt="users[item.author].displayName">
                            </md-avatar>
                            <div class="md-title">{{ users[item.author].displayName }}</div>
                            <div class="md-subhead">
                                <span>
                                    <timeago :auto-update="60" :since="item.date"></timeago>
                                    <md-tooltip md-direction="bottom">{{ toDate(item.date) }}</md-tooltip>
                                </span>
                            </div>
                        </md-card-header>
                        <md-progress-bar v-else class="md-accent" md-mode="indeterminate" :md-diameter="30" :md-stroke="3"></md-progress-bar>
                        <md-card-content>
                            {{ item.title }}
                            <md-list>
                                <md-list-item v-for="(value, letter, index) in item.answers" v-bind:key="index">
                                    <div class="md-list-item-text">
                                        {{letter.toUpperCase()}}. {{value}}
                                    </div>
                                    <md-button v-if="item.correctAnswer == letter" class="md-icon-button md-list-action">
                                        <md-icon class="md-primary">star</md-icon>
                                        <md-tooltip md-direction="bottom">Respuesta Correcta</md-tooltip>
                                    </md-button>
                                    <md-divider v-if="letter !== 'd'"></md-divider>
                                </md-list-item>
                            </md-list>
                        </md-card-content>
                    </md-card>
                    <infinite-loading @infinite="loadMore" :distance="200"></infinite-loading>

                    <md-progress-spinner class="md-accent" :md-stroke="3" md-mode="indeterminate" v-if="$parent.loading.questions"></md-progress-spinner>
                    <md-button class="md-primary md-raised" v-on:click="$parent.loadMore()" v-if="!loadMoreDisabled">Cargar más</md-button>
                </div>
                <md-empty-state v-else md-icon="question_answer" md-label="Crear preguntas" md-description="Parece ser que no hay ninguna pregunta en este tema">
                </md-empty-state>
            </div>
        </div>
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import moment from 'moment';
import General from '@/mixins/general.js'

import InfiniteLoading from 'vue-infinite-loading';

export default {
    name: 'TopicPage',

    mixins: [General],
    data: () => ({
        showDialog: false
    }),
    components: {
        InfiniteLoading,
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
            return (this.$parent.paging.clone || this.$parent.questions)
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
        loadMore: function ($state) {
            this.$parent.loadMore().then(() => {
                console.log('Load More')
                $state.loaded();
            });

        },
        toDate: function (date) {
            return moment(date).format("MM/DD/YYYY HH:mm")
        }
    }
}
</script>
<style scoped>
form {
  overflow-y: auto;
}

.questionCard {
  margin-bottom: 16px;
}
@media (min-width: 850px) {
  .md-dialog {
    width: 500px;
    max-height: 90%;
  }
}
</style>
