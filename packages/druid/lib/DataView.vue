<template lang='pug'>
  div
    v-container
      v-row.justify-space-around
        v-btn.btn-secondary(@click='clearRecord()' style='float: right') Clear Dataset

        v-tabs(v-model='viewType')
          v-tab(key='parsed' ripple) Parsed
          v-tab-item(key='parsed')
            v-container(style='border: 1px solid black')
              div(v-if='Hashes.length')
                h5(v-if='selected.length') Selected: 
                  span(v-for='s in selected') {{s}}; &nbsp;
                v-btn.btn-primary(v-if='selected.length' @click='plotRecords()') Only use these Records
                b Current Dataset Records: {{Hashes.length}} Records / {{Summary.labels.length}} Columns
                v-data-table(v-model='selected' :items='Hashes' :headers='Summary.labels' :item-key='Summary.key.toString()' show-select)

          v-tab(key='raw' ripple) Raw
          v-tab-item(key='raw')
            v-container(style='border: 1px solid black')
              div(v-if='Summary')
                h3 Raw Data:
                RawData()
              div(v-else)
                h3 No Raw Data uploaded
</template>

<script>
  import DataLoader from './DataLoader'

  // const RawData = () => import('./RawData')

  import RawData from './RawData'

  export default {
    name: 'DataView',
    data () {
      return {
        data: [],
        selected: [],
        show: 'Parsed',
        viewType: 'parsed',
      }
    },
    components: {
      RawData
    },
    mixins: [
      DataLoader
    ],
    props: {
    },
    created () {
      console.log('load Data Page')
    },
    methods: {
    },
    computed: {
      Hashes: function () {
        return this.$store.state.hash.hashes
      },
      Summary: function () {
        return this.$store.state.hash.summary
      }
    }
  }
</script>
