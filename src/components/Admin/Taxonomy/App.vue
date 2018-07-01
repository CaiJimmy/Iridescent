<template>
	<div>
		<md-progress-bar class="md-primary"
		    md-mode="indeterminate"
		    v-if="loading.levels"></md-progress-bar>

		<div class="container"
		    v-else>
			<md-empty-state v-if="!levels.length"
			    md-icon="add"
			    md-label="Crear nivel"
			    md-description="Para comenzar, crear un nivel">
				<md-button class="md-primary md-raised"
				    v-on:click="showDialog.addLevel = true">Crear</md-button>
			</md-empty-state>

			<div v-else>
				<md-list class="md-elevation-1 levelList"
				    v-for="level in levels"
				    :key="level.id">
					<md-subheader>
						<h1 class="md-title"
						    style="flex: 1;">{{ level.name }}</h1>
						<md-button v-on:click="addTopic(level.id)"
						    class="md-icon-button md-list-action">
							<md-icon class="md-primary">add</md-icon>
						</md-button>
					</md-subheader>

					<md-progress-spinner md-mode="indeterminate"
					    v-if="loading.topics"></md-progress-spinner>

					<div v-else>
						<md-empty-state v-if="!topicFilter(level.id).length"
						    md-icon="add"
						    md-label="Nivel vacío"
						    md-description="Añade temas a este nivel pulsando el botón de la esquina derecha">
						</md-empty-state>

						<md-list-item v-for="topic in topicFilter(level.id)"
						    :key="topic.id">
							<md-avatar v-if="topic.image">
								<img :src="topic.image"
								    :alt="topic.name">
							</md-avatar>

							<div class="md-list-item-text">
								<span>{{ topic.name }}</span>
							</div>

							<md-button class="md-icon-button md-list-action"
							    v-on:click="$router.push('/t/' + topic.id)">
								<md-icon class="md-primary">remove_red_eye</md-icon>
							</md-button>
						</md-list-item>
					</div>
				</md-list>
				<md-button class="md-fab"
				    v-on:click="showDialog.addLevel = true"
				    id="addLevel">
					<md-tooltip md-direction="left">Añadir Nivel</md-tooltip>
					<md-icon>add</md-icon>
				</md-button>
			</div>
		</div>
		<md-dialog :md-active.sync="showDialog.addTopic"
		    :md-fullscreen="false">
			<AddTopic v-bind:selectedLevel="selectedLevel"
			    v-bind:callback="closeAddTopicDialog" />
		</md-dialog>

		<md-dialog :md-active.sync="showDialog.addLevel"
		    :md-fullscreen="false">
			<AddLevel v-bind:callback="closeAddLevelDialog" />
		</md-dialog>

	</div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";

import AddTopic from './Topics/Add.vue'
import AddLevel from './Levels/Add.vue'

export default {
	name: "Taxonomy",
	metaInfo: {
        title: 'Añadir temas / niveles'
    },
	components: {
		AddTopic,
		AddLevel
	},
	data () {
		return {
			topics: [],
			levels: [],
			loading: {
				topics: true,
				levels: true
			},

			showDialog: {
				addTopic: false,
				addLevel: false
			},

			selectedLevel: null
		};
	},
	created: function () {
		this.$bind("topics", firebase.firestore().collection("topics")).then(() => {
			this.loading.topics = false;
		});
		this.$bind("levels", firebase.firestore().collection("levels")).then(() => {
			this.loading.levels = false;
		});;
	},
	methods: {
		closeAddLevelDialog: function (dialogRef) {
			this.showDialog.addLevel = false;
		},
		closeAddTopicDialog: function (dialogRef) {
			this.showDialog.addTopic = false;
		},
		addTopic: function (levelID) {
			this.selectedLevel = levelID;
			this.showDialog.addTopic = true;
		},
		topicFilter: function (levelID) {
			let array = this.topics.filter((topic) => {
				return topic.level == levelID;
			});

			return array;
		}
	}
};
</script>

<style scoped>
.container {
  margin: 2em auto;
}
.levelList {
  margin-bottom: 1em;
}

#addLevel {
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>