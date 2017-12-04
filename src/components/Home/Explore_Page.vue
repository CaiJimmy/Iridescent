<template>
    <div class="explore">
        <md-progress-bar class="md-primary"
            md-mode="indeterminate"
            v-if="loading"></md-progress-bar>

        <div v-for="(level, index) in arrayLevels"
            v-else
            :key="level.id"
            class="container extend">
            <div v-if="getTopicsByLevel(level.id).length"
                class="levelWrapper md-layout md-gutter md-layout-column-xsmall md-alignment">
                <!-- Hide empty levels -->
                <div class="md-layout-column md-layout-item md-size-15 md-small-size-100">
                    <h3 class="levelName">{{ level.name }}</h3>
                </div>
                <div class="topicCards--wrapper md-layout-column md-layout-item md-size-85 md-small-size-100 md-gutter">
                    <div class="md-layout-item md-size-50 md-small-size-100 md-gutter"
                        v-for="(topic, index) in getTopicsByLevel(level.id)"
                        :key="topic.id">
                        <TopicCard :topic="topic"
                            :topicID="topic.id"
                            :action="'save'" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import TopicCard from './TopicCard.vue'
import General from '@/mixins/general.js'
export default {
    name: 'Explore_Page',
    components: {
        TopicCard
    },
    metaInfo: {
        title: 'Explorar'
    },
    mixins: [General],
    computed: {
        loading: function () {
            return this.$store.state.loading.levels | this.$store.state.loading.topics;
        },
        savedTopics: function () {
            if (this.user.savedTopics) {
                return this.user.savedTopics;
            }
            else {
                return [];
            }
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
    }
}
</script>
<style lang="scss" scoped>
.levelWrapper {
	&:first-child {
		margin-top: 1em;
	}
	.levelName {
		font-weight: lighter;
		color: #999;
		font-size: 20px;
	}
}

.topicCards--wrapper {
	flex-direction: row;

	.topicCards--grid {
		margin: 10px;
	}
}
</style>
