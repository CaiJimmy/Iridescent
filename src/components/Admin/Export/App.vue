<template>
    <div class="container">
        <md-card>
            <md-card-header>
                <div class="md-title">Exportar</div>
            </md-card-header>

            <md-card-content>
                <p>Esta herramienta permite exportar los contenidos de esta página en formato JSON. </p>
                <p>Va a solicitar todos los datos que vayan a ser exportados, por lo que puede tardar y gastar mucha quota de base de datos en el caso de que fuera muchos datos.</p>
            </md-card-content>

            <md-list>
                <md-subheader>Contenidos a exportar</md-subheader>

                <md-list-item v-for="option in to_export_options"
                    :key="option.collection">
                    <md-checkbox v-model="config.to_export"
                        :value="option.collection"
                        :disabled="inProgress" />
                    <span class="md-list-item-text">{{ option.name }}</span>
                </md-list-item>
            </md-list>

            <md-card-actions>
                <md-button class="md-accent"
                    :disabled="!config.to_export.length || inProgress"
                    v-on:click="exportData()">Exportar</md-button>
            </md-card-actions>

            <md-card-content>
                <div class="md-subhead"
                    v-html="message"></div>
            </md-card-content>

            <md-progress-bar class="md-accent"
                md-mode="determinate"
                :md-value="progress_bar"
                v-if="inProgress"></md-progress-bar>

        </md-card>
    </div>
</template>
<script>
import db from '@/firebase/database';

export default {
    name: "Export",
    metaInfo: {
        title: 'Exportar'
    },
    data () {
        return {
            config: {
                to_export: []
            },

            to_export_options: [
                {
                    name: "Preguntas",
                    collection: "questions"
                },
                {
                    name: "Usuarios",
                    collection: "users"
                },
                {
                    name: "Niveles",
                    collection: "levels"
                },
                {
                    name: "Temas",
                    collection: "topics"
                }
            ],

            inProgress: false,
            progress_bar: 0,
            message: "Haz click en <code>exportar</code> para comenzar"
        }
    },
    methods: {
        async downloadCollection (collection) {
            return new Promise(resolve => {
                db.collection(collection).get().then(documentSnapshots => {
                    let collectionData = [],
                        collectionSize = documentSnapshots.size;

                    documentSnapshots.forEach(document => {
                        collectionData.push({
                            ...document.data(),
                            id: document.id
                        });

                        this.progress_bar = this.progress_bar + ((100 / this.config.to_export.length) / collectionSize);
                        this.message = `Exportando la tabla de <code>${collection}</code>. Progreso: ${Math.floor(this.progress_bar)} / 100`;
                        console.log(this.message);
                    });

                    resolve(collectionData);
                });
            })
        },
        async exportData () {
            const to_export = this.config.to_export;

            let exportedData = {};

            this.inProgress = true;

            to_export.forEach(async (collection, i) => {
                this.downloadCollection(collection).then((collectionData) => {
                    exportedData[collection] = collectionData;
                }).then(() => {
                    if (i == to_export.length - 1) {
                        this.saveJSON(exportedData);
                        this.inProgress = false;
                        this.progress_bar = 0;
                    }
                });
            });

        },
        saveJSON (data, filename) {
            if (!data) {
                console.error('No data')
                return;
            }

            if (!filename) filename = `export-iridescent-${new Date().toISOString()}.json`;

            if (typeof data === "object") {
                data = JSON.stringify(data, undefined, 4)
            }

            var blob = new Blob([data], { type: 'text/json' }),
                e = document.createEvent('MouseEvents'),
                a = document.createElement('a')

            a.download = filename
            a.href = window.URL.createObjectURL(blob)
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
            a.dispatchEvent(e)
        }
    }
}
</script>
