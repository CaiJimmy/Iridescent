<template>
    <md-list class="md-elevation-2">
        <div v-for="level in levels" :key="level.id">
            <md-subheader>{{ level.name }}</md-subheader>
            <md-list-item class="md-inset" v-for="topic in getTopicsByLevel(level.id)" :key="topic.id">
                <div class="md-list-item-text">
                    <span>{{ topic.name }}</span>
                </div>

                <md-button class="md-icon-button" v-on:click="removeTopic(topic.id)" v-if="savedTopics.includes(topic.id)">
                    <md-icon>close</md-icon>
                </md-button>

                <md-button class="md-icon-button" v-on:click="saveTopic(topic.id)" v-else>
                    <md-icon>add</md-icon>
                </md-button>

            </md-list-item>
        </div>
    </md-list>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export default {
    name: 'ExploreTopics',
    props: ['topics', 'levels', 'firebaseRefs', 'user'],
    computed: {
        savedTopics: function () {
            if (this.user.savedTopics) {
                return this.user.savedTopics;
            }
            else {
                return [];
            }
        }
    },
    methods: {
        getTopicsByLevel (levelId) {
            return this.topics.filter(topic => topic.level == levelId);
        },
        getLevelById (levelId) {
            return this.levels.filter(level => level.id == levelId)[0];
        },
        removeTopic (topicID) {
            let savedTopics = this.user.savedTopics,
                index = savedTopics.indexOf(topicID);
            if (index > -1) {
                savedTopics.splice(index, 1);
                this.firebaseRefs.user.update(this.user);
            }
        },
        saveTopic (topicID) {
            if (!this.user.savedTopics) {
                this.user.savedTopics = [];
            };
            if (!this.user.savedTopics.includes(topicID)) {
                this.user.savedTopics.push(topicID);
                this.firebaseRefs.user.update(this.user);
            };
        }
    }
}
</script>
<style scoped>
.md-list {
  overflow-y: auto !important;
}
</style>
