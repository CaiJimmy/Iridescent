<template>
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

        <md-button class="md-primary"
            :disabled="selected == currentTopicID"
            v-on:click="confirmDialog = true">Mover</md-button>

        <md-dialog :md-active.sync="confirmDialog" :md-fullscreen="false">
            <md-dialog-title>Confirmación</md-dialog-title>
            <div class="md-dialog-content" v-html="confirmText"></div>
            <md-dialog-actions>
                <md-button class="md-accent"
                    @click="moveQuestion()">Procesar</md-button>
                <md-button class="md-primary"
                    @click="confirmDialog = false">Cancelar</md-button>
            </md-dialog-actions>
        </md-dialog>
    </md-list>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";

export default {
    props: ['questionID', 'currentTopicID', 'authorData', 'questionData', 'snackbar', 'callback'],
    data () {
        return {
            selected: null,
            confirmDialog: false
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
            firebase.firestore().collection('questions').doc(this.questionID).set({
                'topic': this.selected
            }, {
                merge: true
            }).then(()=>{
                this.snackbar.message = 'Pregunda movida';
                this.snackbar.display = true;
                if(this.callback){
                    this.callback();
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
