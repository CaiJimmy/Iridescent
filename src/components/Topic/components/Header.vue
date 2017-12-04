<template>
	<header class="topicPage--header">
		<div class="topicPage--header--image"
		    :style="headerImageStyle"></div>
		<div class="topicPage--header--meta">
			<h1>{{ topic.name }}</h1>
			<h2 v-if="topic.description">{{ topic.description }}</h2>
			<md-button class="md-raised"
			    v-on:click="dialog.editTopic = true"
			    v-if="isAdmin">Editar</md-button>
			<div v-if="isAdmin"
			    class="changeHeaderImage">
				<md-progress-spinner v-if="uploading"
				    :md-diameter="30"
				    :md-stroke="3"
				    md-mode="indeterminate">
				</md-progress-spinner>
				<md-button v-else
				    class="md-icon-button md-primary"
				    v-on:click="showFileDialog()">
					<md-icon>insert_photo</md-icon>
				</md-button>
			</div>
		</div>

		<input ref="fileInput"
		    type="file"
		    @change="changeHeaderImage($event.target.files[0]); fileCount = $event.target.files.length"
		    accept="image/*"
		    style="display:none;" />

		<md-dialog :md-fullscreen="false"
		    :md-active.sync="dialog.editTopic">
			<edit-topic :topicRef="$parent.ref.topic"
			    :topicData="$parent.topic"
			    :callback="closeDialog"
			    type="edit" />
		</md-dialog>

	</header>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import * as Vibrant from 'node-vibrant'
import resizeImage from '@/mixins/resizeImage.js';
import EditTopic from '@/components/Settings/Topics/Add.vue';

export default {
	props: ['topic', 'topicRef'],
	data () {
		return {
			imageInput: null,
			uploading: false,
			dialog: {
				question: false,
				editTopic: false
			},
		}
	},
	components: { EditTopic },
	computed: {
		isAdmin () {
			return this.$store.state.isAdmin;
		},
		headerImageStyle () {
			if (this.topic.image) {
				return {
					"background-image": `url(${this.topic.image})`
				}
			}
			else {
				return {
					"background": "#1de9b6"
				}
			}
		}
	},
	methods: {
		closeDialog (where) {
			this.dialog[where] = false;
		},
		showFileDialog () {
			this.$refs.fileInput.click();
		},
		uploadFile (file, path) {
			var storageRef = firebase.storage().ref();
			var metadata = {
				contentType: file.type
			};
			return firebase
				.storage()
				.ref(path || "coverImage/" + file.name)
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
		async changeHeaderImage (imageFile) {
			if (imageFile) {
				window.test = imageFile;

				this.uploading = true;

				let resizedImage = await resizeImage(imageFile, 1500);

				console.log(resizedImage);

				this.uploadFile(resizedImage, `${this.topicRef.id}/${imageFile.name}`).then(async (snapshot) => {
					let imageURL = snapshot.downloadURL;

					let color = await Vibrant.from(URL.createObjectURL(imageFile)).getPalette()
						.then((palette) => {
							return palette.Vibrant['_rgb']
						});

					this.topicRef.set({
						image: imageURL,
						color: color
					}, {
							merge: true
						}).then(() => {
							this.uploading = false;

							this.$store.commit('setPrimaryColor', color);
						})
				})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.topicPage--header {
	height: 300px;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;

	.topicPage--header--image,
	&:after {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center center;
	}

	&:after {
		content: "";
		background: rgba(0, 0, 0, 0.5);
		display: block;
	}

	.topicPage--header--meta {
		text-align: center;
		z-index: 2;
		line-height: 1;
		h1 {
			color: #fff;
			font-size: 2.5em;
			font-weight: lighter;
		}
		h2 {
			color: #999;
			font-weight: 400;
		}
	}
}

.changeHeaderImage {
	position: absolute;
	bottom: 20px;
	right: 20px;
}
</style>

