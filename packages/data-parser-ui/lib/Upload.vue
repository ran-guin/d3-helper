<template lang='pug'>
  div
    b UPLOADER
    v-container(v-if='!Original || !Original.length')
      h2 Upload Data
      hr
      h3.message(v-if='uploadMessage') {{uploadMessage}}
      h3.error(v-if='uploadError') {{uploadError}}
      hr(v-if='uploadMessage || uploadError')
      v-tabs(v-model='uploadTypes')
        v-tab(key='csv' ripple) CSV / TSV / Excel
        v-tab-item(key='csv')
          p &nbsp;
          span(v-if='dataSource != "file" && Original.length') Data already uploaded  as {{dataSource}} (clear dataset to re-upload csv or tsv file instead) {{uploadTypes}}
          v-card(v-else)
            v-card-text
              v-container
                h3 CSV / TSV Data uploader:
                div(v-if='Original && Original.length')
                  h3 {{recordCount}} Records
                  h4(v-if='!hasHeaders') Starting with:
                    pre {{JSON.stringify(Original[0], null, null)}}
                  h4(v-else) From: "{{Original[startIndex][keyIndex]}}" -> "{{Original[endIndex-1][keyIndex]}}"
                  b.message(v-if='note') Note: {{note}}
                  hr
                  v-container
                    p(v-if='!hasHeaders')
                      v-row.justify-space-around
                        v-btn.btn-primary(@click='resetTable({reset: true, headersIncluded: true})') Use First Line for Headers
                        v-btn.btn-primary(@click='presetHeaders') Manually Define Headers
                      hr                    
                div(v-else)                             
                  v-file-input(v-model='uploadFile' id='uploadFile' label='Data File' @change='listen("csv")' :multiple='true')
                  div#embedData

        v-tab(key='demo' ripple) Demo
        v-tab-item(key='demo')
          p &nbsp;
          span(v-if='dataSource != "demo" && dataSource != "tsv" && Original.length') Data already uploaded  as {{dataSource}} (clear dataset to re-upload csv or tsv file instead) {{uploadTypes}}
          v-card(v-else)
            v-card-text
              v-container
                h3 Use Demo Data:
                v-radio-group(v-model='demoType')
                  v-radio(v-for='dType in demoTypes' :label='dType + " - " + Demo[dType].description' :value='dType')
                    //- span(v-if='Demo[dType]') {{Demo[dType].description}}
                v-btn.btn-primary#demo(@click='listen("demo")') Load Demo File

        v-tab(key='raw' ripple) Raw Data
        v-tab-item(key='raw')
          p &nbsp;
          span(v-if='dataSource != "JSON" && dataSource != "YAML" && Original.length') Data already uploaded  as {{dataSource}} (clear dataset to re-upload csv or tsv file instead) {{uploadTypes}}
          v-card(v-else)
            v-card-text
              v-container
                h3 Raw Data uploader:
                v-tabs(v-model='rawTypes')
                  v-tab(key='json' ripple) JSON Data
                  v-tab-item(key='json')
                    p &nbsp;
                    v-card
                      v-card-text
                        v-container
                          v-textarea(v-model='raw' label='JSON Data' placeholder="eg {firstName: 'Victor', lastName: 'Hugo'}")  
                          p            
                            v-btn.btn-primary(@click='loadRaw("JSON")') Load Raw JSON Data             
                  v-tab(key='yaml' ripple) YAML Data
                  v-tab-item(key='yaml') 
                    p &nbsp;
                    v-card
                      v-card-text
                        v-container
                          v-textarea(v-model='raw' label='YAML Data')
                          p
                            v-btn.btn-primary(@click='loadRaw("YAML")') Load Raw YAML Data             
      
    v-container(v-else key='clear' ripple)
      v-btn.btn-primary(@click='clearRecord()') Clear Dataset
        
      div(v-if='Summary && Summary.labels && Summary.labels.length' style='border: 1px solid black')
        DataTable()
</template>

<script>
  const DataTable = () => import('./DataTable')

  import d3DataPrep from 'd3-data-prep'
  import Demo from './Demo.js'

  export default {
    name: 'Upload',
    mixins: [
    ],
    components: {
      DataTable
    },
    data () {
      return {
        uploadTypes: [],
        uploadMessage: '',
        uploadError: '',
        dataSource: '',


        rawTypes: [],
        // excelFile: null,
        uploadFile: null,
        demoFile: null,
        demoType: 'csv',
        demoTypes: ['gdp', 'covid', 'spreadsheet'],
        raw: '',
        headers: [],
        
        format: {},
        skipTop: 0,
        skipBottom: 0,
        selected: [],

        showHeaders: true,
        showRaw: false,
        note: ''
      }
    },
    props: {
    },
    created () {
      console.log('load Upload Page')
      if (this.Dataset && Object.keys(this.Dataset).length) {
        console.log('initialize using preset database... ?' + JSON.stringify(this.Dataset))
        // this.initData(this.Dataset, 'welcome')
      }
    },
    mounted () {
      // this.listen()
    },
    computed: {
      Original: function () {
        return this.$store.state.hash.original || []
      },
      Summary: function () {
        return this.$store.state.hash.summary || {}
      },
      Demo: function () {
        return Demo
      }    
    },
    methods: {
      clearRecord () {
        console.log('clear stored data hash')
        this.$store.dispatch('setHash', {})
      },
      async listen (type) {

        if (type === 'demo') {
          console.log('use demo File')
          var demo = Demo[this.demoType]
          console.log("Loaded Demo Data: " + JSON.stringify(demo))
          console.log('type: ' + demo.dataset.constructor)
          this.$set(this, 'raw', demo.dataset)

          this.loadRaw(demo.dataset)
        } else if (this.uploadFile && this.uploadFile.length) {
          console.log('FILE found: ' + this.uploadFile.length)
          d3DataPrep.loadFile(this.uploadFile)
          .then( dataset => {
            console.log("UPLOADED IN UPLOAD: " + JSON.stringify(Object.keys(dataset)))

            this.$store.dispatch('setHash', dataset)
          })
        } else {
          console.log('no ' + type + ' file defined')
        }
      },
      async loadRaw (source) {
        var raw = this.raw

        console.log('loading Raw ' + source + ' data: ' + raw + ' as ' + raw.constructor)
        
        var dataset = await d3DataPrep.loadRaw(raw, source)
        console.log('loaded: ' + JSON.stringify(dataset))
        this.$store.dispatch('setHash', dataset)
      }
    },
    watch: {
    }
  }
</script>
