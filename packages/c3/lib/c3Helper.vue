<script>
import * as d3 from 'd3'
import * as c3 from 'c3'

export default {
  data() {
      return {
        defaultC3CanvasId: 'c3Canvas',
        defaultC3CanvasHeight: '400px',
        defaultC3CanvasWidth: '600px'
      }
  },
  methods: {
    initializeC3: function (options) {
      if (!options) { options = {} }
      var id = options.id || this.defaultCanvasId
      if (options.clear) {
        d3.select('#' + id).selectAll('svg').remove()
        console.log('cleared canvas')
      }
      
      console.log('add svg to canvas...')
      return  d3.select('#' + id)
        .append('svg')
          .attr('height', options.height || this.defaultC3CanvasHeight)
          .attr('width', options.width || this.defaultC3CanvasWidth)
    },
    updateC3Config (dataset, config) {
      console.log('update C3 config based on dataset... ' + JSON.stringify(config))
      if (!config) {
        config = {}
      }

      if (!config.data) {
        config.data = {}
      }

      return config
    },
    c3Default (dataset) {
      var def = {}
      def.axes = {}
      def.types = {}

      console.log('gen def from set: ' + JSON.stringify(dataset))
      dataset.map(d => {
        const label = d[0]
        def.axes[label] = 'y'
        def.types[label] = 'bar'
      })
      return def
    },
    async convertObjectsToArrays (dataset, attributes) {
        
      var formatDate
      var dateField
      var groupDatesFor
      var Total = {}
      console.log(dataset)
      console.log('Dataset: ' + JSON.stringify(dataset))
      console.log('Attributes; ' + JSON.stringify(attributes))
      for (var k = 0; k < attributes.length; k++) {
        const att = attributes[k]
        if (att.type === 'date') {
          var format = att.format || '%y-%b-%d'
            
          formatDate = d3.timeFormat(format)

          dateField = att.name
          console.log('format ' + att.name + ' as ' + format)
        
          if (att.group) { groupDatesFor = att.group }
        }
      }

      
      var AofA = []
      for (var i = 0; i < dataset.length; i++) {
        var A = []
        console.log(JSON.stringify('*** ' + JSON.stringify(dataset[i])))
        var keys = Object.keys(dataset[i])
        console.log('Keys: ' + keys.join(', '))
        var combined = false
        for (var j = 0; j < attributes.length; j++) {
          var att = attributes[j]
          var col = att.name
          var type = att.type || 'value'

          var val
          if (type === 'string') {
            val = dataset[i][col]
          }
          else if (type === 'value') {
            val = +dataset[i][col]

            if (groupDatesFor) {
              var group = formatDate(new Date(dataset[i][dateField]))
              var set = dataset[i][groupDatesFor]
              if (Total[set] && Total[set][group]) {
                combined = Total[set][group].original
              } else {
                if (!Total[set]) { Total[set] = {} }
                Total[set][group] = {original: i + 1, total: 0, count: 0}
              }
              
              Total[set][group].total = Total[set][group].total + dataset[i][col]
              Total[set][group].count++

              val = Total[set][group].total
              console.log('Total: ' + JSON.stringify(Total))
            }
          } else if (type === 'date') {
            val = formatDate(new Date(dataset[i][col]))
            console.log(dataset[i][col] + ' -> ' + val)
          } else {
            console.log("type not defined for " + col)
          }
          A.push(val)
          console.log(col + ' = ' + val)
        }
        if (combined) {
          AofA[combined - 1] = A
          console.log(combined + ' reset to ' + JSON.stringify(A))
        } else {
          AofA.push(A)
        }
        JSON.stringify(i + ': ' + JSON.stringify(A))
      }
      console.log('Return: ' + JSON.stringify(AofA))
      return new Promise(resolve => { resolve(AofA) })
    },
    normalizedC3Data (dataset, options) {
      var {xAxes, yAxes, group, split, nullValue} = options

      console.debug('normalize: ' + JSON.stringify(dataset))
      console.debug(JSON.stringify(options))

      var xlabels = []
      var ylabels = []

      if (dataset.length && dataset[0].constructor === Object) {
        if (xAxes && yAxes && xAxes.length && yAxes.length) {
          var normalized = []
          for (var a = 0; a < xAxes.length; a++) {
            const attribute = xAxes[a]

            console.log('convert objects to arrays based upon ' + attribute)
            var newArray = []
            dataset.map((d) => {
              if (group && split) {
                // yaxes = v1, v2, xaxis = grp, split: subgrp -> domains = a, b; labels = A, B;
                // combine {grp: 'A', subgrp: 'a', v1: 1, v2: 7}, {grp: 'A', subgrp: 'b', v1: 2, v2: 7}, {grp: 'B', subgrp: 'a', v1: 4, v2: 7}, {grp: 'B', subgrp: 'b', v1: 3, v2: 7}
                // into ['a-v1', 1, 4 ] + ['b-v1', 2, 3] + ['a-v2', 7, 7] + ['b-v2', 7, 7]
                
                var index = xlabels.indexOf(d[attribute])
                console.log(index + ': ' + attribute + ' = ' + d[attribute] + ' in ' + xlabels.join(',') )
                if (index < 0) {
                  xlabels.push(d[attribute])
                  index = xlabels.length - 1
                }
                  console.log(index + ': ' + attribute + ' = ' + d[attribute] + ' in ' + xlabels.join(',') )

                var set = d[split]
                for (var j = 0; j < yAxes.length; j++) {
                  var setN = set + '-' + yAxes[j]

                  var Nindex = ylabels.indexOf(setN)
                  console.log('....' +Nindex + ': ' + setN + ' = ' + d[setN] + ' in ' + ylabels.join(',') )
                  if (Nindex < 0) {
                    ylabels.push(setN)
                    Nindex = ylabels.length - 1
                  }
                  console.log('....' +Nindex + ': ' + setN + ' = ' + d[setN] + ' in ' + ylabels.join(',') )
                  if (!newArray[Nindex]) { newArray[Nindex] = [setN] }
                  newArray[Nindex][index + 1] = d[yAxes[j]]
                    console.log(index + ',' + Nindex + '-> ' + JSON.stringify(newArray))
                }

              // } else if (group) {
              //   // combine {grp: 'A', subgrp: 'a', v1: 1}, {grp: 'A', subgrp: 'b', v1: 2}
              //   // into ['A', 'b', 1], ['A', 'b', 2] ... for later amalgamation...
              //   xAxes.map(x => {
              //     if (x !== group) {
              //       array.push(d[x])
              //     }
              //   })
              } else {
                var array = [d[attribute]]

                for (var i = 0; i < yAxes.length; i++) {
                  array.push(d[yAxes[i]])
                }
                normalized.push(array)
              }
            })
            console.log('norm: ' + JSON.stringify(normalized))
          }
          if (group && split) {
            console.log('normalized to: ' + JSON.stringify(newArray))
            console.log('new xlabels: ' + xlabels.join(', '))

            // Fix null values that will break the rendering...
            newArray.map((d, di) => {
              for (var d2i = 0; d2i < newArray[di].length; d2i++) {
                console.log(di + ',' + d2i + '=' + newArray[di][d2i])
                if (newArray[di][d2i] == null) { newArray[di][d2i] = nullValue || 0.111 }
              }
            })
            return new Promise( resolve => resolve({dataset: newArray, categories: xlabels, groups: ylabels}) )
          } else {
            console.log('normalized to: ' + JSON.stringify(normalized))
            return new Promise( resolve => resolve({dataset: normalized}) )
          }
        } else {
          const defaultData = [
            ['def1', 150, 100, 250, 150, 300, 150, 500],
            ['def2', 150, 200, 150, 50, 100, 250]
          ]
          console.log('missing x / y axes... use default data : ' + JSON.stringify(defaultData))
          return new Promise( resolve => resolve({dataset: [['example', 1, 2, 3]]}) )
          // return defaultData
        }
      } else {
        var limit = 5

        var limited = []
        for (var l = 0; l < dataset.length; l++) {
          var set = dataset[l].filter( (d,i) => { console.log(i + ': ' + d); return ( i <= limit); })
          limited.push(set)
        }
        console.log('limited to ' + limit + ' Records: ' + JSON.stringify(limited))
        return new Promise( resolve => resolve({dataset: limited}) )
      }
    },
    // c3Axis: function (dataset, config) {
    //   var axis = config.axis || {}
    //   if (!axis) {
    //     return config.axis
    //   } else {
    //     axis = {
    //       x: {
    //         label: {
    //           text: x.label,
    //           position: 'outer-middle'
    //         }
    //       },
    //       y: {
    //         label: {
    //           text: y.label,
    //           position: 'outer-middle'
    //         }
    //       }
    //     }

    //     if (y2) {
    //       axis.y2 = {
    //         show: 1 && y2.label,
    //         label: {
    //           text: y2.label,
    //           position: 'outer-middle'
    //         }
    //       }
    //     }
    //   }
    //   if (x.format) {
    //     axis.x.tick = { format: d3.format(x.format) }
    //   }
    //   if (y.format) {
    //     axis.y.tick = { format: d3.format(y.format) }
    //   }
    //   if (y2 && y2.format) {
    //     axis.y2.tick = { format: d3.format(y2.format) }
    //   }
    //   return axis
    // },
    drawC3: function (dataset, config) {
      const c3Config = this.updateC3Config(dataset, config)
      var {axis, data} = c3Config
      
      var {axes, types, type, groups} = data

      console.log('draw C3 canvas ... ' + JSON.stringify(dataset))
      console.log("config: " + JSON.stringify(config))
      console.log("config: " + JSON.stringify(c3Config))
      console.log('C3 config: ' +  JSON.stringify({axes: axes, type: type, types: types, groups: groups, axis: axis}))
      
      var genHash = {
          bindto: '#c3Canvas',
          data: {
            // dataset: dataset,
            axes: axes,
            type: type,
            types: types,
            groups: groups
          },
          axis: axis
      }

      console.log('c3.generate hash: ' + JSON.stringify(genHash))
      genHash.data.columns = dataset

      var chart = c3.generate(genHash)
      
      return chart
    },
    loadC3Data: function (chart, data) {
        // call to dynamically load data after chart is already generated
        console.log('load: ' + JSON.stringify(data))
        setTimeout(function () {
          chart.load({
              columns: data
            //   columns: [
            //       ['data3', 400, 250, 150, 200, 100, 350]
            //   ]
          });
      }, 1000);
    }
  }
}
</script>