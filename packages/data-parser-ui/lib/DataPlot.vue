<template lang='pug'>
  div
    v-container
      h2 Plot Data
      h3(v-if='xAxis || yAxis')
        span.message {{xAxis}} &nbsp;
        span vs &nbsp;
        span.message {{yAxis}}
      h3
        span.highlight(v-if='xAxis && ColumnData[xAxis]') {{ColumnData[xAxis].type}} &nbsp;
        span(v-if='xAxis || yAxis') vs &nbsp;     
        span.highlight(v-if='yAxis && ColumnData[yAxis]') {{ColumnData[yAxis].type}}
      hr
      v-row
        v-col(cols='8')
          v-tabs(v-model='define')
            v-tab(key='x' ripple) X-Axis
            v-tab-item(key='x')
              p &nbsp;
              v-container(style='border: 1px solid black')
                div
                  v-row.justify-space-around
                    v-col
                      h3 Select X Axis
                      v-radio-group(v-model='xAxis')
                        v-radio(v-for='label in Summary.labels' :value='label.text' :label='label.text' @click='loadXAxis')
            v-tab(key='Y' ripple) Y-Axis
            v-tab-item(key='Y')
              p &nbsp;
              v-row
                v-col(cols='8')
                  v-container(style='border: 1px solid black')
                      v-row.justify-space-around
                        v-col
                          h3 Y Axis
                          v-radio-group(v-model='yAxis')
                            v-radio(v-for='label in Summary.labels' :value='label.text' :label='label.text' @click='loadYAxis')
                        v-col
                          h3 Operator
                          v-radio-group(v-model='yOperator')
                            v-radio(v-for='type in yOperators' :label='type' :value='type' @click='loadYOperator')
                        v-col
                          h3 Group (optional)
                          v-radio-group(v-model='yColumn')
                            v-radio(v-for='label in Summary.labels' :label='label.text' :value='label.text' @click='loadYGroup')
            v-tab(key='options' ripple) Options
            v-tab-item(key='opions')
              p &nbsp;
              v-row
                v-col(cols='8')
                  v-container(style='border: 1px solid black')
                    PlotOptions(:options='plotOptions' :onUpdate='updateOptions')
                      //- v-row.justify-space-around
                      //-   v-col
                      //-     h3 Size:
                      //-     v-radio-group(v-model='yAxis')
                      //-       v-radio(v-for='label in Summary.labels' :value='label.text' :label='label.text' @click='loadYAxis')
                      //-   v-col
                      //-     h3 Axes:
                      //-     v-radio-group(v-model='yOperator')
                      //-       v-radio(v-for='type in yOperators' :label='type' :value='type' @click='loadYOperator')
                      //-   v-col
                      //-     h3 Labels
                      //-     v-radio-group(v-model='yColumn')
                      //-       v-radio(v-for='label in Summary.labels' :label='label.text' :value='label.text' @click='loadYGroup')
        v-col(cols='4')
          v-container
            p &nbsp;
            h2.coloured Plotting Options:
            p &nbsp;
            div(v-if='yAxis && ColumnData[xAxis] && ColumnData[yAxis]')
              h4 {{ColumnData[yAxis].type }} vs {{ColumnData[yAxis].type}} options:

              p
                v-btn.btn-primary(@click='plotRecords("bar")' :disabled='!(ColumnData[yAxis].type === "number")') Plot Bar Chart
                span &nbsp (yaxis = number)
              p
                v-btn.btn-primary(@click='plotRecords("bar", "horizontal")' :disabled='!(ColumnData[yAxis].type === "number")') Plot Horizontal Bar Chart
                span &nbsp (yaxis = number)
              p
                v-btn.btn-primary(@click='plotRecords("pie")' :disabled='!(ColumnData[yAxis].type === "number")') Plot Pie
                span &nbsp (yaxis = number)
              p
                v-btn.btn-primary(@click='plotRecords("scatter")' :disabled='!(ColumnData[xAxis].type === "number" && ColumnData[yAxis].type === "number")') Plot Scatter
                span &nbsp (xaxis= number, yaxis = number)
              p
                v-btn.btn-primary(@click='plotRecords("line")' :disabled='!(ColumnData[xAxis].type === "number" && ColumnData[yAxis].type === "number")') Plot Line
                span &nbsp (xaxis= number, yaxis = number)
            div(v-else)
              b Choose x & y axes to enable plotting options...
      p &nbsp;
      v-container(style='border: 1px solid black')
        h3 Canvas
        div#d3Canvas.canvas   

