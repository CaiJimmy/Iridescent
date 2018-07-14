<template>
    <div>
        <md-table v-if="results.length"
            v-model="results"
            md-card
            @md-selected="onSelect">
            <md-table-toolbar>
                <h1 class="md-title">Resultados</h1>
            </md-table-toolbar>

            <md-table-toolbar slot="md-table-alternate-header"
                slot-scope="{ count }">
                <div class="md-toolbar-section-start">{{ getAlternateLabel(count) }}</div>

                <div class="md-toolbar-section-end">
                    <md-button class="md-icon-button">
                        <md-icon>delete</md-icon>
                    </md-button>
                </div>
            </md-table-toolbar>

            <md-table-row slot="md-table-row"
                slot-scope="{ item }"
                md-selectable="multiple"
                md-auto-select>
                <md-table-cell md-label="Title"
                    md-sort-by="title">{{ item.title }}</md-table-cell>
                <md-table-cell md-label="Topic"
                    md-sort-by="topic">{{ getTopicName(item.topic) }}</md-table-cell>
                <md-table-cell md-label="Author"
                    md-sort-by="author">{{ getUserName(item.author) }}</md-table-cell>
                <md-table-cell md-label="Date"
                    md-sort-by="date">
                    <timeago :auto-update="60"
                        :since="item.date"></timeago>
                </md-table-cell>
            </md-table-row>
        </md-table>

        <md-empty-state v-else
            md-icon="search"
            md-label="No hay resultados"
            md-description="Prueba con otros parámetros">
        </md-empty-state>
    </div>
</template>
<script>
export default {
    name: 'BulkEdit-Results',
    props: {
        results: Array
    },
    data: () => ({
        selected: [],
    }),
    methods: {
        getUserName (userID) {
            return this.$store.state.users[userID].displayName;
        },
        getTopicName (topicID) {
            return this.$store.state.topics[topicID].name;
        },
        onSelect (items) {
            this.selected = items
        },
        getAlternateLabel (count) {
            let plural = ''

            if (count > 1) {
                plural = 's'
            }

            return `${count} pregunta${plural} seleccionada`
        }
    }
}
</script>
