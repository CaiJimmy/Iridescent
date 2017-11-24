<template>
    <md-list class="md-elevation-2">
        <div v-for="(level, levelID) in levels" :key="levelID">
            <md-subheader>{{ level.name }}</md-subheader>
            <md-list-item class="md-inset" v-for="(topic, index) in getTopicsByLevel(levelID)" :key="topic.id">
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
            <md-divider></md-divider>
        </div>
    </md-list>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import General from '@/mixins/general.js'

export default {
    name: 'ExploreTopics',
    mixins: [General],
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
        removeTopic (topicID) {
            let savedTopics = this.user.savedTopics,
                index = savedTopics.indexOf(topicID);
            if (index > -1) {
                savedTopics.splice(index, 1);
                this.ref.user.update(this.user);
            }
        },
        saveTopic (topicID) {
            if (!this.user.savedTopics) {
                this.user.savedTopics = [];
            };
            if (!this.user.savedTopics.includes(topicID)) {
                this.user.savedTopics.push(topicID);
                this.ref.user.update(this.user);
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
