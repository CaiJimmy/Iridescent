<template>
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
</template>
<script>
export default {
    name: 'ExamHome',
    props: ['topicData', 'questions', 'shuffledQuestions'],
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
                max_value: this.topicData.count.total
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
