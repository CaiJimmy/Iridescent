<template>
    <div class="loaderWrapper"
        v-if="loading.questions">
        <md-progress-spinner md-mode="indeterminate"
            :md-diameter="30"
            :md-stroke="3"></md-progress-spinner>
    </div>

    <div v-else>
        <div v-if="questions.length">

            <NewQuestions :questionsRef="ref.questions"
                :isQuestionDialogActive="isQuestionDialogActive"
                :snackbar="snackbar"
                :showProfile="showProfile" />

            <paginate name="questions"
                :list="questions"
                :per="paging.question_per_page"
                tag="div"
                ref="paginator"
                id="questionWrapper">

                <div class="loaderWrapper"
                    v-if="paging.loading">
                    <md-progress-spinner md-mode="indeterminate"
                        :md-diameter="30"
                        :md-stroke="3"></md-progress-spinner>
                </div>

                <div class="questionContainer"
                    v-for="(item) in paginated('questions')"
                    :key="item.id">
                    <question-card v-if="!item.loading"
                        :question="item"
                        :snackbar="snackbar"
                        :onUpdate="onUpdate"
                        :showProfile="showProfile" />
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
import NewQuestions from './NewQuestions.vue';

export default {
    name: 'QuestionList',
    props: ['topicData', 'showProfile', 'isQuestionDialogActive'],
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
        QuestionCard,
        NewQuestions
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

            this.bindQuestions();
        },
        handleQuestions (ref, index = 0) {
            return new Promise((resolve, reject) => {
                console.log(ref);
                ref.get().then((documentSnapshots) => {

                    let _questions = [],
                        _index = index || 0;

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
        async onPageChange (toPage, fromPage) {
            let currentPage = toPage,
                per_page = this.paging.question_per_page,
                startAt = null,
                limit = currentPage * per_page,
                index = per_page * (currentPage - 1);

            if (this.paging.loaded.includes(currentPage)) {
                return;
            };

            /* Display progress spinner */
            this.paging.loading = true;

            if (limit <= 0) {
                limit = per_page;
            };

            if (index < 0) {
                index = 0;
            };

            let questionBefore = this.questions[index - 1];

            console.log('questionBeforeIndex', index - 1);
            console.log('questionBefore', questionBefore)

            if (questionBefore && !questionBefore.loading) {
                /* 
                    If the question before that page is loaded, 
                    we can build it's documentSnapshot to query the following page only
                */

                let questionBeforeRef = firebase.firestore().collection('questions').doc(questionBefore.id);
                console.log(questionBeforeRef);

                let questionBeforeSnapshot = await questionBeforeRef.get();
                startAt = this.ref.questions.startAfter(questionBeforeSnapshot).limit(per_page);
            }
            else {
                /* 
                    But if it's not loaded, we'll have to request all questions between first page and current page
                */

                startAt = this.ref.questions.limit(limit);
                index = 0;
            }

            console.log('Limit', limit);
            console.log('Start at index', index);

            this.handleQuestions(startAt, index).then((documentSnapshots) => {
                this.paging.loading = false;
                this.loading.questions = false;

                /* Add current page to paging.loaded to avoid requesting the data again */
                this.paging.loaded.push(currentPage);

                /* Scroll to the start of list after changed page */
                const questionWrapper = document.getElementById('questionWrapper');
                window.scrollTo(0, questionWrapper.offsetTop - 60);
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
<style lang="scss">
.questionContainer {
  margin-bottom: 16px;
}

.loaderWrapper{
    display: flex;
    margin: 1em 0;
    justify-content: center;
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
