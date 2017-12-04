<template>
	<form v-on:submit.prevent>
		<md-card>
			<md-progress-bar md-mode="indeterminate"
			    v-if="sending" />

			<md-card-header>
				<div class="md-title" v-if="type = 'edit'">Editar Tema</div>
				<div class="md-title" v-else>Añadir Tema</div>
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
						    md-counter="50"
						    v-validate="'max: 50'" />
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
				    v-if="type='edit'">Editar</md-button>
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
import * as firebase from "firebase/app";
import "firebase/firestore";
import * as Vibrant from 'node-vibrant'

export default {
	name: "AddTopic",
	data () {
		return {
			form: {
				name: null,
				questionCount: 5,
				image: null
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
			return fetch("https://source.unsplash.com/1000x500/?technology").then(async (response) => {   /// Fetch a random image from Unsplash, and add it to form
				let color = await Vibrant.from(response.url).getPalette()
					.then((palette) => {
						return palette.Vibrant['_rgb']
					});

				return {
					url: response.url,
					color: color
				};
			})
		},
		addTopic: async function () {
			this.$validator.validateAll().then((result) => {
				if (result) {
					this.sending = true;
					this.form.level = this.selectedLevel;

					this.getRandomPic().then((response) => {
						this.form.image = response.url;
						this.form.color = response.color;

						firebase.firestore().collection("topics").add(this.form).then(() => {
							this.sending = false;
							this.form = {
								name: null
							};
							this.callback();
						});
					})

				}
			});
		}
	}
};
</script>