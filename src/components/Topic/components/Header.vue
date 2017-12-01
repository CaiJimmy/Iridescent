<template>
	<header class="topicPage--header">
		<div class="topicPage--header--image"
		    :style="headerImageStyle"></div>
		<div class="topicPage--header--meta">
			<h1>{{ topic.name }}</h1>
			<h2 v-if="topic.description">{{ topic.description }}</h2>
			<div v-if="isAdmin">
				<md-progress-spinner v-if="uploading"
				    :md-diameter="30"
				    :md-stroke="3"
				    md-mode="indeterminate">
				</md-progress-spinner>
				<md-button v-else
				    class="md-raised"
				    v-on:click="showFileDialog()">Cambiar el fondo</md-button>
			</div>
		</div>

		<input ref="fileInput"
		    type="file"
		    @change="changeHeaderImage($event.target.files[0]); fileCount = $event.target.files.length"
		    accept="image/*"
		    style="display:none;" />
	</header>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";

export default {
	props: ['topic', 'topicRef'],
	data () {
		return {
			imageInput: null,
			uploading: false
		}
	},
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

		changeHeaderImage (imageFile) {
			if (imageFile) {
				this.uploading = true;

				this.uploadFile(imageFile, `${this.topicRef.id}/${imageFile.name}`).then((snapshot) => {
					let imageURL = snapshot.downloadURL;

					this.topicRef.set({
						image: imageURL
					}, {
							merge: true
						}).then(() => {
							this.uploading = false;
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
    z-index: -1;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
  }

  &:after {
    content: "";
    background: rgba(0, 0, 0, 0.5);
    z-index: 0;
    display: block;
  }

  .topicPage--header--meta {
    text-align: center;
    z-index: 2;
    h1 {
      color: #fff;
      font-size: 2.5em;
    }
    h2 {
      color: #999;
      font-weight: 400;
    }
  }
}
</style>

