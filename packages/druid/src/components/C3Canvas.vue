<template lang='pug'>
  section
    v-row.justify-space-around
      v-btn(@click='loadCovid' color='yellow') Covid Data
      v-btn(@click='loadSample1' color='yellow') Sample Data
      v-btn(@click='loadExampleData' color='yellow') Date Grouped
      v-btn(@click='loadCountryData' color='yellow') Country Data
      v-btn(@click='testData()' color='blue') Run Test
      v-btn(@click='redraw' color='blue') Render      
      v-btn(@click='animateData' color='orange') Animate      
    hr
    
    div(v-if='loading')
      h3 Loading...
    v-container.outercanvas(v-else style='width: 100%')
      h3 {{datasetName}}:
      h3.heading
        v-row.justify-space-around
          span X: {{axes.x}}
          span Y: {{axes.y}}
          v-btn(color=blue @click='axes = {x: [], y: []}') Reset Axes
      v-row.justify-space-around(v-if='filterBlock')
        v-row
          //- v-col
          //-   h4 X-Axis
          //-   h6(v-if='yAxes && dataset.length > 2') {{dataset[0][yAxes]}}, {{dataset[1][yAxes]}}, {{dataset[2][yAxes]}}, ...
          //-   v-radio-group(v-model='yAxes')
          //-     v-radio(v-for='col in dataColumns' :key='col' :label='col' :value='col' @click='pick(col)')
          //- v-col
          //-   h4 Y-Axis
          //-   h6(v-if='yAxes && dataset.length > 2') {{dataset[0][yAxes]}}, {{dataset[1][yAxes]}}, {{dataset[2][yAxes]}}, ...
          //-   v-radio-group(v-model='yAxes')
          //-     v-radio(v-for='col in dataColumns' :key='col' :value='col' :label='col' @click='pick(col)')
          //- v-col
          //-   v-radio-group(v-model='filterAtt')
          //-     v-radio(v-for='col in dataColumns' :key='col' :value='col' :label='col' @click='pick(col)')
          //-   v-text-field(v-model='filterVal' placeholder='Filter value')
      hr
      div
        h4 C3 Canvas
        div#c3Canvas
      hr
      div
        v-row
          v-col
            h3 C3 config
            h6
              pre {{JSON.stringify(c3Config, null, 2)}}
          v-col
            h3 Normalize config
            h6
              pre {{JSON.stringify(normalizeConfig, null, 2)}}
        hr
        v-row
          v-col
            h5 Raw Data:
            h6
              pre {{JSON.stringify(dataset, null, 2)}}
          v-col
            h5 Normalized Data:
            h6
              pre {{JSON.stringify(normalized, null, 2)}}
      //- div
        v-checkbox(v-model='axes[col]' v-for='col in dataColumns' :key='col' :label='col' @click='pick(col)')
        hr
        
</template>

<script>
import * as d3 from 'd3'
// import * as c3 from 'c3'

