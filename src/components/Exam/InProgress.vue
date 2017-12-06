<template>
    <div class="container extend mainContent">
        <div class="md-layout md-gutter mainGrid">
            <div class="md-layout-item md-size-25">
                <md-card id="examDetails"
                    class="stickyCard">
                    <md-progress-bar class="md-accent"
                        :md-value="examCountdownProgress"></md-progress-bar>
                    <md-card-header>
                        <div class="md-subhead">Quedan...</div>

                        <div class="md-title">
                            <VueCountdown :auto-start="true"
                                v-on:countdownprogress="onCountdownProgress"
                                v-on:countdownend="onCountdownEnd"
                                :time="time"
                                ref="examCountdown">
                                <template slot-scope="props">{{ props.minutes }} : {{ props.seconds }}</template>
                            </VueCountdown>
                        </div>

                    </md-card-header>
                </md-card>
            </div>
            <div class="md-layout-item md-size-75">
                <QuestionCard v-for="(question,index) in shuffledQuestions"
                    :key="question.id"
                    :item="question"
                    :index="index"
                    :total="shuffledQuestions.length"
                    :onChosen="onChosen" />

                <md-button class="md-primary md-raised submitExam"
                    v-on:click="submitExam()">Entregar</md-button>
            </div>
        </div>
    </div>
</template>
<script>
import QuestionCard from './QuestionCard.vue';
import VueCountdown from '@xkeshi/vue-countdown'

export default {
    metaInfo: {
        title: 'Examinar'
    },
    props: ['shuffledQuestions', 'config', 'onChosen', 'topicID'],
    data () {
        return {
            examCountdownProgress: 0
        }
    },
    components: {
        QuestionCard,
        VueCountdown
    },
    created(){
        if(!this.shuffledQuestions.length){
            this.$router.replace('/t/' + this.topicID);
        }
        else{
            window.scrollTo(0, 0);
        }
    },
    computed: {
        time () {
            return this.config.examTime * 60 * 1000;
        }
    },
    methods: {
        submitExam () {
             this.$router.replace('/t/' + this.topicID + '/exam/results');
        },
        onCountdownProgress (data) {
            var total = this.time / 1000,
                current = data.minutes * 60 + data.seconds;
            this.examCountdownProgress = current / total * 100;
        },
        onCountdownEnd () {
            this.submitExam();
        }
    }
}
</script>
<style lang="scss" scoped>
.submitExam{
    width: 100%;
    margin: 0;
}

.md-card {
	margin-bottom: 1em;
}

#examDetails {
	@media only screen and (min-width: 944px) {
		position: sticky;
		top: 80px;
		align-self: flex-start;
	}
}
</style>
