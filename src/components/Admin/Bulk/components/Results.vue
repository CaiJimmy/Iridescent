<template>
    <div>
        <md-table v-if="results.length"
            v-model="results"
            md-card
            @md-selected="onSelect">
            <md-table-toolbar>
                <h1 class="md-title">{{ results.length }} Resultados</h1>
            </md-table-toolbar>

            <md-table-toolbar slot="md-table-alternate-header"
                slot-scope="{ count }">
                <div class="md-toolbar-section-start">{{ getAlternateLabel(count) }}</div>

                <div class="md-toolbar-section-end">
                    <md-button class="md-icon-button"
                        v-on:click="bulkAction('delete')">
                        <md-icon>delete</md-icon>
                        <md-tooltip md-direction="bottom">{{ actionName.delete }}</md-tooltip>
                    </md-button>

                    <md-button class="md-icon-button"
                        v-on:click="bulkAction('show')">
                        <md-icon>visibility</md-icon>
                        <md-tooltip md-direction="bottom">{{ actionName.show }}</md-tooltip>
                    </md-button>

                    <md-button class="md-icon-button"
                        v-on:click="bulkAction('hide')">
                        <md-icon>visibility_off</md-icon>
                        <md-tooltip md-direction="bottom">{{ actionName.hide }}</md-tooltip>
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

        <md-dialog :md-active.sync="showDialog"
            :md-click-outside-to-close="false"
            :md-close-on-esc="false">
            <md-dialog-title>Confirmación</md-dialog-title>

            <md-dialog-content>
                Vas a
                <strong>{{ currentActionName }}</strong>
                <strong>{{ selected.length }} preguntas</strong>:
                <ul>
                    <li v-for="question in selected"
                        :key="question.id">
                        <strong>{{ question.title }}</strong>
                    </li>
                </ul>

                <md-checkbox v-model="confirmedAction">
                    <span>
                        Confirmo
                        <strong>{{ currentActionName }}</strong> esas preguntas
                    </span>
                </md-checkbox>
            </md-dialog-content>

            <md-dialog-actions>
                <md-button class="md-primary"
                    @click="showDialog = false">Cancelar</md-button>
                <md-button class="md-accent"
                    @click="bulkEdit()"
                    :disabled="!confirmedAction">Aceptar</md-button>
            </md-dialog-actions>

            <md-progress-bar md-mode="determinate"
                class="md-accent"
                :md-value="status.progress"
                v-if="status.loading"></md-progress-bar>
        </md-dialog>

        <md-snackbar md-position="left"
            :md-duration="5000"
            :md-active.sync="status.snackbar.display">
            <span>{{ status.snackbar.message }}</span>
        </md-snackbar>

    </div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";

export default {
    name: 'BulkEdit-Results',
    props: {
        results: Array,
        FilterCard: Object /* A Vue component $ref is passed. This is a tricky way to trigger a function from another component */
    },
    data: () => ({
        selected: [],

        action: null,
        confirmedAction: false,

        showDialog: false,

        actionName: {
            delete: 'Eliminar',
            show: 'Hacer visible',
            hide: 'Ocultar'
        },

        status: {
            loading: false,
            progress: 0,
            snackbar: {
                display: false,
                message: null
            }

        }
    }),
    computed: {
        currentActionName () {
            return this.actionName[this.action];
        }
    },
    methods: {
        bulkAction (action) {
            this.action = action;
            this.showDialog = true;
            this.confirmedAction = false;
        },
        bulkEdit () {
            this.status.loading = true;
            this.status.progress = 0;

            const ref = firebase.firestore().collection('questions'),
                action = this.action,
                selected = this.selected;

            selected.forEach(async (question, i) => {
                if (action == 'delete') {
                    await ref.doc(question.id).delete()
                }
                else if (action == 'hide') {
                    await ref.doc(question.id).update({
                        hidden: true
                    })
                } else if (action == 'show') {
                    await ref.doc(question.id).update({
                        hidden: false
                    })
                };

                this.status.progress = ((i + 1) / selected.length) * 100;

                if (i == selected.length - 1) {
                    this.showDialog = false;
                    this.status.loading = false;
                    this.status.snackbar.display = true;
                    this.status.snackbar.message = `${selected.length} questions ${action}`;

                    /*
                        After change being made, trigger doSearch() from FilterCard to request newest data
                    */
                    if (this.FilterCard.doSearch) {
                        this.FilterCard.doSearch();

                    }
                }
            });
        },
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