import C3Helper from '@/mixins/C3Helper'
import D3Helper from '@/mixins/D3Helper'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  mixins: [
    C3Helper,
    D3Helper
  ],
  data() {
    return {
      element: '',
      canvas: null,
      D3canvas: null,
      chart: null,

      dataset: [],
      normalized: [],
      c3Config: {},
      normalizeConfig: null,

      canvasHeight: 400,
      canvasWidth: 400,
      pickData: false,

      datasetName: '',
      axes: {
        x: [],
        y: []
      },
      loading: false,

      filterBlock: true,
      filterAtt: '',
      filterVal: '',

      filter: 'Circle',
      xpos: 60,
      ypos: 60,
      radius: 40,

      scale: 10,
      colour: 'blue',
      
      orientation: 'Ring',
      hole: 30,

      startAngle: 0,
      endAngle: 270,
      innerRadius: 100,
      outerRadius: 150       
    };
  },
  async mounted() {
    // this.generatePie();
    this.canvas = this.initializeC3()
  },
  created: function () {
    console.log('initialize page')
  },
  computed: {
    records: function () {
      return this.dataset.length || 0
    },
    dataColumns () {
      if (this.dataset && this.dataset.length) {
        return Object.keys(this.dataset[0])
      } else {
        return []
      }
    },
    pie () {
      return d3.pie()
        .value(d => d.value)

    }
  },
  methods: {
    async loadCovid () {
      this.clearD3Chart()

      const filters = [
        { continent: 'Europe' },
        { location: true }, // 'A', matchString: true },
        { date: '2020-03', matchString: true},
        { total_cases: true }
      ]

      this.datasetName = 'Covid Data'
      
      var dataset = await this.d3LoadFile('https://covid.ourworldindata.org/data/owid-covid-data.csv', filters)
      
      if (this.dataset) {
        console.log('loaded file with ' + dataset.length + ' records ')
      } else {
        console.log('file not found...')
      }

      var aggregations =  {combine: 'location', split: ['date'], y: 'total_cases'}
      this.dataset = this.d3Aggregate(dataset, aggregations)
      console.log("Aggregated example: " + this.dataset[0])

      this.normalizeConfig = {
        xAxes: ['location'],
        yAxes: ['total_cases'],
        split: ['date'],
        group: ['location']
      }

      this.c3Config = {
        data: {
          x: 'x',
          type: 'bar',
          // axes: {
          //   x: ['country'],
          //   y: ['gdp']
          // }
        },
        axis: {
          x: {
            type: 'category'
          }
        }
      }

      this.redraw('location')
      // this.chart = this.drawC3()
      // this.loadC3Data(this.chart, this.dataset)
    },
    loadCountryData: function () {

      this.clearD3Chart()

      this.dataset = [
        {country: "USA", gdp: 20.5 },
        {country: "China", gdp: 13.4 },
        {country: "Germany", gdp: 4.0 },
        {country: "Japan", gdp: 4.9 },
        {country: "France", gdp: 2.8 }
      ]

      this.normalizeConfig = {
        xAxes: ['country'],
        yAxes: ['gdp']
      }

      this.c3Config = {
        data: {
          type: 'bar',
          // axes: {
          //   x: ['country'],
          //   y: ['gdp']
          // }
        }
      }

      this.datasetName = 'Sample Country Data'
      console.log('... and draw...')
      this.redraw()
    },
    async loadExampleData () {

      this.clearD3Chart()

      this.dataset = [
        {country: "USA", date: '2020-01', cases: 20.5 },
        {country: "China", date: '2020-01', cases: 13.4 },
        {country: "Germany", date: '2020-01', cases: 4.0 },
        {country: "Japan", date: '2020-01', cases: 4.9 },
        {country: "France", date: '2020-01', cases: 2.8 },

        {country: "USA", date: '2020-02', cases: 2.5 },
        {country: "China", date: '2020-02', cases: 1.4 },
        {country: "Germany", date: '2020-02', cases: 4.0 },
        {country: "Japan", date: '2020-02', cases: 4.9 },
        {country: "France", date: '2020-02', cases: 2.8 },

        {country: "USA", date: '2020-03', cases: 12.5 },
        {country: "China", date: '2020-03', cases: 12.4 },
        {country: "Germany", date: '2020-03', cases: 4.0 },
        {country: "Japan", date: '2020-03', cases: 4.9 },
        {country: "France", date: '2020-03', cases: 2.8 },

        {country: "USA", date: '2020-04', cases: 2.0 },
        {country: "China", date: '2020-04', cases: 1.4 },
        {country: "Germany", date: '2020-04', cases: 4.0 },
        {country: "Japan", date: '2020-04', cases: 4.9 },
        {country: "France", date: '2020-04', cases: 2.8 },

        {country: "USA", date: '2020-05', cases: 21.5 },
        {country: "China", date: '2020-05', cases: 14.4 },
        {country: "Germany", date: '2020-05', cases: 4.0 },
        {country: "Japan", date: '2020-05', cases: 4.9 },
        {country: "France", date: '2020-05', cases: 2.8 },

        {country: "USA", date: '2020-06', cases: 2.5 },
        {country: "China", date: '2020-06', cases: 1.4 },
        {country: "Germany", date: '2020-06', cases: 4.0 },
        {country: "Japan", date: '2020-06', cases: 4.9 },
        {country: "France", date: '2020-06', cases: 2.8 }
      ]

      this.normalizeConfig = {
        xAxes: ['country', 'date'],
        yAxes: ['cases']
      }

      this.c3Config = {
        data: {
          type: 'bar',
          // axes: {
          //   x: ['country'],
          //   y: ['cases']
          // }
        }
      }

      const atts = [
        { name: 'country', type: 'string'},
        { name: 'date', type: 'date', format: '%y', group: 'country'},
        { name: 'cases'}
      ]
      this.normalized = await this.convertObjectsToArrays(this.dataset, atts)
      console.log('Normalized Dataset: ' + JSON.stringify(this.normalized))

      this.datasetName = 'Sample Country Data'
      console.log('... and draw...')
      // this.redraw()
    },

    loadSample1: function () {
      this.clearD3Chart()

      this.dataset = [
        ['data1', 300, 100, 250, 150, 300, 150, 500],
        ['data2', 100, 200, 150, 50, 100, 250],
        ['data3', 200, 200, 150, 50, 100,350]
      ]

      this.c3Config = {
        data: {
          axes: {
            'data1': 'y',
            'data2': 'y2',
            'data3': 'y2'
          },
          type: 'bar',
          types: {
            data1: 'bar',
            data2: 'bar',
            data3: 'line'
          },
          groups: [
            ['data1', 'data2']
          ]
        },
        axis: {
          // rotated: true,
          x: { label: 'X Label'},
          y: { label: 'Megatons of CO2'},
          y2: { label: 'Alt label for some data' },
        }
      }

      // this.c3Config = {
      //   data: {
      //     axes: {
      //       x: ['data1', 'data2'],
      //       y: ['countVal']
      //     }
      //   }
      // }

      this.datasetName = 'Sample Generic Data'

      console.log('... and draw...')
      this.redraw()
      // this.chart = this.drawC3(this.dataset)
      // this.loadC3Data(this.chart, this.dataset)
    },
    clearD3Chart () {
      if (this.normalized && this.normalized.length) {
        var sets = this.normalized.map(d => d[0])
        console.log('clear: ' + sets.join(', '))
        this.chart.unload({ids: sets})
      } else {
        console.log('no data to clear')
      }
    },
    async redraw () {
      console.log('redraw c3 canvas...')
      if (this.normalizeConfig) {
        const normalized = await this.normalizedC3Data(this.dataset, this.normalizeConfig)

        if (normalized.groups) {
          console.log('normalized return: ' + JSON.stringify(normalized))
          
          this.c3Config.data.categories = normalized.categories
          this.c3Config.data.groups = [normalized.groups]
          // if (!this.c3Config.data.axes) { this.c3Config.data.axes = {} }
          // this.c3Config.data.axes = normalized.groups.map(g => { this.c3Config.data.axes[g] = 'y' })

          console.log(JSON.stringify(this.c3Config))
        }
        this.normalized = normalized.dataset
        console.log('render normalized data: ' + JSON.stringify(this.normalized))
        console.log(this.c3Config)
        this.chart = this.drawC3(this.normalized, this.c3Config)
      } else {
        this.chart = this.drawC3(this.dataset, this.c3Config)
      }

    },
    pick (col) {
      console.log('filter on ' + col + ' : ' + this.filterAtt + ' = ' + this.filterVal)
      this.redraw()
    },
  
    animateData () {
      var loads = []
      var unloads = []
      if (this.datasetName === 'Sample Country Data') {
        loads = [
            [['Canada', 8.8]],
            [['Brazil', 18.9]]
          ]
          unloads = [['Japan']]
      } else if (this.datasetName === 'Sample Generic Data') {
        loads = [
          [['data3', 100, 250, 150, 200, 100, 350]]
          // [['data1', 100, 250, 150, 200, 100, 350]],
          // [['data3', 80, 150, 100, 180, 80, 150]]
        ]
        unloads = [['data2']]        
      }
      console.log('loading: ' + JSON.stringify(loads))
      console.log('unloading: ' + JSON.stringify(unloads))
      this.load()
      this.unload()

      console.log('animate')
    },
  
    load () {
      console.log('use: ' + this.chart.constructor)
      this.chart.load({
        columns: [
          ['data1', 300, 100, 250, 150, 300, 150, 500],
          ['data3', 100, 200, 150, 50, 100, 250]
        ]
      })
    },
    unload () {
      this.chart.unload({ids: ['data2'] })
    }
  },
  watch: {
    dataset () {
      console.log('dataset updated...')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.heading {
  padding: 1rem;
  margin-bottom: 2rem;
  background-color: teal;
  color: ivory;
}

.outercanvas {
  padding: 2rem;
  border: 1px solid black;
  background-color:lightgrey;
  width: min-content;
}
</style>
