<template>
    <div>
        <header class="topicHeader">
            <md-progress-spinner v-if="loading.metadata" class="md-accent" md-mode="indeterminate" :md-diameter="30" :md-stroke="3"></md-progress-spinner>
            <div v-else>
                <div class="topicHeader--image" v-if="topic.image" :style="'background-image: url(' + topic.image + ')'"></div>
                <section class="topicHeader--meta">
                    <h1 class="md-title">{{ topic.name }}</h1>
                    <h2>{{ topic.description }}</h2>
                </section>
            </div>
        </header>

        <md-tabs md-sync-route class="md-primary" md-alignment="centered">
            <md-tab id="tab-home" md-label="Inicio" :to="'/t/' + $route.params.id + '/'"></md-tab>
            <md-tab id="tab-posts" md-label="Enviar" :to="'/t/' + $route.params.id + '/send'"></md-tab>
        </md-tabs>

        <router-view class="mainContent"></router-view>

        <div class="questionsList container">
            <md-snackbar :md-active.sync="snackbar.display">{{ snackbar.message }}</md-snackbar>
        </div>
    </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

export default {
    name: 'TopicPage',
    data: () => ({
        topic: {
            name: null,
            description: null,
            image: null
        },

        loading: {
            metadata: true
        },

        ref: {
            topic: null,
            questions: null
        },

        snackbar: {
            display: false,
            message: null
        }
    }),
    computed: {
        user: () => {
            return firebase.auth().currentUser;
        }
    },
    watch: {
        topic: function () {
            if (this.topic.name !== null) {
                this.loading.metadata = false;
            }
        }
    },
    created: function () {
        this.ref.topic = firebase.firestore().collection('topics').doc(this.$route.params.id);
        this.ref.topic.get().then((data) => {
            if (data.exists) {
                this.$bind('topic', this.ref.topic);

                this.ref.questions = firebase.firestore().collection('questions');
            }
            else {
                this.$router.replace('/');
            }
        })
    }
}
</script>

<style lang="scss" scoped>
.topicHeader {
  height: 50vh;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
  .topicHeader--image {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }
  .topicHeader--meta {
    z-index: 2;
    position: relative;
    padding: 0 25px;

    h1 {
      color: #fff;
      font-size: 3em;
    }

    h2 {
      color: #e1e1e1;
      font-size: 1.5em;
      line-height: 1.5;
      font-weight: lighter;
    }
  }
}

.mainContent{
    margin: 2em auto;
}
</style>
