<template>
    <div class="loaderWrapper"
        v-if="loading.questions">
        <md-progress-spinner md-mode="indeterminate"
            :md-diameter="30"
            :md-stroke="3"></md-progress-spinner>
    </div>

    <div v-else>
        <div v-if="visibleQuestionCount">

            <NewQuestions :questionsRef="ref.questions"
                :isQuestionDialogActive="isQuestionDialogActive"
                :snackbar="snackbar"
                :showProfile="showProfile" />

            <template v-if="questions.length">
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
            </template>
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
import db from "@/database";
import QuestionCard from './QuestionCard.vue';
import fetchUserDatas from '@/methods/fetchUserDatas.js';
import NewQuestions from './NewQuestions.vue';

export default {
    name: 'QuestionList',
    props: {
        topicData: Object,   /* Passed from Topic/App.vue -> Topic/Home.app though <router-view> */
        showProfile: Function,   /* Function that triggers embed profile */
        isQuestionDialogActive: Boolean
    },
    data: () => ({
        questions: [],  /* Old questions (existed before page loaded) are  stored here */
        paginate: ['questions'],  /* Vue-Paginate config */

        paging: {
            question_per_page: 20,   /* Number of questions per page */
            loading: false, 
            loaded: []   /* Loaded pages, to avoid querying data again */
        },

        ref: {
            questions: null,   /* Old questions Firestore Reference */
        },

        loading: {
            questions: true   /* To display progress spinner */
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
    created () {
        this.init();
    },
    computed: {
        isAdmin () {
            return this.$store.state.user.isAdmin;
        },
        visibleQuestionCount () {
            if (this.isAdmin) {
                return this.topicData.count.total;
            }
            else {
                return this.topicData.count.total - this.topicData.count.hidden;
            }
        }
    },
    methods: {
        init () {
            if (!this.topicData) {
                return;
            }

            const count = this.topicData.count;
            
            if (this.isAdmin) {
                /* 
                    Hidden questions are visible to admins
                */

                /* Fill array with placeholders, to build pagination */
                this.questions = new Array(count.total).fill({
                    loading: true
                });

                this.ref.questions = db.collection('questions')
                    .where('topic', '==', this.topicData.id)
                    .orderBy("date", 'desc');
            }
            else {
                /*
                    For students, they can not see hidden questions
                */

                this.questions = new Array(count.total - count.hidden).fill({
                    loading: true
                });

                this.ref.questions = db.collection('questions')
                    .where('topic', '==', this.topicData.id)
                    .where('hidden', '==', false)
                    .orderBy("date", 'desc');
            }

            /*
                Load questions of first page
            */
            this.onPageChange(0);
        },
        handleQuestions (ref, index = 0) {
            /*
                Fetch questions of given reference
                And if user is admin, query userdata of each question (Check /methods/fetchUserDatas.js)
            */
            return new Promise((resolve, reject) => {
                console.log('Questions reference: ', ref);
                ref.get().then((documentSnapshots) => {

                    let _questions = [],
                        _index = index || 0;

                    console.log('Questions document snapshots: ', documentSnapshots);

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

                    resolve(documentSnapshots);
                });
            });
        },
        async onPageChange (toPage, fromPage) {
            const currentPage = toPage,
                per_page = this.paging.question_per_page;

            let startAfter = null,
                limit = per_page,
                index = per_page * (currentPage - 1),   /* Start after the question before that page */
                startAfterAvailable;

            if (this.paging.loaded.includes(currentPage)) {
                return;
            }

            /* Display progress spinner */
            this.paging.loading = true;

            const questionBefore = this.questions[index - 1];

            if (questionBefore && !questionBefore.loading) {
                /* 
                    If the question before that page is loaded, 
                    we can build it's documentSnapshot to query the following page only
                */

                const questionBeforeRef = db.collection('questions').doc(questionBefore.id),
                    questionBeforeSnapshot = await questionBeforeRef.get();

                startAfter = this.ref.questions.startAfter(questionBeforeSnapshot).limit(per_page);

                if (index < 0) {
                    index = 0;
                }

                startAfterAvailable = true;
            }
            else {
                /* 
                    But if it's not loaded, we'll have to request all questions between first page and current page
                */

                limit = currentPage * per_page;   /* Load all question from first page to current page */

                if (limit <= 0) {
                    /* 
                        Limit can not be less or equal to zero
                        This happend when currentPage == 0 
                    */

                    limit = per_page;
                }

                startAfter = this.ref.questions.limit(limit);
                index = 0;   /* Start loop from first page */

                startAfterAvailable = false;
            }

            console.log('Question request limit: ', limit);
            console.log('Start at index: ', index);

            this.handleQuestions(startAfter, index).then((documentSnapshots) => {
                this.paging.loading = false;
                this.loading.questions = false;

                if (startAfterAvailable) {
                    /*  startAfterAvailable = true
                            => Only requested current page 
                        Add current page to paging.loaded to avoid requesting the data again
                    */
                    this.paging.loaded.push(currentPage);
                }
                else {
                    /* 
                        Request from 0 to current page 
                        Add those pages to paging.loaded 
                    */

                    this.paging.loaded = Array.from(Array(currentPage).keys());
                }

                /* Scroll to the start of list after changed page */
                const questionWrapper = document.getElementById('questionWrapper');
                window.scrollTo(0, questionWrapper.offsetTop - 100);
            })
        },
        onUpdate (data) {
            /*
                Due to the fact that I loaded old questions using .get(), 
                they will not be updated automatically as they are not subscribed to realtime update.
                So I came up with this method that modify question data locally.
                It is passed as a callback to QuestionCard, 
                and run after doing modifications to question, like editing, moving or deleting.
            */

            let type = data.type,   /* Indicates which type of action has done to the question: 'delete', 'move' or 'edit */
                index = -1;

            if (!type) {
                return;
            }

            if (data.question) {
                index = this.questions.findIndex((question) => question.id == data.question.id);
            }
            switch (type) {
                case 'edit':
                    /* Replace old question data with new one, passed as parameter `data.question` */
                    if (index > -1) {
                        this.$set(this.questions, index, data.question)
                    }
                    break;

                case 'delete':
                case 'move':
                    /* Remove question from `questions` array if it has been moved or deleted */

                    if (index > -1) {
                        this.questions.splice(index, 1);
                    }
            }

        }
    }
}
</script>
<style lang="scss">
.questionContainer {
  margin-bottom: 16px;
}

.loaderWrapper {
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
