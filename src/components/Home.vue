<template>
	<div class="homepage container extend"
	    v-if="!loading">
		<md-empty-state md-icon="add"
		    md-label="Guardar Tema"
		    md-description="Guardar temas a tu cuenta para accederlo más rápido"
		    v-if="!savedTopics.length">
			<md-progress-spinner md-mode="indeterminate"
			    v-if="loading"></md-progress-spinner>
			<md-button class="md-primary md-raised"
			    v-else
			    v-on:click="showDialog.topics = true">Explorar</md-button>
		</md-empty-state>

		<div class="savedTopics--wrapper"
		    v-else>
			<div class="savedTopics--grid"
			    v-for="topicID in savedTopics"
			    :key="topicID">
				<router-link :to="'/t/' + topicID">
					<md-card>
						<md-card-header>
							<div class="md-title">{{ topics[topicID].name }}</div>
							<div class="md-subhead">{{ levels[topics[topicID].level].name }}</div>
						</md-card-header>
					</md-card>
				</router-link>
			</div>
		</div>
		<md-dialog :md-active.sync="showDialog.topics"
		    :md-fullscreen="false">
			<Explore />
		</md-dialog>

		<md-button class="md-fab md-primary exploreButton"
		    v-on:click="showDialog.topics = true">
			<md-icon>add</md-icon>
		</md-button>

	</div>
</template>

<script>
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import Explore from './Home/Explore.vue'
import Methods from './Home/Methods.js'

import General from '@/mixins/general.js'
export default {
	name: 'Home',
	components: {
		Explore
	},
	mixins: [General, Methods],
	data () {
		return {
			showDialog: {
				topics: false
			}
		}
	},
	computed: {
		savedTopics: function () {
			return this.user.savedTopics || [];
		},
		loading: function () {
			return this.$store.state.loading.levels | this.$store.state.loading.topics;
		}
	},
	created () {
		this.deleteInvalidTopics(); // TODO: Move this function to somewhere else
	},
	methods: {
		deleteInvalidTopics: function () {
			this.savedTopics.forEach((topicID) => {
				if (!this.$store.state.topics.hasOwnProperty(topicID)) {
					removeTopic(topicID);
				}
			})
		}
	}
}
</script>
<style lang="scss" scoped>
.homepage {
  margin: 2em auto;
}

.exploreButton {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.savedTopics--wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  &:after {
    content: "";
    flex-grow: 1;
    flex-basis: 1000000px;
  }
  .savedTopics--grid {
    flex-grow: 1;
    flex-basis: auto;
    width: 23%;
    margin: 5px;
    max-width: 23%;
    @media (max-width: 750px) {
      flex: 0 1 100%;
      max-width: 100%;
    }

    @media (max-width: 1100px) {
      flex: 0 1 48%;
      max-width: 48%;
    }

    .md-card {
      height: 100%;
    }
  }
}
</style>
