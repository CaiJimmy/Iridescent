<template>
    <md-card>
        <md-progress-bar md-mode="indeterminate"
            class="md-accent"
            v-if="loading"></md-progress-bar>

        <md-card-header>
            <div class="md-title">Filtros</div>
        </md-card-header>

        <md-card-content>
            <md-field>
                <label for="topic">Tema</label>
                <md-select v-model="filter.topicID">
                    <md-option :value="0">Cualquier tema</md-option>
                    <md-divider></md-divider>

                    <md-optgroup :label="level.name"
                        v-for="(level, levelID) in options.levelsAndTopics"
                        :key="levelID">
                        <md-option v-for="topic in level.topics"
                            :key="topic.id"
                            :value="topic.id">{{ topic.name }}</md-option>
                    </md-optgroup>
                </md-select>
            </md-field>

            <md-field>
                <label>Autor</label>
                <md-input v-model="filter.author"
                    placeholder="Introduce el UID del usuario"></md-input>
            </md-field>

            <md-field>
                <label>Visibilidad</label>
                <md-select v-model="filter.visibility">
                    <md-option value="visible">Visible</md-option>
                    <md-option value="hidden">Oculta</md-option>
                </md-select>
            </md-field>

            <!-- Start datepickers -->
            <div>
                <span class="md-caption">Desde</span>
                <md-datepicker v-model="filter.date.start"
                    :md-disabled-dates="disabledDates" />
            </div>

            <div>
                <span class="md-caption">Hasta</span>
                <md-datepicker v-model="filter.date.end"
                    :md-disabled-dates="disabledDates" />
            </div>
            <!-- End datepickers -->

        </md-card-content>

        <md-card-actions>
            <md-button class="md-accent"
                v-on:click="doSearch()"
                :disabled="loading">Buscar</md-button>
        </md-card-actions>
    </md-card>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import fetchUserDatas from '@/methods/fetchUserDatas.js';

export default {
    name: 'BulkEdit-Filter',
    data () {
        return {
            filter: {
                author: null,
                topicID: 0,
                date: {
                    start: null,
                    end: new Date()
                },
                visibility: 'visible'
            },

            options: {
                levelsAndTopics: {

                }
            },

            disabledDates: date => {
                /* Disable future dates */

                return date > new Date();
            },

            loading: false
        }
    },
    created () {
        this.buildTopicList();
    },
    methods: {
        doSearch () {
            let _results = [];

            this.loading = true;

            this.buildQuery().get().then(documentSnapshots => {
                documentSnapshots.forEach((doc) => {
                    let questionData = doc.data();
                    questionData.id = doc.id;

                    _results.push(questionData);

                    fetchUserDatas(questionData.author);
                });

                this.$emit('results', _results);

                this.loading = false;
            })
        },
        buildQuery () {
            let query = firebase.firestore().collection('questions');

            if (this.filter.topicID !== 0) {
                query = query.where('topic', '==', this.filter.topicID);
            };

            if (this.filter.author) {
                query = query.where('author', '==', this.filter.author);
            };

            if (this.filter.date.start) {
                query = query.where('date', '>=', this.filter.date.start);
            };

            if (this.filter.date.end) {
                query = query.where('date', '<=', new Date(this.filter.date.end.setHours(23, 59, 59, 999)));
            }

            if (this.filter.visibility == 'hidden') {
                query = query.where('hidden', '==', true);
            }
            else {
                query = query.where('hidden', '==', false);
            };

            return query;
        },
        buildTopicList () {
            const topics = this.$store.state.topics,
                levels = this.$store.state.levels;

            Object.keys(topics).forEach((topicID) => {

                const topic = topics[topicID];
                if (!this.options.levelsAndTopics.hasOwnProperty(topic.level)) {
                    this.options.levelsAndTopics[topic.level] = {
                        ...levels[topic.level],
                        topics: []
                    };
                };

                this.options.levelsAndTopics[topic.level].topics.push(topic);
            });

        }
    }
}
</script>

<style lang="scss">
/*
    Temporary fix for https://github.com/vuematerial/vue-material/issues/1794
*/
@media (min-width: 601px) {
  .md-datepicker-dialog {
    height: 284px !important;
  }
}
</style>
