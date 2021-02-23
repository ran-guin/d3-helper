<script>
import * as d3 from 'd3'

export default {
  data() {
      return {
        dataStatus: ''
      }
  },
  methods: {
    async loadDataSet (hashes, xAxis, yAxis, operator, group) {
        console.log('load dataset of ' + hashes.length + ' records')
        console.log('x: ' + xAxis + '; op: ' + operator + '; y: ' + yAxis + '; group: ' + group)
      
        this.dataStatus = 'Loading raw data'

        // hashes is a dataset consisting of an array of hashes (keys = column names typically; values = values)
        // operator allows options for Count, Sum, Avg, Distinct for yAxis 

        var Count = {}
        var List = {}

        // generate Count map & List of values for specified xAxis
        hashes.map( (d,i) => {
          var key = hashes[i][xAxis]
          var val = hashes[i][yAxis]
 
          if (!Count[key]) { Count[key] = 1}
          else { Count[key]++ }
          
          if (!List[key]) { List[key] = [val] }
          else { List[key].push(val) }
        })
        
        var xVals = Object.keys(List)
        var sorted
        if (xVals[0].constructor === String) {
          sorted = xVals.sort()
        } else {
          sorted = xVals.sort(function(a, b){return a-b})
        }
        console.log('sorted list of xAxis values: ' + sorted.join(','))

        var x
        var y
        if (xAxis === yAxis) {
          x = xAxis
          y = operator
        } else {
          x = xAxis
          y = operator + ' ' + yAxis
        }

        var dataset = sorted.map( (key) => {
          var obj = {}
          obj[x] = key
          if (operator === 'Count') {
            obj[y] = Count[key] 
          } else if (operator === 'Avg') {
            const sumAvg = List[key].reduce((a,b) => a + b, 0) / List[key].length
            obj[y] = sumAvg
          } else if (operator === 'Sum') {
            const arrAvg = List[key].reduce((a,b) => a + b, 0)
            obj[y] = arrAvg
          }
          return obj
        })

        this.dataStatus = 'Loading raw data'

        console.log('D3Loader generated dataset: ' + JSON.stringify(dataset))
        return new Promise(resolve => resolve(dataset))
    },

    async d3LoadFile (file, filters) {
      console.log('load file: ' + file)
      console.log('use filters: ' + JSON.stringify(filters))
      // eg filters = [ {category: true}, { country: 'Canada' }, { province: 'New', matchString: true } ]

      this.dataStatus = 'Loading file'
      var dataset = await d3.csv(file)
      
      if (filters) {
        this.dataStatus = 'Filtering'
        dataset = await this.filterData(dataset, filters)
      } else {
        console.log('loaded full dataset ' + dataset.length)
      }
      this.dataStatus = 'Loaded'

      console.log('loaded dataset: eg - ' + JSON.stringify(dataset[0], null, 2))
      return new Promise(resolve => resolve(dataset))
    },

    filterData (dataset, filters) {
      var cols = filters.map(d => Object.keys(d)[0])
      
      var d = dataset.map( d => {
        var obj = {}
        for (var c = 0; c < cols.length; c++) {
          obj[cols[c]] = d[cols[c]]
        }
        return obj
      })
      console.log('extracted ' + cols.length + ' columns')

      for (var i = 0; i < filters.length; i++) {
        var key = Object.keys(filters[i])[0]
        var val = Object.values(filters[i])[0]

        var matchString = filters[i].matchString
        var filtered
        if (val.constructor === Boolean) {
          filtered = d.filter(d => { return (d[key] && val) })
        } else if (matchString) {
          filtered = d.filter(d => { return (d[key].match(val)) })
        } else {
          filtered = d.filter(d => { return (d[key] === val) })
        }
        console.log('Filtered on ' + key + ' : ' + val + ' [' + dataset.length + ']')
      }

      return new Promise(resolve => resolve(filtered))
    },

    d3Aggregate (dataset, options) {
      var {combine, total, split, y, format} = options

      const formattingDate = (format && format.match(/%/)) ? true : false
      
      var a = {}
      var c = {}
      
      console.log('aggregate data from ' + combine + '; '
        + 'format: ' + format + '; '
        + 'sum: ' + JSON.stringify(total) + '; '
        + 'split: ' + JSON.stringify(split) + '; '
      )
      this.dataStatus = 'Aggregating'

      dataset.map( (d, index) => {
          var key = d[combine]
          var chrono
          if (formattingDate) {
              // time formatting
              var reformat = d3.timeFormat(format)              
              chrono = new Date(d[combine]).getTime() // sort by getTime ('seconds since 1970')
              key = reformat(chrono)
              c[chrono] = key
          }

          if (!a[key]) {
            a[key] = {}
          }

          if (total) {
            for (var i = 0; i < total.length; i ++) {
              var col = total[i]
              if (a[key][col]) {
                a[key][col] = +d[col] + a[key][col]
              } else {
                a[key][col] = +d[col]
              }
            }
          }

          if (split && y) {
            for (var j = 0; j < split.length;  j++) {
              var newcol = d[split[j]].toString()
              a[key][newcol] = d[y]
              if (index < 2) {
                console.log(newcol + ' = ' + d[col] + ' -> ' + JSON.stringify(a))
              }
            }
          }
      })
      var keys
      if (formattingDate) {
        keys = Object.keys(c).sort((a, b) => (a > b))
      } else {
        keys = Object.keys(a).sort((a, b) => (a > b))
      } 
      this.dataStatus = 'Loaded'

      return new Promise( resolve => {
        resolve(
          keys.map(d => {
            var att = c[d] || d
            a[att][combine] = att
            a[att].sorted = d
            return a[att]
          })
        )
      })
    }
  } 
}
</script>