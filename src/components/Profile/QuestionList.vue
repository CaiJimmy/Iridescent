<template>
    <div class="container extend mainContent">
        <!-- Filter message start -->
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
        <!-- Filter message end -->

        <!-- Start grid -->
        <div class="md-layout md-gutter md-layout-column-xsmall md-alignment">

            <!-- Start left side: Sidebar -->
            <div class="md-layout-column md-layout-item md-size-25 md-small-size-100 sidebar">

                <!-- Display progress spinner while loading questions -->
                <div class="loader-wrapper"
                    v-if="loading">
                    <md-progress-spinner md-mode="indeterminate"
                        :md-diameter="30"
                        :md-stroke="3"></md-progress-spinner>
                </div>

                <div v-else>
                    <!-- Start filter options card -->
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
                    <!-- End filter options card -->
                </div>

            </div>
            <!-- End left side: Sidebar -->

            <!-- Start right side: Question List -->
            <div class="md-layout-column md-layout-item md-size-75 md-small-size-100 md-gutter">

                <!-- Display progress spinner while loading questions -->
                <div class="loader-wrapper"
                    v-if="loading">
                    <md-progress-spinner md-mode="indeterminate"
                        :md-diameter="30"
                        :md-stroke="3"></md-progress-spinner>
                </div>

                <template v-else>
                    <template v-if="questions.length">

                        <!-- Start pagination -->
                        <paginate name="questions"
                            :list="filteredQuestions"
                            :per="question_per_page"
                            tag="div"
                            ref="paginator"
                            id="questionWrapper">

                            <div class="questionContainer"
                                v-for="(item) in paginated('questions')"
                                :key="item.id">
                                <question-card v-if="!item.loading"
                                    :question="item"
                                    :snackbar="snackbar"
                                    :isProfile="true" />
                            </div>
                        </paginate>
                        <div class="pagination md-elevation-1">
                            <paginate-links for="questions"
                                @change="onPageChange"
                                :limit="2"></paginate-links>
                            <p class="pagination-indicator"
                                v-if="$refs.paginator">
                                Viewing {{$refs.paginator.pageItemsCount}} results
                            </p>
                        </div>
                        <!-- End pagination -->

                    </template>

                    <!-- If user has not published any question -->
                    <md-empty-state v-else
                        md-icon="question_answer"
                        md-label="Nothing..."
                        md-description="El usuario no ha publicado ninguna pregunta">
                    </md-empty-state>
                </template>
            </div>
        </div>
        <!-- End grid -->
        <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>
    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import QuestionCard from '@/components/Topic/components/QuestionCard.vue';

export default {
    props: ['user', 'embed', 'topicID'],
    props: {
        user: Object,     /* User data passed from Profile/App.vue */
        embed: Boolean,   /* Is embed on topic page or not */
        topicID: String   /* Display by default questions under that topic */
    },
    components: {
        QuestionCard
    },
    data () {
        return {
            questions: [],    /* Questions published by user */
            loading: true,

            paginate: ['questions'],   /* Vue-Paginate config */
            question_per_page: 20,   /* Number of questions per page */

            filter: {
                selected: null,   /* Which topic's question should display */
                options: {}   /* Show available topics */
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
        questions () {
            if (this.questions.length && !this.loading) {
                /* Rebuild the filter when question list updates */
                this.buildFilter();
            }
        },
        "filter.selected" () {
            if (!this.embed) {
                /* 
                    Update URL query if it is not embedded on topic page 
                */
                if (this.filter.selected) {
                    /*
                        Add query string if a topic is selected
                    */
                    this.$router.replace({
                        query: {
                            topic: this.filter.selected
                        }
                    })
                }
                else {
                    /* 
                        Remove query string if there's no selected topic
                    */
                    this.$router.replace({
                        query: {}
                    })
                }
            }
        },
        "$route.query.topic" () {
            /*
                Check if topicID from query string exists
            */
            if (this.$store.state.topics.hasOwnProperty(this.$route.query.topic)) {
                /*
                    If topic ID is valid, select it
                */
                this.filter.selected = this.$route.query.topic;
            } else {
                /*
                    Remove query string if there's no such topic
                */
                this.$router.replace({
                    query: {}
                })
            }
        }
    },
    computed: {
        filteredQuestions () {
            /*
                Build filtered question array
            */
            if (this.filter.selected) {
                return this.questions.filter((question) => {
                    return question.topic == this.filter.selected
                })
            } else {
                return this.questions;
            }
        },
    },
    methods: {
        onPageChange (toPage, fromPage) {
            const questionWrapper = document.getElementById('questionWrapper');
            window.scrollTo(0, questionWrapper.offsetTop - 100);
        },
        bindQuestions () {
            const questionRef = firebase.firestore().collection('questions')
                .where('author', '==', this.user.uid)
                .orderBy("date", 'desc');

            /* Download questions and subscribe to real time updates */
            this.$bind('questions', questionRef).then(() => {
                /* Once downloaded, start to build filter options */
                this.buildFilter().then(() => { 
                    const topicID = this.topicID || this.$route.query.topic;

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
                    const topicID = question.topic,   /* Topic that current question belongs to */
                        topicData = this.$store.state.topics[topicID];

                    if (!topicData) {
                        /*
                            Before loading this component, all topics data should be loaded. (Logic on Profile/App.vue)
                            So, if that topic's data can not be found, means that topic ID is not valid.
                        */
                        return;
                    };

                    const levelID = topicData.level;

                    if (!this.filter.options[levelID]) {
                        /* 
                            If this level has not been added yet to options, add it.
                        */
                        this.filter.options[levelID] = this.$store.state.levels[levelID];   /* Copy level data from $store.state */
                        this.filter.options[levelID].id = levelID;
                        this.filter.options[levelID].topics = [];   /* Create a array of child topics */
                        this.filter.options[levelID].topics.push(topicData);
                    }
                    else {
                        /* 
                            This level has already been added to options.
                        */
                        if (!this.filter.options[levelID].topics.includes(topicData)) {
                            /*
                                If this topic has not been added yet to options, add it.
                            */
                            this.filter.options[levelID].topics.push(topicData);
                        }
                    }
                });

                resolve();
            });
        }
    }
}
</script>

<style lang="scss">
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

.sidebar {
  margin-bottom: 1em;
}

.pagination {
  background: #fff;
  .pagination-indicator {
    padding: 15px;
    text-align: center;
    display: block;
    margin: 0;
    border-top: 1px solid #e1e1e1;
    color: #999;
  }
}
ul.paginate-links {
  padding: 0;
  margin: 0;
  list-style: none;
  background: #fff;
  display: flex;
  & > li {
    display: flex;
    flex: 1;
    a {
      flex: 1;
      text-align: center;
      padding: 15px;
      font-size: 1em;
      border-right: 1px solid #e1e1e1;
      cursor: pointer;
    }

    &.active {
      a {
        background: #00bfa5;
        background: var(--md-theme-default-primary-on-background, #00bfa5);
        color: #fff;
        border-right: 0;

        &:hover {
          color: #fff;
        }
      }
    }
  }
}
</style>
