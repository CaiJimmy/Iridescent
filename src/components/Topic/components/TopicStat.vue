<template>
    <md-card>
        <md-card-header>
            <div class="md-subhead">Estadística</div>
        </md-card-header>
        <md-card-content>
            <md-list>
                <md-list-item>
                    <md-icon>visibility</md-icon>
                    <span class="md-list-item-text">Visibles: {{ totalCount }}</span>
                </md-list-item>

                <md-list-item>
                    <md-icon>visibility_off</md-icon>
                    <span class="md-list-item-text">Ocultas: {{ hiddenCount }}</span>
                </md-list-item>
            </md-list>
        </md-card-content>
    </md-card>
</template>

<script>
export default {
    name: 'TopicStat',
    props: ['topicData'],
    computed: {
        totalCount () {
            /*
                TODO: New created topic doesn't have `count` property.
            */

            if (this.topicData.hasOwnProperty('count')) {
                return topicData.count.total || 0;
            }
            else {
                return 0;
            }
        },
        hiddenCount () {
            if (this.topicData.hasOwnProperty('count')) {
                return topicData.count.hidden || 0;
            }
            else {
                return 0;
            }
        }
    }
}
</script>
