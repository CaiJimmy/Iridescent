<template>
    <md-table v-model="searched" md-sort="name" md-sort-order="asc" md-card md-fixed-header>
        <md-table-toolbar>
            <div class="md-toolbar-section-start">
                <h1 class="md-title">Temas</h1>
            </div>

            <md-field md-clearable class="md-toolbar-section-end">
                <md-input placeholder="Buscar..." v-model="search" @input="searchOnTable" />
            </md-field>
        </md-table-toolbar>

        <md-table-empty-state md-label="Nope" :md-description="`No hay tema relacionado con la palabra '${search}'. Intenta de nuevo.`">
        </md-table-empty-state>

        <md-table-row slot="md-table-row" slot-scope="{ item }">
            <md-table-cell md-label="Tema" md-sort-by="name">{{ item.name }}</md-table-cell>
            <md-table-cell md-label="Nivel" md-sort-by="level">{{ getLevelById(item.level).name }}</md-table-cell>
            <md-table-cell>

                <md-button class="md-icon-button" v-on:click="removeTopic(item.id)" v-if="savedTopics.includes(item.id)">
                    <md-icon>close</md-icon>
                </md-button>

                <md-button class="md-icon-button" v-on:click="saveTopic(item.id)" v-else>
                    <md-icon>add</md-icon>
                </md-button>
            </md-table-cell>
        </md-table-row>
    </md-table>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';


const toLower = text => {
    return text.toString().toLowerCase()
};

const searchByName = (items, term) => {
    if (term) {
        return items.filter(item => toLower(item.name).includes(toLower(term)))
    }
    return items
};

export default {
    name: 'ExploreTopics',
    data () {
        return {
            search: null,
            searched: [],
            topics: [],
            levels: [],

            user: {},

            ref: {
                user: null,
                topics: null,
                levels: null
            }
        }
    },
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

    created: function () {
        let userID = firebase.auth().currentUser.uid;
        this.ref.user = firebase.firestore().collection("users").doc(userID);
        this.$bind("user", this.ref.user);

        this.ref.topics = firebase.firestore().collection("topics");
        this.$bind("topics", this.ref.topics);
        this.searched = this.topics;

        this.ref.levels = firebase.firestore().collection("levels");
        this.$bind("levels", this.ref.levels);
    },
    methods: {
        searchOnTable () {
            this.searched = searchByName(this.topics, this.search)
        },
        getLevelById (levelId) {
            return this.levels.filter(level => level.id == levelId)[0];
        },
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
