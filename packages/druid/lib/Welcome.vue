<template lang='pug'>
  div
    v-container
      h2 Excel -> Database Translator
      hr
      h4 {{title}}
      v-tabs(v-model='options')
        v-tab(v-if='!Dataset.original' key='upload' ripple) Upload
        v-tab-item(v-if='!Dataset.original' key='upload')
          p &nbsp;
          v-card
            v-card-text
             Upload()

        v-tab(v-if='!Dataset.original' key='test' ripple) Test
        v-tab-item(v-if='!Dataset.original' key='test')
          Test()
        
        v-tab(v-if='Dataset.original' key='data' ripple) Data
        v-tab-item(v-if='Dataset.original' key='data') 
          p &nbsp;
          v-card
            v-card-text
              v-container(v-if='Dataset.hashes')
                DataView()
              v-container(v-else)
                h3 Ensure Data is uploaded with defined headers before viewing data

        v-tab(v-if='Dataset.columnData' key='labels' ripple) Columns
        v-tab-item(v-if='Dataset.columnData' key='labels')
          v-container(style='border: 1px solid black')
            h3.message You may rename labels here as desired prior to transposing to data plot / database format
            hr
            Labels()
        
        v-tab(v-if='Dataset.summary' key='plot' ripple) Plot
        v-tab-item(v-if='Dataset.summary' key='plot') 
          p &nbsp;
          v-card
            v-card-text
              DataPlot()
        
        v-tab(v-if='Dataset.summary' key='report' ripple) Report
        v-tab-item(v-if='Dataset.summary' key='report') 
          p &nbsp;
          v-card
            v-card-text
              DataReport()

        v-tab(v-if='Dataset.summary' key='database' ripple) Database
        v-tab-item(v-if='Dataset.summary' key='database') 
          p &nbsp;
          v-card
            v-card-text
              Data2Database()
      hr

</template>

