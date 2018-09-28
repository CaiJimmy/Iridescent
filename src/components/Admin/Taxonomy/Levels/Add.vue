<template>
    <form v-on:submit.prevent>
        <md-card>
            <md-progress-bar md-mode="indeterminate"
                v-if="sending" />

            <md-card-header>
                <div class="md-title">Añadir Nivel</div>
            </md-card-header>

            <md-card-content>
                <div class="md-layout md-layout-wrap md-gutter-16">
                    <md-field :class="{ 'md-invalid': errors.has('name') }">
                        <label for="name">Título</label>
                        <md-input name="name"
                            id="name"
                            v-model="form.name"
                            :disabled="sending"
                            md-counter="50"
                            v-validate="'required|max: 50'" />
                        <span class="md-error">{{errors.first('name')}}</span>
                    </md-field>
                </div>
            </md-card-content>

            <md-card-actions>
                <md-button type="submit"
                    class="md-primary"
                    :disabled="sending"
                    v-on:click="addLevel()">Añadir</md-button>
            </md-card-actions>
        </md-card>
    </form>
</template>
<script>
import db from '@/firebase/database';

export default {
    name: "AddLevel",
    data () {
        return {
            form: {
                name: null
            },
            sending: false
        };
    },
    props: ['callback'],
    methods: {
        addLevel: function () {
            this.$validator.validateAll().then((result) => {
                if (result) {
                    this.sending = true;

                    db.collection("levels").add(this.form).then(() => {
                        this.sending = false;
                        this.form = {
                            name: null
                        };
                        this.callback();
                    });
                }
            });
        }
    }
};
</script>