<template>
    <div>
        <TopicHeader :topic="topic" />
        <md-tabs class="md-primary"
            md-alignment="centered"
            md-sync-route>
            <md-tab id="tab-home"
                md-label="Preguntas"
                :to="'/t/' +  topic.id + '/'"></md-tab>
            <md-tab id="tab-pages"
                md-label="Examinar"
                :to="'/exam/' + topic.id"></md-tab>
        </md-tabs>
        <div class="container mainContent">
            <md-card>
                <md-card-header>
                    <div class="md-title">Examinar</div>
                </md-card-header>

                <md-card-content>
                    <md-field :class="{ 'md-invalid': errors.has('numberOfQuestions') }">
                        <label>Número de preguntas</label>
                        <md-input type="number"
                            v-model="config.numberOfQuestions"
                            data-vv-name="numberOfQuestions"
                            v-validate="rule"></md-input>
                        <span class="md-error">{{errors.first('numberOfQuestions')}}</span>
                    </md-field>
                    <md-field :class="{ 'md-invalid': errors.has('examTime') }">
                        <label>Tiempo</label>
                        <md-input type="number"
                            v-model="config.examTime"
                            data-vv-name="examTime"
                            v-validate="'required|numeric|min_value:1|max_value:20'"></md-input>
                        <span class="md-error">{{errors.first('examTime')}}</span>
                    </md-field>
                </md-card-content>

                <md-card-actions>
                    <md-button @click.native="validate()">Comenzar</md-button>
                </md-card-actions>
            </md-card>
        </div>
    </div>
</template>
<script>
import TopicHeader from '@/components/Topic/components/Header.vue';

export default {
    components: {
        TopicHeader
    },
    props: ['topic', 'questions', 'shuffledQuestions'],
    data () {
        return {
            config: {
                numberOfQuestions: 10,
                examTime: 20,
            }
        }
    },
    computed: {
        rule: function () {
            return {
                required: true,
                numeric: true,
                min_value: 1,
                max_value: this.questions.length
            }
        }
    },
    methods: {
        validate () {
            this.$validator.validateAll().then((success) => {
                if (success) {
                    this.$parent.startExam(this.config)
                }
            })
        },
    }
}
</script>