</template>

<script>

  import d3Svg from 'svg-d3'
  // import d3DataPrep from 'd3-data-prep'
  import d3DataParse from 'd3-data-parser'
  import d3Bar from 'bar-plot-d3'
  import d3Pie from 'pie-chart-d3'
  import d3Scatter from 'scatter-plot-d3'

  import Demo from './Demo.js'

  const PlotOptions = () => import('./PlotOptions')

  export default {
    name: 'DataPlot',
    data () {
      return {
        headers: [],
        selected: [],
        choose: null,
        define: '',
        xAxis: '',
        yAxis: '',
        yOperator: '',
        yColumn: '',
        yOperators: ['Count', 'Sum', 'Avg'],

        plotOptions: {

        },
        plotType: null
      }
    },
    components: {
      PlotOptions
    },
    props: {
    },
    created () {
      console.log('load Plotting Page')
    },
    methods: {
      loadXAxis: function () {
        console.log('set X Axis to ' + this.xAxis)
        this.define++
      },
      loadYAxis: function () {
        console.log('set Y Axis to ' + this.yAxis)
      },
      loadYOperator: function () {
        console.log('group Y column by: ' + this.yOperator)
      },
      loadYGroup: function () {
        console.log('group Y column by: ' + this.yGroup)
      },
      async testPlot (type) {
        var data = Demo.gdp
        var x = data.xAxis
        var y = data.yAxis

        console.debug('*** Plot: ' + JSON.stringify(data))
        var dataset = await d3DataParse.loadDataSet(data.dataset, x, y, this.yOperator, this.yGroup)

        console.log('*** Filtered to: ' + JSON.stringify(dataset))

        var xaxis = x
        var yaxis = (x === y) ? this.yOperator : this.yOperator + ' ' + y

        var svg = d3Svg()
        if (type === 'circle') {
          console.log('generate circle')
          d3Svg.addCircle({ x: 60, y: 60, radius: 50})
        } else if (type === 'rectangle') {
          console.log('generate circle')
          d3Svg.addRectangle({})  
        } else if (type === 'bar') {
          console.log('generate bar chart')
          d3Bar.addBars({svg: svg, data: dataset, xaxis: x, yaxis: yaxis})
        } else if (type === 'pie') {
          console.log('generate pie chart')
          d3Pie.addPie({svg: svg, data: dataset, x: xaxis, y: yaxis})
        } else if (type === 'scatter') {
          console.log('generate scatter chart')
          d3Pie.addPie({svg: svg, data: dataset, x: xaxis, y: yaxis})
        } else {
          console.log(type + ' plot not set up...')
        }
      },
      async plotRecords (type, subtype) {
        console.log('Plot ' + type + ' : ' + subtype)
        this.plotType = type
        var svg = d3Svg.initSvg({clear: true, canvasHeight: 600, canvasWidth: 900})

        if (this.yOperator === 'Count') { this.yAxis = this.xAxis }
        await d3DataParse.loadDataSet(this.Hashes, this.xAxis, this.yAxis, this.yOperator, this.yGroup)
        .then (dataset => {
          console.log('retrieved parsed dataset: ' + JSON.stringify(dataset))

          var xaxis = this.xAxis
          var yaxis = (this.xAxis === this.yAxis) ? this.yOperator : this.yOperator + ' ' + this.yAxis
          
          if (type === 'bar') {
            console.log('generate bar chart for ' + xaxis + ' vs ' + yaxis)
            var input = {
              svg: svg,
              data: dataset,
              xaxis: xaxis,
              yaxis: yaxis,
              orientation: subtype
            }
            console.log('send: ' + JSON.stringify(input))
            d3Bar.addBars(input)
          } else if (type === 'pie') {
            d3Pie.addPie({svg: svg, data: dataset, xaxis: xaxis, yaxis: yaxis})
          } else if (type === 'scatter') {
            d3Scatter.addScatter({svg: svg, data: dataset, xaxis: xaxis, yaxis: yaxis})
          } else {
            console.log(type + ' plotting not yet set up... ')
          }
        })
        .catch (err => {
          console.log('err: ' + err.message)
        })      

      },
      updateOptions (options) {
        console.log('updated Options: ' + JSON.stringify(options))
      }
    },
    computed: {
      Hashes: function () {
        return this.$store.state.hash.hashes || []
      },
      Summary: function () {
        return this.$store.state.hash.summary || {}
      },
      ColumnData: function () {
        return this.$store.state.hash.columnData || {}
      }

    }
  }
</script>