<script>
  import Upload from './Upload'
  // const Upload = () => import('./Upload')
  const DataPlot = () => import('./DataPlot')
  const DataReport = () => import('./DataReport')
  const DataView = () => import('./DataView')
  const Data2Database = () => import('./Data2Database')
  const Labels = () => import('./Labels')

  const Test = () => import('./Test')

  import d3Svg from './../../svg-svg-helper/lib/d3-svg.js'
  import d3Bar from './../../svg-bar-helper/lib/d3-bar.js'
  import d3Pie from './../../svg-pie-helper/lib/d3-pie.js'
  import d3Data from './../../svg-data-helper/lib/d3-data.js'


  export default {
    name: 'Welcome',
    components: {
      Upload,
      DataPlot,
      DataReport,
      DataView,
      Data2Database,
      Labels,
      Test
    },
    data () {
      return {
        options: '',
        title: 'Use this app to upload data from an Excel Spreadsheet and parse into Database format',
        result: null,
        string: '',
        showRaw: false,
        rawData: '',
        svg: null,

        thickness: 40,
        spacing: 5,

        data: [],
        formatted: [],
        reformatted: [],
        headers: []
      }
    },
    props: {
      msg: {
        type: String
      }
    },
    computed: {
      Dataset: function () {
        return this.$store.state.hash || {}
      }
    },
    methods: {
      loadData (type) {
        if (type === 'gdp') {
          this.data = [
              { "country": "USA", "gdp": 20.5 },
              { "country": "China", "gdp": 13.4 },
              { "country": "Germany", "gdp": 4 },
              { "country": "Japan", "gdp": 4.9 },
              { "country": "France", "gdp": 2.8  }
          ]
          this.formatted = [
              { "country": "USA", "gdp": 20.5 },
              { "country": "China", "gdp": 13.4 },
              { "country": "Germany", "gdp": 4 },
              { "country": "Japan", "gdp": 4.9 },
              { "country": "France", "gdp": 2.8  }
          ]
          this.headers = [
            {text: 'Country', value: 'country'},
            {text: 'GDP', value: 'gdp'}
          ]
          this.scale = 10

        } else if (type === 'simple') {
          this.data = [21, 90, 32, 59, 200, 36, 1, 32, 59]
          this.formatted = [
            {Population: 21},
            {Population: 90},
            {Population: 32},
            {Population: 59},
            {Population: 200},
            {Population: 36},
            {Population: 1},
            {Population: 32},
            {Population: 59}
          ]
          this.headers = ['Population']
          this.scale = 1
        } else if (type === 'excel') {
          this.data = [
            ['George', 42, 'S'],
            ['John', 45, 'M'],
            ['Paul', 49, 'M'],
            ['Ringo', 55, 'S']
          ]
          this.formatted = [
            {name: 'George', age: 42, status: 'S'},
            {name: 'John', age: 45, status: 'M'},
            {name: 'Paul', age: 49, status: 'M'},
            {name: 'Ringo', age: 55, status: 'S'}
          ]
          this.headers = [
            {text: 'Name', value: 'name'},
            {text: 'Age', value: 'age'},
            {text: 'Status', value: 'status'}
          ]        
          this.scale = 10
        } else {
          console.log(type + ' data not defined...')
        }

        var reformatted = d3Data.formatData(this.data, this.headers)
        this.reformatted = reformatted.data
        this.headers = reformatted.headers
        console.log("ORIGINAL: " + JSON.stringify(this.data))
        console.log("EXPECTED: " + JSON.stringify(this.formatted))
        console.log("REFORMAT: " + JSON.stringify(this.reformatted))
        console.log("HEADERS: " + JSON.stringify(this.headers))

        d3Data.loadRawData(this.data)
      },
      testPlot (type) {
        // var svg = d3Helper.initSvg({clear: true, canvasHeight: 600, canvasWidth: 900})
        var svg = d3Svg.initSvg({clear: true, canvasHeight: 600, canvasWidth: 900})
        this.svg = svg

        if (type === 'test') {
          console.log('run test')
          d3Bar.testSvg({svg: svg})
        } else if (type === 'pie chart') {
          console.log('generate pie chart')

          const size = d3Pie.addPie({
          // const size = d3Helper.addBars({
            svg: svg,
            data: this.reformatted,
            headers: this.headers,
            xoffset: 200,
            yoffset: 200,
            scale: this.scale
          })

          console.log('generated pie chart: ' + JSON.stringify(size))

          // d3Helper.resize({id: '#d3Canvas', width: size.maxWidth, height: size.fullHeight})
          // d3Svg.resize({id: '#d3Canvas', width: size.fullWidth, height: size.fullHeight})
        } else if (type === 'horizontal bar chart') {
          console.log('generate bars')

          const size = d3Bar.addBars({
          // const size = d3Helper.addBars({
            svg: svg,
            data: this.reformatted,
            headers: this.headers,
            xoffset: 20,
            spacing: Number(this.spacing),
            thickness: Number(this.thickness),
            orientation: 'horizontal',
            xaxis: 'custom x axis label',
            yaxis: 'custom y axis label',
            scale: this.scale
          })

          console.log('generated bar chart: ' + JSON.stringify(size))

          // d3Helper.resize({id: '#d3Canvas', width: size.maxWidth, height: size.fullHeight})
          d3Svg.resize({id: '#d3Canvas', width: size.fullWidth, height: size.fullHeight})
        } else if (type === 'vertical bar chart') {
          console.log('generate bars')

          // const size = d3Helper.addBars({
          const size = d3Bar.addBars({
            svg: svg,
            data: this.reformatted,
            headers: this.headers,
            xaxis: 'custom x axis label',
            yaxis: 'custom y axis label',
            xoffset: 20,
            spacing: Number(this.spacing),
            thickness: Number(this.thickness),
            scale: this.scale
          })

          console.log('generated bar chart: ' + JSON.stringify(size))

          // d3Helper.resize({id: '#d3Canvas', width: size.maxWidth, height: size.fullHeight})
          d3Svg.resize({id: '#d3Canvas', width: size.fullWidth, height: size.fullHeight})
        }
      }
    },
    watch: {
      Dataset () {
        console.log('Dataset modified...' + this.options)
        if (this.Dataset.original) {
          this.options++
          console.log('reset option to data')
        }
      }
    }
  }
</script>
<style>
  .heading {
    background-color: teal;
    color: white;
    padding: 0.5rem;
    margin: 0.5rem;
  }
  .coloured {
    color: navy;
  }
  .message {
    color: green;
  }
  .highlight {
    color: red;
  }
  .title {
    color: navy;
    text-decoration: underline
  }
  .error {
    /* color: red; */
    padding: 0.5rem;
  }
  thead tr th {
    background-color: powderblue;
  }
  .btn-primary {
    background-color: green !important;
    color: white !important;
  }
  .btn-secondary {
    background-color: lightgreen !important;
    color: black !important;
  }
  .right {
    float: right;
  }

  .cancel {
    background-color: #fcc
  }
</style>