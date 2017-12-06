<template>
    <md-card>
        <md-card-header>
            <h2 class="md-title">{{ item.title }}</h2>
            <div class="md-subhead">
                <span>{{ index + 1 }} de {{ total }}</span>
            </div>
        </md-card-header>
        <md-card-content>
            <md-list>
                <md-list-item v-for="(value, letter, index) in item.answers"
                    :key="index">
                    <div class="md-list-item-text">
                        <md-radio :value="letter"
                            v-model="chosen"
                            disabled
                            v-if="correctAnswer">{{ letter.toUpperCase() }}. {{value}}</md-radio>
                        <md-radio :value="letter"
                            v-model="chosen"
                            class="md-primary"
                            @change="onChoose"
                            v-else>{{ letter.toUpperCase() }}. {{value}}</md-radio>
                    </div>
                    <md-button v-if="correctAnswer == letter"
                        class="md-icon-button md-list-action">
                        <md-icon class="md-primary">star</md-icon>
                    </md-button>
                    <md-divider v-if="letter !== 'd'"></md-divider>
                </md-list-item>
            </md-list>
        </md-card-content>
    </md-card>
</template>
<script>
export default {
    props: ['item', 'index', 'total', 'onChosen', 'correctAnswer', 'itemChosen'],
    data () {
        return {
            chosen: null
        }
    },
    created () {
        if (this.itemChosen) {
            this.chosen = this.itemChosen;
        }
    },
    methods: {
        onChoose (letter) {
            this.onChosen(this.item.id, letter); /// Pass back to parent;
        }
    }
}
</script>

<style lang="scss">
.md-radio .md-radio-label {
	height: auto !important;
}

.md-list-item-text {
	white-space: normal !important;
}
</style>
