<template>
    <div>
        <md-progress-bar v-if="loading.metadata"
            class="md-primary"
            md-mode="indeterminate"
            :md-diameter="30"
            :md-stroke="3"></md-progress-bar>

        <div v-if="!loading.metadata">
            <div v-if="notFound"
                class="notFound container">
                <md-card>
                    <md-card-header>
                        <div class="md-title">Topic Not Found</div>
                    </md-card-header>

                    <md-card-content>
                        Look for it on Explore, or double-check your link.
                    </md-card-content>

                    <md-card-actions>
                        <md-button class="md-raised md-primary"
                            v-on:click="$router.push('/')">Back to home</md-button>
                    </md-card-actions>
                </md-card>
            </div>
            <div v-else>
                <TopicHeader :topic="topic"
                    :topicRef="ref.topic" />
                <md-tabs class="md-primary"
                    md-alignment="centered"
                    md-sync-route>
                    <md-tab id="tab-home"
                        md-label="Preguntas"
                        :to="'/t/' + topicID + '/'"></md-tab>
                    <!--<md-tab id="tab-pages"
                        md-label="Examinar"
                        :to="'/t/' + topicID + '/exam/'"></md-tab>-->
                </md-tabs>
                <router-view :topicID="topicID"
                    class="mainContent"
                    :key="$route.name + (topicID|| '')"></router-view>
            </div>
        </div>
        <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>
    </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import TopicHeader from './components/Header.vue';

export default {
    name: 'TopicPage',
    props: ['topicID'],
    components: {
        TopicHeader
    },
    metaInfo () {
        return {
            title: this.topic.name || 'Tema'
        }
    },
    data: () => ({
        notFound: false,

        loading: {
            metadata: true
        },

        snackbar: {
            display: false,
            message: null
        },

        ref: {
            topic: null
        }
    }),
    computed: {
        topic () {
            if (!this.$store.state.loading.topics && this.$store.state.topics.hasOwnProperty(this.topicID)) {  /// If not ready yet, then wait till it's ready, but return .name to avoid error
                return this.$store.state.topics[this.topicID];
            }
            else {
                return {};
            };
        }
    },
    watch: {
        "$store.state.loading.topics": function () {
            if (!this.$store.state.loading.topics) {
                this.bindTopic()
            }
        },
        topicID: function (id) {  /// When topic ID changes, re-render page
            if (this.topicID) {
                this.loading.metadata = true;

                this.notFound = false;
                if (!this.$store.state.loading.topics) {
                    this.bindTopic()
                }
            }
        }
    },
    created: function () {
        this.ref.topic = firebase.firestore().collection('topics').doc(this.topicID);

        if (!this.$store.state.loading.topics) {
            this.bindTopic()
        };
    },
    methods: {
        bindTopic () {
            if (this.$store.state.topics.hasOwnProperty(this.topicID)) {
                this.loading.metadata = false;
                this.$store.commit('setPrimaryColor', this.topic.color);
            }
            else {
                this.loading.metadata = false;
                this.notFound = true;
            };
        }
    }
}
</script>