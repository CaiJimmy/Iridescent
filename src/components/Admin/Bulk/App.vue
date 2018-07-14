<template>
    <div class="container extend">
        <div id="mainGrid"
            class="md-layout md-gutter md-layout-column-xsmall md-alignment">

            <!-- Start sidebar -->
            <div class="md-layout-column md-layout-item md-size-30 md-small-size-100">
                <md-card>
                    <md-card-header>
                        <div class="md-title">Filtros</div>
                    </md-card-header>

                    <md-card-content>
                        <md-field>
                            <label for="topic">Tema</label>
                            <md-select v-model="filter.topicID">
                                <md-option :value="0">Cualquier tema</md-option>
                                <md-divider></md-divider>

                                <md-optgroup :label="level.name"
                                    v-for="(level, levelID) in options.levelsAndTopics"
                                    :key="levelID">
                                    <md-option v-for="topic in level.topics"
                                        :key="topic.id"
                                        :value="topic.id">{{ topic.name }}</md-option>
                                </md-optgroup>
                            </md-select>
                        </md-field>

                        <md-field>
                            <label>Autor</label>
                            <md-input v-model="filter.author"
                                placeholder="Introduce el UID del usuario"></md-input>
                        </md-field>

                        <md-field>
                            <label>Visibilidad</label>
                            <md-select v-model="filter.visibility">
                                <md-option value="visible">Visible</md-option>
                                <md-option value="hidden">Oculta</md-option>
                            </md-select>
                        </md-field>

                        <!-- Start datepickers -->
                        <div>
                            <span class="md-caption">Desde</span>
                            <md-datepicker v-model="filter.date.start" />
                        </div>

                        <div>
                            <span class="md-caption">Hasta</span>
                            <md-datepicker v-model="filter.date.end" />
                        </div>
                        <!-- End datepickers -->

                    </md-card-content>

                    <md-card-actions>
                        <md-button class="md-accent">Buscar</md-button>
                    </md-card-actions>
                </md-card>
            </div>

            <!-- End sidebar -->

            <!-- Start result table -->
            <div class="md-layout-column md-layout-item md-size-70 md-small-size-100 md-gutter">

            </div>
            <!-- End result table -->
        </div>
    </div>
</template>

<script>
export default {
    name: 'BulkEdit',
    metaInfo: {
        title: 'Bulk Edit'
    },
    data () {
        return {
            filter: {
                author: null,
                topicID: 0,
                date: {
                    start: null,
                    end: new Date()
                },
                visibility: 'visible'
            },

            options: {
                levelsAndTopics: {

                }
            }
        }
    },
    created () {
        this.buildTopicList();
    },
    methods: {
        buildTopicList () {
            const topics = this.$store.state.topics,
                levels = this.$store.state.levels;

            Object.keys(topics).forEach((topicID) => {

                const topic = topics[topicID];
                if (!this.options.levelsAndTopics.hasOwnProperty(topic.level)) {
                    this.options.levelsAndTopics[topic.level] = {
                        ...levels[topic.level],
                        topics: []
                    };
                };

                this.options.levelsAndTopics[topic.level].topics.push(topic);
            });

        }
    }
}
</script>
<style lang="scss">
/*
    Temporary fix for https://github.com/vuematerial/vue-material/issues/1794
*/
@media (min-width: 601px) {
  .md-datepicker-dialog {
    height: 284px !important;
  }
}
</style>
