<template>
    <div class="container extend">
        <div id="mainGrid"
            class="md-layout md-gutter md-layout-column-xsmall md-alignment">

            <!-- Start sidebar -->
            <div class="md-layout-column md-layout-item md-size-30 md-small-size-100">
                <FilterCard v-on:results="updateResults" />
            </div>

            <!-- End sidebar -->

            <!-- Start result table -->
            <div class="md-layout-column md-layout-item md-size-70 md-small-size-100 md-gutter">
                <ResultsCard :results="results" />
            </div>
            <!-- End result table -->
        </div>
    </div>
</template>

<script>
import FilterCard from './components/Filter.vue';
import ResultsCard from './components/Results.vue';

export default {
    name: 'BulkEdit',
    metaInfo: {
        title: 'Bulk Edit'
    },
    components: {
        FilterCard,
        ResultsCard
    },
    data () {
        return {
            results: []
        }
    },
    methods: {
        updateResults (results) {
            this.results = results;
        }
    }
}
</script>