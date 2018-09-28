<template>
	<form v-on:submit.prevent>
		<md-card>
			<md-progress-bar md-mode="indeterminate"
			    v-if="sending" />

			<md-card-header>
				<div class="md-title"
				    v-if="type == 'edit'">Editar Tema</div>
				<div class="md-title"
				    v-else>Añadir Tema</div>
			</md-card-header>

			<md-card-content>
				<div class="md-layout md-layout-wrap md-gutter-16">
					<md-field :class="{ 'md-invalid': errors.has('name') }">
						<label for="name">Título</label>
						<md-input name="name"
						    v-model="form.name"
						    :disabled="sending"
						    md-counter="50"
						    v-validate="'required|max: 50'" />
						<span class="md-error">{{errors.first('name')}}</span>
					</md-field>

					<md-field :class="{ 'md-invalid': errors.has('description') }">
						<label for="description">Descripcion</label>
						<md-input name="description"
						    v-model="form.description"
						    :disabled="sending"
						    md-counter="100"
						    v-validate="'max: 100'" />
						<span class="md-error">{{errors.first('description')}}</span>
					</md-field>

					<md-field :class="{ 'md-invalid': errors.has('questionCount') }">
						<label>Número de preguntas</label>
						<md-input v-model="form.questionCount"
						    name="questionCount"
						    type="number"
						    :disabled="sending"
						    v-validate="'required|min_value:1'"></md-input>
						<span class="md-error">{{errors.first('questionCount')}}</span>
					</md-field>
				</div>
			</md-card-content>

			<md-card-actions>
				<md-button type="submit"
				    class="md-primary"
				    :disabled="sending"
				    v-on:click="editTopic()"
				    v-if="type == 'edit'">Editar</md-button>
				<md-button type="submit"
				    v-else
				    class="md-primary"
				    :disabled="sending"
				    v-on:click="addTopic()">Añadir</md-button>
			</md-card-actions>
		</md-card>
	</form>
</template>
<script>
import db from '@/database';

import getColorFromImage from '@/methods/getColorFromImage.js';
import uploadFile from '@/methods/uploadFile.js';

export default {
	name: "AddTopic",
	data () {
		return {
			form: {
				name: null,
				questionCount: 5,
				image: null,
				count: {
					hidden: 0,
					total: 0
				}
			},
			sending: false
		};
	},
	props: ['selectedLevel', 'callback', 'type', 'topicData', 'topicRef'],
	created () {
		if (this.type == 'edit') {
			this.form = JSON.parse(JSON.stringify(this.topicData));  /// Don't mutate directly raw data
		}
	},
	methods: {
		randomID () {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (var i = 0; i < 8; i++)
				text += possible.charAt(Math.floor(Math.random() * possible.length));

			return text;
		},
		editTopic () {
			this.$validator.validateAll().then((result) => {
				if (result) {
					this.sending = true;
					this.topicRef.set(this.form, { merge: true }).then(() => {
						this.sending = false;
						this.form = {
							name: null
						};
						this.callback('editTopic');
					});

				}
			});
		},
		getRandomPic: async function () {
			return fetch("https://source.unsplash.com/200x120/?technology").then(async (response) => {   /// Fetch a random image from Unsplash, and add it to form
				let imageFile = await fetch(response.url).then(res => {
					return res.blob();
				});

				return {
					url: response.url,
					color: await getColorFromImage(URL.createObjectURL(imageFile)),
					file: imageFile
				};
			})
		},
		addTopic: async function () {
			const validated = await this.$validator.validateAll();

			if (validated) {

				this.sending = true;
				this.form.level = this.selectedLevel;

				const randomPic = await this.getRandomPic();

				/// By default, the image will be uploaded to /coverImage/ folder, because we don't have yet the topic id
				const uploadImageURL = await uploadFile(randomPic.file, `coverImage/${this.randomID()}`).then(snapshot => snapshot.downloadURL);

				this.form = {
					...this.form,
					image: uploadImageURL,
					color: randomPic.color
				};

				db.collection("topics").add(this.form).then((topicRef) => {
					this.sending = false;
					this.callback();

					this.$router.push(`/t/${topicRef.id}`);
				});
			}
		}
	}
};
</script>