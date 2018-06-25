<template>
    <div class="loader-wrapper"
        v-if="loading.questions">
        <md-progress-spinner md-mode="indeterminate"
            :md-diameter="30"
            :md-stroke="3"></md-progress-spinner>
    </div>

    <div v-else>
        <div v-if="questions.length">
            <paginate name="questions"
                :list="questions"
                :per="paging.question_per_page"
                tag="div"
                ref="paginator">
                <div class="questionContainer"
                    v-for="(item) in paginated('questions')"
                    :key="item.id">
                    <question-card :question="item"
                        :snackbar="snackbar"
                        :onUpdate="onUpdate"
                        :showProfile="showProfile" />
                </div>
            </paginate>
            <paginate-links for="questions"
                @change="onPageChange"></paginate-links>
            <span v-if="$refs.paginator">
                Viewing {{$refs.paginator.pageItemsCount}} results
            </span>
        </div>
        <md-empty-state v-else
            md-icon="question_answer"
            md-label="Crear preguntas"
            md-description="Parece ser que no hay ninguna pregunta en este tema">
        </md-empty-state>

        <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>

    </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import QuestionCard from './QuestionCard.vue';
import fetchUserDatas from '@/methods/fetchUserDatas.js';

export default {
    name: 'QuestionList',
    props: ['topicData', 'showProfile'],
    data: () => ({
        questions: [],
        paginate: ['questions'],

        paging: {
            question_per_page: 20, /// Number of questions per page
            loading: false,
            loaded: []
        },

        ref: {
            questions: null,
        },

        loading: {
            questions: true
        },

        snackbar: {
            display: false,
            message: null
        },
    }),
    components: {
        QuestionCard
    },
    watch: {
        "topicData.id" () {
            this.init();
        }
    },
    created () {
        this.init();
    },
    computed: {
        isAdmin () {
            return this.$store.state.user.isAdmin;
        }
    },
    methods: {
        init () {
            console.log(this.topicData);
            if (!this.topicData) {
                return;
            };

            const count = this.topicData.count;

            if (this.isAdmin) {
                this.questions = new Array(count.total).fill({
                    loading: true
                });

                this.ref.questions = firebase.firestore().collection('questions')
                    .where('topic', '==', this.topicData.id)
                    .orderBy("date", 'desc');
            }
            else {
                this.questions = new Array(count.total - count.hidden).fill({
                    loading: true
                });

                this.ref.questions = firebase.firestore().collection('questions')
                    .where('topic', '==', this.topicData.id)
                    .where('hidden', '==', false)
                    .orderBy("date", 'desc');
            };

            this.ref.newQuestions = this.ref.questions.where('date', '>', new Date());
            this.$bind('newQuestions', this.ref.newQuestions);

            this.bindQuestions();
        },
        handleQuestions (ref) {
            return new Promise((resolve, reject) => {
                console.log(ref);
                ref.get().then((documentSnapshots) => {

                    let _questions = [],
                        _index = 0;

                    console.log(documentSnapshots);

                    documentSnapshots.forEach((doc) => {
                        let questionData = doc.data();
                        questionData.id = doc.id;

                        _questions.push(questionData);

                        this.$set(this.questions, _index, {
                            loading: false,
                            ...questionData
                        });
                        _index++;

                        fetchUserDatas(questionData.author);
                    });

                    console.log(_questions);

                    resolve(documentSnapshots);
                });
            });
        },
        bindQuestions () {
            this.onPageChange(0);
        },
        onPageChange (toPage, fromPage) {
            let currentPage = toPage,
                per_page = this.paging.question_per_page,
                startAt = null,
                limit = currentPage * per_page,
                index = per_page * (currentPage - 1);

            if (this.paging.loaded.includes(currentPage)) {
                return;
            };

            if (limit <= 0) {
                limit = per_page;
            };

            if (index < 0) {
                index = 0;
            };

            startAt = this.ref.questions.limit(limit);

            console.log('Limit', limit);
            console.log('Start at index', index);

            this.handleQuestions(startAt, index).then((documentSnapshots) => {
                this.paging.loading = false;
                this.loading.questions = false;


                this.paging.loaded.push(currentPage);
            })
        },
        onUpdate (data) {
            let type = data.type,
                index = -1;

            if (!type) {
                return;
            };

            if (data.question) {
                index = this.questions.findIndex((question) => question.id == data.question.id);
            }
            switch (type) {
                case 'edit':
                    if (index > -1) {
                        this.$set(this.questions, index, data.question)
                    };
                    break;

                case 'delete':
                case 'move':
                    if (index > -1) {
                        this.questions.splice(index, 1);
                    };
            }

        }
    }
}
</script>
<style scoped>
.questionContainer {
  margin-bottom: 16px;
}
</style>
