<template lang='pug'>
  div
    v-row.justify-space-around
      v-col
        h3 Size
        //- v-radio-group(v-model='options.yAxis')
          v-radio(v-for='label in Summary.labels' :value='label.text' :label='label.text' @click='update()')
      v-col
        h3 Axes
        //- v-radio-group(v-model='options.yOperator')
        //-   v-radio(v-for='type in yOperators' :label='type' :value='type' @click='update()')
      v-col
        h3 Labels
        //- v-radio-group(v-model='options.yColumn')
        //-   v-radio(v-for='label in Summary.labels' :label='label.text' :value='label.text' @click='update()')
</template>

<script>
  export default {
    name: 'PlotOptions',
    data () {
      return {
      }
    },
    props: {
      plotType: {
        type: String
      },
      options: {
        type: Object
      }
    },
    created () {
      console.log('load Plotting Options')
    },
    methods: {
      update () {
        if (this.onUpdate) {
          this.onUpdate(this.options)
        }
      }
    },
    computed: {
      Summary: function () {
        return this.$store.state.hash.summary || {}
      },
      ColumnData: function () {
        return this.$store.state.hash.columnData || {}
      }
    }
  }
</script>
