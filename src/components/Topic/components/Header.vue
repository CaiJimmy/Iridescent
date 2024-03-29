<template>
	<header class="topicPage--header">
		<div class="topicPage--header--image"
		    :style="headerImageStyle"></div>
		<div class="topicPage--header--meta">
			<h1>{{ topic.name }}</h1>
			<h2 v-if="topic.description">{{ topic.description }}</h2>
			<md-button class="md-raised"
			    v-on:click="dialog.editTopic = true"
			    v-if="isAdmin && topicRef">Editar</md-button>
			<div v-if="isAdmin && topicRef"
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
			<edit-topic :topicRef="topicRef"
			    :topicData="topic"
			    :callback="closeDialog"
			    type="edit" />
		</md-dialog>

	</header>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import resizeImage from '@/methods/resizeImage.js';
import EditTopic from '@/components/Admin/Taxonomy/Topics/Add.vue';
import getColorFromImage from '@/methods/getColorFromImage.js';
import uploadFile from '@/methods/uploadFile.js';

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
			return this.$store.state.user.isAdmin;
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
		async changeHeaderImage (imageFile) {
			if (imageFile) {
				window.test = imageFile;

				this.uploading = true;

				let resizedImage = await resizeImage(imageFile, 200);

				console.log(resizedImage);

				uploadFile(resizedImage, `${this.topicRef.id}/${imageFile.name}`).then(async (snapshot) => {
					let imageURL = snapshot.downloadURL;

					let color = await getColorFromImage(URL.createObjectURL(imageFile));

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
  overflow: hidden;  /* Background image has been scaled using transform, so we need to hide it */

  .topicPage--header--image,
  &:after {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-repeat: no-repeat!important;
    background-size: cover!important;
    background-position: center center!important;
  }

  .topicPage--header--image {
    background: var(--md-theme-default-primary, #00bfa5);
	filter: blur(10px);
	transform: scale(1.2);  /* To hide while borders caused by blur filter */
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

