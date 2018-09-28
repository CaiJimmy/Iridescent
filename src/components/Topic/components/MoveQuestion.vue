<template>
    <md-card>
        <md-card-header>
            <div class="md-title">Mover la pregunta</div>
            <div class="md-subhead">{{ questionData.title }}</div>
        </md-card-header>
        <md-card-content>
            <md-list>
                <div v-for="level in arrayLevels"
                    :key="level.id">
                    <div v-if="getTopicsByLevel(level.id).length">
                        <md-subheader>{{ level.name }}</md-subheader>
                        <md-list-item v-for="topic in getTopicsByLevel(level.id)"
                            :key="topic.id">
                            <md-radio v-model="selected"
                                :value="topic.id" />
                            <span class="md-list-item-text">{{ topic.name }}</span>
                        </md-list-item>
                    </div>
                </div>
            </md-list>
            <md-checkbox v-model="confirmed"
                v-if="selected !== currentTopicID">
                <span v-html="confirmText"></span>
            </md-checkbox>
        </md-card-content>
        <md-card-actions>
            <md-button class="md-accent"
                @click="moveQuestion()"
                :disabled="!confirmed">Procesar</md-button>
            <md-button class="md-primary"
                @click="exitMoving()">Cancelar</md-button>
        </md-card-actions>
    </md-card>
</template>
<script>
import db from '@/database';

export default {
    props: ['questionID', 'currentTopicID', 'authorData', 'questionData', 'snackbar', 'callback', 'exitMoving'],
    data () {
        return {
            selected: null,
            confirmed: false
        }
    },
    created () {
        this.selected = this.currentTopicID;
    },
    computed: {
        confirmText () {
            let oldTopicName = this.$store.state.topics[this.currentTopicID].name,
                newTopicName = this.$store.state.topics[this.selected].name,
                authorName = this.authorData.displayName,
                questionTitle = this.questionData.title;
            return `Mover la pregunta <strong>${questionTitle}</strong>, publicada por <strong>${authorName}</strong>, desde el tema de <strong>${oldTopicName}</strong> al tema de <strong>${newTopicName}</strong>?`;
        },
        levels () {
            return this.$store.state.levels;
        },
        topics () {
            return this.$store.state.topics;
        },
        arrayLevels () {
            let array = [];
            for (let value in this.levels) {
                let item = this.levels[value];
                item.id = value;
                array.push(item);
            };
            return array;
        }
    },
    methods: {
        moveQuestion (topicID) {
            db.collection('questions').doc(this.questionID).set({
                'topic': this.selected
            }, {
                    merge: true
                }).then(() => {
                    this.snackbar.message = 'Pregunda movida';
                    this.snackbar.display = true;
                    if (this.callback) {
                        this.callback(this.questionData);
                    }
                });
        },
        getTopicsByLevel (levelId) {
            let topics = Object.keys(this.topics).map((k) => this.topics[k])  /// Transform state.topics (object) to an array, to use filter() method

            return topics.filter(topic => topic.level == levelId);
        }
    }
}
</script>
