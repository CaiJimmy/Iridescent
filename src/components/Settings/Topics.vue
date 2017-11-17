<template>
	<div>
		<form v-on:submit.prevent>
			<md-card>
				<md-card-header>
					<div class="md-title">Añadir Tema</div>
				</md-card-header>

				<md-card-content>
					<div class="md-layout md-layout-wrap md-gutter-16">
						<md-field>
							<label for="title">Título</label>
							<md-input name="title" id="title" v-model="form.title" :disabled="sending" />
						</md-field>

						<md-field>
							<label for="description">Descripcion</label>
							<md-input name="description" id="description" v-model="form.description" :disabled="sending" />
						</md-field>

						<md-field>
							<label>Imagen</label>
							<md-file accept="image/*" v-model="image_file.name" />
						</md-field>
					</div>
				</md-card-content>
				<md-progress-bar md-mode="indeterminate" v-if="sending" />

				<md-card-actions>
					<md-button type="submit" class="md-primary" :disabled="sending" v-on:click="addTopic()">Añadir</md-button>
				</md-card-actions>
			</md-card>
		</form>

		<md-progress-spinner v-if="loading.topics" class="md-accent" md-mode="indeterminate" :md-diameter="30" :md-stroke="3"></md-progress-spinner>

		<div v-else>
			<md-list class="md-double-line md-dense md-elevation-1" v-if="topics.length">

				<md-list-item v-for="topic in topics" :key="topic.name">
					<md-avatar v-if="topic.image">
						<img :src="topic.image" :alt="topic.name">
					</md-avatar>

					<div class="md-list-item-text">
						<span>{{ topic.name }}</span>
						<span>{{ topic.description }}</span>
					</div>

					<md-button class="md-icon-button md-list-action">
						<md-icon class="md-primary">edit</md-icon>
					</md-button>
				</md-list-item>
				<md-divider class="md-inset"></md-divider>
			</md-list>
			<md-empty-state v-else md-icon="assignment" md-label="Crear un tema">
			</md-empty-state>
		</div>

	</div>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

export default {
	name: "Topics",
	data () {
		return {
			topics: [],
			image_file: {
				name: null
			},
			form: {
				title: null,
				description: null,
				image: null
			},
			sending: false,
			loading: {
				topics: true
			}
		};
	},
	created: function () {
		this.$bind("topics", firebase.firestore().collection("topics")).then(() => {
			alert('true')
		});
	},
	watch: {
		"topics": function () {
			this.loading.topics = false;
		}
	},
	methods: {
		onSelect: function (event, to, to2) {
			let file = event[0];
			this[to] = file;
			this.selected[to] = true;
			this.form[to2] = null;
		},
		uploadFile: function (file, path) {
			var storageRef = firebase.storage().ref();
			var metadata = {
				contentType: file.type
			};
			return firebase
				.storage()
				.ref(path || "images/" + file.name)
				.put(file, metadata)
				.then(function (snapshot) {
					console.log("Uploaded", snapshot.totalBytes, "bytes.");
					console.log(snapshot.metadata);
					var url = snapshot.downloadURL;
					console.log("File available at", url);

					return snapshot;
				})
				.catch(function (error) {
					console.error("Upload failed:", error);
				});
		},
		addTopic: function () {
			if (this.form.title) {
				this.sending = true;
				firebase
					.firestore()
					.collection("topics")
					.add(this.form)
					.then(() => {
						this.sending = false;
					});
				this.form = {
					title: null,
					description: null,
					image: null
				};
			}
		}
	}
};
</script>

<style>

</style>
