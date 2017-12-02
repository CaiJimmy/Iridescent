<template>
    <md-list class="md-elevation-2">
        <div v-for="(level, index) in arrayLevels"
            :key="level.id">
            <md-subheader>{{ level.name }}</md-subheader>
            <md-list-item class="md-inset"
                v-for="(topic, index) in getTopicsByLevel(level.id)"
                :key="topic.id">
                <div class="md-list-item-text">
                    <span>{{ topic.name }}</span>
                </div>

                <md-button class="md-icon-button"
                    v-on:click="removeTopic(topic.id)"
                    v-if="savedTopics.includes(topic.id)">
                    <md-icon>close</md-icon>
                </md-button>

                <md-button class="md-icon-button"
                    v-on:click="saveTopic(topic.id)"
                    v-else>
                    <md-icon>add</md-icon>
                </md-button>
            </md-list-item>
            <md-divider v-if="index !== arrayLevels.length - 1"></md-divider>
        </div>
    </md-list>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import General from '@/mixins/general.js'
import Methods from './Methods.js'
export default {
    name: 'ExploreTopics',
    mixins: [General, Methods],
    computed: {
        savedTopics: function () {
            if (this.user.savedTopics) {
                return this.user.savedTopics;
            }
            else {
                return [];
            }
        },
        arrayLevels(){
            let array = [];
            for(let value in this.levels){
                let item = this.levels[value];
                item.id = value;
                array.push(item);
            };
            return array;
        }
    }
}
</script>
<style scoped>
.md-list {
  overflow-y: auto !important;
}
</style>
