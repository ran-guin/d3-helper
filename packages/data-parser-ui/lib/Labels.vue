<template lang='pug'>
  div
    v-container
      v-row.justify-space-between()
        v-col(v-if='Summary.labels.length' cols='6')
          b.title Data Columns:
          v-row.align-center(v-for='v,i in Summary.labels' :key='i')
            v-btn.btn-primary(icon small style='margin: 1rem' @click='loadColumn(i)')
              v-icon mdi-help
            span &nbsp; &nbsp;
            v-text-field(v-model='format[Summary.labels[i].value]' placeholder='enter new column name' :label='Summary.labels[i].value' @change='changeHeader(i)')
        v-col(v-if='Records.length' cols='3')
          b.title First Record
          v-container
            v-text-field(v-for='h,i in Summary.labels' :key='i' v-model='Records[0][i]' :label='h.text' disabled)
        v-col(v-if='Records.length' cols='3')
          b.title Last Record
          v-container
            v-text-field(v-for='h,i in Summary.labels' :key='i' v-model='Records[Records.length-1][i]' :label='h.text' disabled)
    v-dialog(v-model='showColumnData' max-width='500')
      v-card
        v-card-title Column Data
        v-card-text
          DataColumn(:index='loadIndex')
        v-card-actions
          //- v-row.justify-space-around
          v-container
            v-row.justify-space-around
              v-btn.btn-primary(v-if='loadIndex && loadIndex > 1' @click='loadColumn(loadIndex - 2)') Previous
              v-btn.btn-primary(v-if='loadIndex && loadIndex < Summary.headers.length' @click='loadColumn(loadIndex)') Next
              v-btn.cancel(@click='showColumnData=false') Cancel
          //- p &nbsp;
</template>

<script>
  import DataLoader from './DataLoader'
  const DataColumn = () => import('./DataColumn')

  export default {
    name: 'Labels',
    data () {
      return {
        data: [],
        selected: [],
        format: {},
        showHeaders: false,
        loadIndex: 1,
        showColumnData: true
      }
    },
    components: {
      DataColumn
    },
    mixins: [
      DataLoader
    ],
    props: {
      Dataset: {
        type: Object
      }
    },
    methods: {
      loadColumn: function (i) {
        console.log('load column ' + i)
        this.loadIndex = i + 1
        this.showColumnData = true
      }
    },
    computed: {
      Summary: function () {
        return this.$store.state.hash.summary || {}
      },
      Records: function () {
        return this.$store.state.hash.arrays || {}
      }
    },
    watch: {
      Dataset: function () {
        console.log('dataset updated in labels..')
      },
      dataSummary: function () {
          console.log('reset upload in labels...')
      }
    }
  }
</script>

