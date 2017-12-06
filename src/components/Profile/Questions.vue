<template>
    <div class="container extend mainContent">
        <md-toolbar class="md-primary filterMessage"
            v-if="filter.selected"
            md-elevation="1">
            <h3 class="md-title"
                style="flex: 1">{{ filteredQuestions.length }} preguntas bajo el tema de
                <strong>{{ $store.state.topics[filter.selected].name }}</strong>
            </h3>
            <md-button class="md-primary"
                @click="$router.push('/t/' + filter.selected)"
                v-if="!embed">Ir al tema</md-button>
            <md-button @click="filter.selected = null">Mostrar todas</md-button>
        </md-toolbar>
        <div class="md-layout md-gutter md-layout-column-xsmall md-alignment ">
            <div class="md-layout-column md-layout-item md-size-25 md-small-size-100 sidebar">
                <div class="loader-wrapper"
                    v-if="loading">
                    <md-progress-spinner md-mode="indeterminate"
                        :md-diameter="30"
                        :md-stroke="3"></md-progress-spinner>
                </div>
                <div v-else>
                    <md-card v-if="questions.length">
                        <md-list>
                            <md-subheader class="md-primary">Filtrar por temas</md-subheader>
                            <div v-for="level in filter.options"
                                :key="level.id">
                                <md-subheader>{{ level.name }}</md-subheader>
                                <md-list-item v-for="topic in level.topics"
                                    :key="topic.id">
                                    <md-radio v-model="filter.selected"
                                        :value="topic.id" />
                                    <span class="md-list-item-text topicName">{{ topic.name }}</span>
                                </md-list-item>
                            </div>
                        </md-list>
                    </md-card>
                </div>
            </div>

            <div class="md-layout-column md-layout-item md-size-75 md-small-size-100 md-gutter">
                <div class="loader-wrapper"
                    v-if="loading">
                    <md-progress-spinner md-mode="indeterminate"
                        :md-diameter="30"
                        :md-stroke="3"></md-progress-spinner>
                </div>

                <div v-else>
                    <div v-if="questions.length">
                        <div class="questionContainer"
                            v-for="(item, index) in paginatedQuestions"
                            :key="item.id">
                            <question-card :question="item"
                                :snackbar="snackbar" />
                        </div>
                        <mugen-scroll :handler="loadMore"
                            :should-handle="!loadMoreDisabled">
                            <div class="loader-wrapper"
                                v-if="!loadMoreDisabled">
                                <md-progress-spinner :md-diameter="30"
                                    :md-stroke="3"
                                    md-mode="indeterminate"></md-progress-spinner>
                            </div>
                            <span class="endOfPage"
                                v-if="paging.end">Todas las preguntas han sido cargadas</span>
                        </mugen-scroll>
                    </div>
                    <md-empty-state v-else
                        md-icon="question_answer"
                        md-label="Nothing..."
                        md-description="El usuario no ha publicado ninguna pregunta">
                    </md-empty-state>
                </div>
            </div>
        </div>
        <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import QuestionCard from './QuestionCard.vue';
import MugenScroll from 'vue-mugen-scroll';

export default {
    props: ['user', 'embed', 'topicID'],
    components: {
        QuestionCard,
        MugenScroll
    },
    data () {
        return {
            questions: [],
            loading: true,
            paging: {
                current: 1,/// Current Page
                question_per_page: 20, /// Number of questions per page
                end: false,
                loading: false,
            },
            filter: {
                selected: null,
                options: {}
            },
            snackbar: {
                display: false,
                message: null
            },
        }
    },
    created () {
        this.bindQuestions();
    },
    watch: {
        questions: function () {
            if (this.questions.length && !this.loading) {
                this.buildFilter();/// Rebuild the filter when question list updates
            }
        },
        "filter.selected": function () {
            this.paging.end = false;
            this.paging.current = 1;

            if (!this.embed) {
                if (this.filter.selected) {
                    this.$router.replace({
                        query: {
                            topic: this.filter.selected
                        }
                    })
                }
                else {
                    this.$router.replace({   /// Remove query string if there's no selected topic
                        query: {}
                    })
                }
            }
        },
        "$route.query.topic": function () {
            if (this.$store.state.topics.hasOwnProperty(this.$route.query.topic)) {
                this.filter.selected = this.$route.query.topic;
            } else {
                this.$router.replace({   /// Remove query string if there's no such topic
                    query: {}
                })
            }
        }
    },
    computed: {
        paginatedQuestions: function () {
            return this.filteredQuestions.slice(0, this.paging.question_per_page * this.paging.current);
        },
        filteredQuestions: function () {
            if (this.filter.selected) {
                return this.questions.filter((question) => {
                    return question.topic == this.filter.selected
                })
            } else {
                return this.questions;
            }
        },
        loadMoreDisabled: function () {
            return this.paging.loading | this.paging.end;
        },
    },
    methods: {
        bindQuestions () {
            this.$bind('questions', firebase.firestore().collection('questions').where('author', '==', this.user.uid).orderBy("date", 'desc')).then(() => {
                this.buildFilter().then(() => { /// Rebuild the filter when question list updates
                    let topicID = this.topicID || this.$route.query.topic;

                    if (topicID) {
                        this.filter.selected = topicID;
                    };
                    this.loading = false;
                });
            })
        },
        buildFilter () {
            return new Promise((resolve, reject) => {
                this.questions.forEach((question) => {
                    let topicID = question.topic,
                        topicData = this.$store.state.topics[topicID];

                    if (!topicData) {
                        return;
                    };

                    let levelID = topicData.level;

                    if (!this.filter.options[levelID]) {
                        this.filter.options[levelID] = this.$store.state.levels[levelID];
                        this.filter.options[levelID].id = levelID;
                        this.filter.options[levelID].topics = [];
                        this.filter.options[levelID].topics.push(topicData);
                    }
                    else {
                        if (!this.filter.options[levelID].topics.includes(topicData)) {
                            this.filter.options[levelID].topics.push(topicData);
                        }
                    }
                });

                resolve();
            });
        },
        loadMore () {
            if (this.paging.end) {
                return;
            };

            if (this.paging.question_per_page * this.paging.current >= this.questions.length) {
                this.paging.end = true;
                return;
            };

            this.paging.current += 1;
        },
    }
}
</script>

<style lang="scss" scoped>
.loader-wrapper {
	text-align: center;
}
.questionContainer {
	margin-bottom: 16px;
}

.mainContent {
	margin: 2em auto;
}
.filterMessage {
	margin-bottom: 2em;
}
.endOfPage {
	text-align: center;
	display: block;
	color: #999;
}

.topicName {
	white-space: normal;
}
</style>
