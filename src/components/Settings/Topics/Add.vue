<template>
	<form v-on:submit.prevent>
		<md-card>
			<md-progress-bar md-mode="indeterminate" v-if="sending" />

			<md-card-header>
				<div class="md-title">Añadir Tema</div>
			</md-card-header>

			<md-card-content>
				<div class="md-layout md-layout-wrap md-gutter-16">
					<md-field :class="{ 'md-invalid': errors.has('name') }">
						<label for="name">Título</label>
						<md-input name="name" v-model="form.name" :disabled="sending" md-counter="50" v-validate="'required|max: 50'" />
						<span class="md-error">{{errors.first('name')}}</span>
					</md-field>

					<md-field :class="{ 'md-invalid': errors.has('description') }">
						<label for="description">Descripcion</label>
						<md-input name="description" v-model="form.description" :disabled="sending" md-counter="50" v-validate="'max: 50'" />
						<span class="md-error">{{errors.first('description')}}</span>
					</md-field>

					<md-field :class="{ 'md-invalid': errors.has('questionCount') }">
						<label>Número de preguntas</label>
						<md-input v-model="form.questionCount" name="questionCount" type="number" :disabled="sending" v-validate="'required|min_value:1'"></md-input>
						<span class="md-error">{{errors.first('questionCount')}}</span>
					</md-field>
				</div>
			</md-card-content>

			<md-card-actions>
				<md-button type="submit" class="md-primary" :disabled="sending" v-on:click="addTopic()">Añadir</md-button>
			</md-card-actions>
		</md-card>
	</form>
</template>
<script>
import * as firebase from "firebase/app";
import "firebase/firestore";

export default {
	name: "AddTopic",
	data () {
		return {
			form: {
				name: null,
				questionCount: 5
			},
			sending: false
		};
	},
	props: ['selectedLevel', 'callback'],
	methods: {
		addTopic: function () {
			this.$validator.validateAll().then((result) => {
				if (result) {
					this.sending = true;
					this.form.level = this.selectedLevel;
					firebase.firestore().collection("topics").add(this.form).then(() => {
						this.sending = false;
						this.callback();
					});
					this.form = {
						name: null
					};
				}
			});
		}
	}
};
</script>