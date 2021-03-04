<template lang='pug'>
  div
    v-container
      div
        h5(v-if='selected.length') Selected:
          span(v-for='s in selected') {{s[Headers[keyIndex].value]}}; &nbsp;
        p
          v-btn.btn-primary(v-if='selected.length' @click='deleteRecords(selected)') Delete these Records
        
        b Current Dataset: {{Hashes.length}} Records / {{Headers.length}} Columns (Key: {{defaultKey}})
        v-data-table(v-model='selected' :items='Hashes' :headers='Headers' :item-key='defaultKey' show-select)

</template>

<script>

  export default {
    name: 'DataTable',
    data () {
      return {
        headers: [],
        selected: []
      }
    },
    props: {
    },
    created () {
    },
    computed: {
      Hashes: function () {
        return this.$store.state.hash.hashes
      },
      Headers: function () {
        return this.$store.state.hash.summary.labels
      }
    },
    methods: {
      plotRecords: function () {
        console.log('Plot ' + this.selected.join(', '))
      }
    }
  }
</script>
