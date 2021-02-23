<template lang='pug'>
  div
    v-card
      v-card-text
        v-text-field(v-model='thickness' label='Thickness')
        v-text-field(v-model='spacing' label='Spacing')
        
        div(v-if='!data || !data.length')
          p
            v-btn.btn-primary(@click='loadData("simple")') Simple Array
          p
            v-btn.btn-primary(@click='loadData("gdp")') GDP Data
          p
            v-btn.btn-primary(@click='loadData("excel")') Excel Data
          p
            v-btn.btn-primary(@click='loadData("json")') JSON Data
        div(v-else)
          h3 {{data.length}} + Records loaded
          h6 {{data}}
          p
            v-btn.btn-primary(@click='testPlot("test")') Test svg
          p
            v-btn.btn-primary(@click='testPlot("pie chart")') Pie Chart
          p
            v-btn.btn-primary(@click='testPlot("horizontal bar chart")') Horizontal Bar Chart
          p
            v-btn.btn-primary(@click='testPlot("vertical bar chart")') Vertical Bar Graph
          p
            v-btn.btn-primary(@click='testPlot("scatter")') Scatter
          p
            v-btn.btn-primary(@click='testPlot("line")') Line
          p
            v-btn.btn-primary(@click='testPlot("bar")') Test Plot
          p
            v-btn.btn-primary(@click='data = []') Clear Data
        hr
        p &nbsp;
        v-container(style='border: 1px solid black')
          h3 Canvas
          div#d3Canvas.canvas   
</template>

<script>
  import d3Svg from './../../d3-svg-helper/lib/d3-svg.js'
  import d3Bar from './../../d3-bar-helper/lib/d3-bar.js'
  import d3Pie from './../../d3-pie-helper/lib/d3-pie.js'
  import d3Scatter from './../../d3-scatter-helper/lib/d3-scatter.js'

  import d3Data from './../../d3-data-helper/lib/d3-data.js'
  import d3Parse from './../../d3-data-helper/lib/d3-parse-data.js'

  export default {
    name: 'Test',
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
        } else if (type === 'json') {

          console.log('simulate json data...')
          var raw = [
            {continent: "Asia", country: "Korea", gdp: 55, population: 50},
            {continent: "Asia", country: "China", gdp: 127, population: 1400},
            {continent: "Asia", country: "Singapore", gdp: 77, population: 12},
            {continent: "N America", country: "USA", gdp: 111, population: 340},
            {continent: "N America", country: "Canada", gdp: 45, population: 32},
            {continent: "N America", country: "Mexico", gdp: 111, population: 480},
            {continent: "S America", country: "Brazil", gdp: 64, population: 630},
            {continent: "S America", country: "Argentina", gdp: 29, population: 29},
            {continent: "S America", country: "Colombia", gdp: 36, population: 45},
            {continent: "Europe", country: "Germany", gdp: 49, population: 27},
            {continent: "Europe", country: "France", gdp: 39, population: 24},
            {continent: "Europe", country: "Netherlands", gdp: 34, population: 19},
            {continent: "Europe", country: "UK", gdp: 45, population: 26}
          ]

          console.log("JSON: " + JSON.stringify(raw))

          d3Parse.loadRaw(JSON.stringify(raw), 'JSON')
          .then( dataset => {
            console.log("reformatted to: " + JSON.stringify(dataset))
            this.$store.dispatch('setHash', dataset)
          })
          .catch( err => {
            console.log("Error: " + err.message)
          })
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
        // this.headers = reformatted.headers
        // console.log("ORIGINAL: " + JSON.stringify(this.data))
        // console.log("EXPECTED: " + JSON.stringify(this.formatted))
        // console.log("REFORMAT: " + JSON.stringify(this.reformatted))
        // console.log("HEADERS: " + JSON.stringify(this.headers))
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

          console.log('generated horizontal bar chart: ' + JSON.stringify(size))

          // d3Helper.resize({id: '#d3Canvas', width: size.maxWidth, height: size.fullHeight})
          d3Svg.resize({id: '#d3Canvas', width: size.fullWidth, height: size.fullHeight})
        } else if (type === 'scatter') {
          console.log('generate scatter plot for ' + JSON.stringify(this.reformatted))

          // const size = d3Helper.addBars({
          const size = d3Scatter.addScatter({
            svg: svg,
            data: this.reformatted,
            headers: this.headers,
            xaxis: 'custom x axis label',
            yaxis: 'custom y axis label',
          })

          console.log('generated scatter chart: ' + JSON.stringify(size))

          // d3Helper.resize({id: '#d3Canvas', width: size.maxWidth, height: size.fullHeight})
          d3Svg.resize({id: '#d3Canvas', width: size.fullWidth, height: size.fullHeight})
        // } else if (type === 'line chart') {
        //   console.log('generate line chart')

        //   // const size = d3Helper.addBars({
        //   const size = d3Bar.addBars({
        //     svg: svg,
        //     data: this.reformatted,
        //     headers: this.headers,
        //     xaxis: 'custom x axis label',
        //     yaxis: 'custom y axis label',
        //     xoffset: 20,
        //     spacing: Number(this.spacing),
        //     thickness: Number(this.thickness),
        //     scale: this.scale
        //   })

        //   console.log('generated bar chart: ' + JSON.stringify(size))

        //   // d3Helper.resize({id: '#d3Canvas', width: size.maxWidth, height: size.fullHeight})
        //   d3Svg.resize({id: '#d3Canvas', width: size.fullWidth, height: size.fullHeight})
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
