<template lang='pug'>
  v-container
    div(v-if='!Original')
      b No Data Uploaded
    div(v-else)
      h3.heading Raw Data
      
      v-row.justify-space-around
        v-col
          h3
            u Records
          h4.message File Type: {{Summary.source}}
          h4.message Lines in File: {{Original.length}}
          h4.message Records Found: {{Arrays.length}}
          h5 Header Line: {{Summary.header}}
          hr
          h5 Full Lines: {{Summary.details.fullLines.length}}
          h5 Partial Lines included: {{Summary.details.okLines.length}}
          hr
          h5 Blank Lines excluded: {{Summary.details.blankLines.length}}
          h5 Comment Lines excluded: {{Summary.details.commentLines.length}}
          h5 Partial Lines excluded: {{Summary.details.partialLines.length}}
        v-col
          h3
            u Columns
          h4.message Number: {{Summary.columns}}
          h4(v-if='Summary.details') Types:
            ul
              li(v-for='(t,i) in Summary.details.columnTypes') {{i+1}}: {{Summary.headers[i]}} = {{t}}
      hr
      p &nbsp;
      v-row
        v-tabs(v-model='hashKeys')
          v-tab(key='original' ripple) Original
          v-tab-item(key='original')
            p &nbsp;
            h3.coloured
              u Original Data
            div(v-if='Original')
              h3(v-for='d,i in Original')
                b {{i+1}} : 
                pre
                  span.message {{JSON.stringify(d, null, 2)}}
          
          v-tab(key='arrays' ripple) Arrays
          v-tab-item(key='arrays')
            p &nbsp;
            h3.coloured
              u Data as Arrays
            div(v-if='Arrays && Arrays.length')
              h3(v-for='d,i in Arrays')
                b {{i+1}} :
                span.message {{JSON.stringify(d)}}

          v-tab(key='hashes' ripple) Hashes
          v-tab-item(key='hashes')
            p &nbsp;
            h3.coloured
              u Data as Hashes
            div(v-if='Hashes && Hashes.length')
              h3(v-for='d,i in Hashes')
                b {{i+1}} : 
                span.message {{JSON.stringify(d)}}

          v-tab(key='headers' ripple) Headers
          v-tab-item(key='headers')
            p &nbsp;
            h3.coloured
              u Data Headers
            div(v-if='Summary.header && Summary.labels.length')
              h3(v-for='d,i in Summary.labels')
                b {{i+1}} : 
                span.message {{JSON.stringify(d.text)}} &nbsp;
                span ({{JSON.stringify(d.value)}})

          v-tab(v-if='columnData' key='columns' ripple) Columns
          v-tab-item(v-if='columnData' key='columns')
            p &nbsp;
            v-row   
              v-col(v-for='c,i in columnData')
                h4.coloured {{i}}
                h5(v-for='v,k in c') {{k}} = {{v}}

          v-tab(v-if='Summary && Summary.details' key='skipped' ripple) Excluded
          v-tab-item(v-if='Summary && Summary.details' key='skipped')
            h3.coloured
              u Skipped Lines
            div(v-if='Summary.details.partialLines && Summary.details.partialLines.length')
              h4.coloured (less than minimum columns):
              h5(v-for='d,i in Summary.details.partialLines')
                b {{Summary.details.partialLines[i]}} : 
                span.message {{JSON.stringify(Original[d-1])}}
            div(v-if='Summary.details.partialLines && Summary.details.partialLines.length')
              h4.coloured (ony 1 column populated):
              h5(v-for='d,i in Summary.commentLines')
                b {{Summary.details.commentLines[i]}} : 
                span.message {{JSON.stringify(Original[d-1])}}
            div(v-if='Summary && Summary.details.partialLines && Summary.details.commentLines && !Summary.details.commentLines.length + !Summary.details.partialLines.length')
              h4 All lines included (no incomplete records or single value comment lines)
              h4 {{Summary.details.blankLines.length}} Blank lines excluded 
            div(v-else)
              h4 OK: {{Summary.details.okLines.length}}
              h4 Full: {{Summary.details.fullLines.length}}
              h4 Lines: {{Summary.lines}}

    div(v-else)
      v-btn.btn-primary(@click='showRaw=true') Raw Data
        v-icon mdi-arrow-expand

</template>

<script>

  export default {
    name: 'RawData',
    data () {
      return {
        showRaw: false,
        hashKeys: [],
        selected: []
      }
    },
    created () {
      console.log('load Raw Data Page')
    },
    methods: {
      plotRecords: function () {
        console.log('Plot ' + this.selected.join(', '))
      }
    },
    computed: {
      Dataset: function () {
        return this.$store.state.hash || {}
      },
      Original: function () {
        return this.Dataset.original
      },
      Summary: function() {
        return this.Dataset.summary
      },
      Hashes: function () {
        return this.Dataset.hashes
      },
      Arrays: function () {
        return this.Dataset.arrays
      },
      columnData: function () {
        return this.Dataset.columnData
      }
    }
  }
</script>
