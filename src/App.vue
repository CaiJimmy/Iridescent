<template>
    <div id="app">

        <!-- Show progress bar while loading Firebase Auth -->
        <md-progress-bar class="md-accent"
            md-mode="indeterminate"
            v-if="!firebaseReady"></md-progress-bar>

        <div v-else>
            <!-- Start top toolbar -->
            <md-toolbar class="md-primary navBar"
                :md-elevation="toolbarElevation"
                v-if="loggedIn && !$route.meta.hideNav">

                <md-button class="md-icon-button"
                    @click="goBack"
                    v-if="$route.path !== '/' && !$route.meta.returnDisabled">
                    <md-icon>arrow_back</md-icon>
                </md-button>

                <div v-if="$route.path == '/'">
                    <img class="siteLogo"
                        src="/static/android-chrome-192x192.png" />
                    <span class="md-title">Iridescent</span>
                </div>
                <span v-else-if="!$route.meta.hideToolbarTitle"
                    class="md-title">{{ title }}</span>
            </md-toolbar>
            <!-- End top toolbar -->

            <template v-if="loggedIn">
                <md-progress-bar md-mode="indeterminate"
                    v-if="$store.state.loading.user && !$store.state.loading.userValidation"></md-progress-bar>
                <router-view v-else/>
            </template>

            <template v-else>
                <router-view />
            </template>

        </div>
    </div>
</template>

<script>
import {Auth} from '@/firebase/auth'

export default {
    name: "app",
    metaInfo: {
        changed (newInfo, addedTags, removedTags) {
            this.$root.title = newInfo.titleChunk;
        },
        titleTemplate: (titleChunk) => {
            // If undefined or blank then we don't need the hyphen
            return titleChunk ? `${titleChunk} | Iridescent` : 'Iridescent';
        }
    },
    data () {
        return {
            firebaseReady: false,   /* Indicates if Firebase Auth is ready or not */
            loggedIn: false
        }
    },
    created () {
        Auth.onAuthStateChanged((user) => {
            if (user) {
                this.loggedIn = true;
            }
            else {
                this.loggedIn = false;
            }
            this.firebaseReady = true;
            console.log('Firebase Auth Initialized');
        });
    },
    computed: {
        toolbarElevation () {
            if (this.$route.meta.hasOwnProperty('toolbarElevation')) {   /// Have to do this because 0 == false
                return this.$route.meta.toolbarElevation;
            }
            else {
                return 1;
            }
        },
        title () {
            return this.$root.title;
        }
    },
    methods: {
        goBack () {
            this.$router.push('/')
        }
    }
};
</script>
<style lang="scss">
@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme(
  "default",
  (
    primary: md-get-palette-color(teal, A700),
    accent: md-get-palette-color(pink, 500)
  )
);

@import "~vue-material/dist/theme/all"; // Apply the theme
.container {
  max-width: 850px;
  padding: 0 15px;
  margin: 0 auto;
  &.extend {
    max-width: 1200px;
  }
  &.compact {
    max-width: 650px;
  }
}

.md-drawer {
  width: 230px !important;
  max-width: calc(100vw - 125px) !important;
  position: fixed !important;
}

.md-fab {
  z-index: 2;
}

#app {
  height: 100%;
}

@media only screen and (min-width: 500px) {
  .navBar {
    position: sticky !important;
    top: 0 !important;
    z-index: 5 !important;
  }
}

.siteLogo {
  width: 40px;
  height: 40px;

  & + .md-title {
    vertical-align: middle !important;
  }
}

.notFound {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  max-width: 400px;
  width: 100%;

  .md-card {
    padding: 15px;
  }
}
.mainContent {
  margin: 2em auto;
}
</style>
