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
        <md-card-actions>
            <md-button class="md-primary"
                @click="reCount()" :disabled="reCounting">Refrescar</md-button>
        </md-card-actions>
    </md-card>
</template>

<script>
export default {
    name: 'TopicStat',
    props: ['topicData'],
    data(){
        return{
            reCounting: false
        }
    },
    computed: {
        totalCount () {
            /*
                TODO: New created topic doesn't have `count` property.
            */

            if (this.topicData.hasOwnProperty('count')) {
                return this.topicData.count.total || 0;
            }
            else {
                return 0;
            }
        },
        hiddenCount () {
            if (this.topicData.hasOwnProperty('count')) {
                return this.topicData.count.hidden || 0;
            }
            else {
                return 0;
            }
        }
    },
    methods: {
        reCount () {
            const firebase_function_url = process.env.FIREBASE_FUNCTION_URL;
            
            this.reCounting = true;

            fetch(`${firebase_function_url}/reCount?topic=${this.topicData.id}`).then(() => {
                this.reCounting = false;    
            })
        }
    }
}
</script>
