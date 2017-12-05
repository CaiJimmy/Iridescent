<template>
	<div class="explore">
		<md-progress-bar class="md-primary"
		    md-mode="indeterminate"
		    v-if="loading"></md-progress-bar>

		<div class="container extend"
		    v-else>
			<div class="md-layout md-gutter md-layout-column-xsmall md-alignment mainGrid">
				<!-- Left Side Start -->
				<div class="leftSide md-layout-item md-size-70 md-small-size-100 md-gutter">
					<TopicList />
				</div>
				<!-- Left Side End -->

				<!-- Right Side Start -->
				<div class="rightSide md-layout-item md-size-30 md-small-size-100 md-gutter">
					<UserCard :user="user" />
					<md-button v-if="isAdmin"
					    class="md-primary md-raised fullWidth"
					    v-on:click="$router.push('/settings/topics/')">Añadir Temas / Nivels</md-button>
				</div>
				<!-- Right Side End -->
			</div>
		</div>
	</div>
</template>
<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';

import TopicList from './Home/TopicList.vue'
import UserCard from './Home/UserCard.vue'

export default {
	name: 'Home',
	components: {
		TopicList,
		UserCard
	},
	metaInfo: {
		title: 'Explorar'
	},
	computed: {
		loading: function () {
			return this.$store.state.loading.levels | this.$store.state.loading.topics;
		},
		isAdmin: function () {
			return this.$store.state.isAdmin;
		},
		user: function () {
			return this.$store.state.user;
		}
	}
}
</script>
<style lang="scss" scoped>
.explore {
	.mainGrid {
		@media only screen and (max-width: 944px) {
			flex-direction: column-reverse;
		}
	}
}
.fullWidth {
	width: 100%;
	margin-left: 0;
	margin-right: 0;
}
</style>
