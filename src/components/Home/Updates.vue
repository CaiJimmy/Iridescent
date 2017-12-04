<template>
    <md-list class="md-triple-line">
        <md-subheader>Ultimas actualizaciones</md-subheader>
        <div v-for="(item, index) in updates"
            :key="item.id">
            <md-list-item>
                <md-avatar v-if="users.hasOwnProperty(item.author) && !users[item.author].loading">
                    <img :src="users[item.author].photoURL"
                        :alt="users[item.author].displayName">
                </md-avatar>

                <div class="md-list-item-text">
                    <span>{{ users[item.author].displayName }}</span>
                    <span>{{ topics[item.topic.id].name }}</span>
                    <p>{{ item.title.slice(0, 10) }}</p>
                </div>
            </md-list-item>
            <md-divider class="md-inset"
                v-if="index !== updates.length - 1"></md-divider>
        </div>
    </md-list>
</template>
<script>
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import fetchUserDatas from '@/mixins/fetchUserDatas.js';

export default {
    computed: {
        users () {
            return this.$store.state.users;
        },
        topics () {
            return this.$store.state.topics
        },
        updates () {
            let updatesObject = this.$store.state.updates;
            let updatesArray = [];
            for (let value in updatesObject) {
                let item = updatesObject[value];
                item.id = value;
                updatesArray.push(item);
            };
            return updatesArray;
        },
        loading () {
            return this.$store.state.loading;
        }
    },
    watch: {
        updates: function () {
            fetchUserDatas(this.updates);
        },
    }
}
</script>
