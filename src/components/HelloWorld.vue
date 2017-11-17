<template>
	<div class="hello">
		{{test}}
	</div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export default {
	name: 'HelloWorld',
	data () {
		return {
			msg: 'Welcome to Your Vue.js Apps'
		}
	},
	computed: {
		test: function () {
			console.log(firebase.auth().currentUser);
			window.firestore = firebase.firestore();
			return firebase.auth().currentUser
		}
	}
}
</script>