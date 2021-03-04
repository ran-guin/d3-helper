<template lang='pug'>
  div
    v-container
      h2 Column Details
      hr
      v-container(style='border: 1px solid black')
        v-row
          v-col
            h3.coloured {{index}} / {{Summary.labels.length}}
            table(v-if='Column')
              tr
                td 
                  h3.message Name: 
                td
                  b.coloured {{Column.name}}
              tr
                td 
                  h3.message Records: 
                td
                  b.coloured {{Column.count}}
              tr
                td 
                  h3.message Unique: 
                td
                  b.coloured {{Column.unique_count}}
              tr
                td 
                  h3.message Raw Type: 
                td
                  b.coloured {{Column.type}} &nbsp;
              tr
                td
                  h3.message DB Type:
                  span(v-if='Column.numeric')
                    b.coloured Int &nbsp;
                  span(v-else-if='Column.decimal')
                    b.coloured Decimal &nbsp;
                  span(v-else-if='Column.date')
                    b.coloured Date &nbsp;
                  span(v-else-if='Column.time')
                    b.coloured DateTime &nbsp;
                  span(v-else)
                    b.coloured VARCHAR &nbsp;

                  span(v-if='Column.min_length === Column.max_length') 
                    b.message [Length = {{Column.min_length}}] &nbsp;                  
              tr(v-if='Column.unique_options && (Column.non_zero_unique_count <= maxEnum)')
                td
                  b.coloured Unique Options
                td
                  span(v-if='Column.numeric')
                    b.highlight (FK ?)
                  span(v-else-if='Column.non_zero_unique_count <= maxEnum')
                    b.highlight (FK or ENUM)
                  span(v-else-if='(Column.non_zero_count > Column.non_zero_unique_count) && (Column.non_zero_unique_count < maxEnum)')
                    b.highlight (FK or Enum)

                  ul(style='border: 1px solid black; background-color: lightgrey')
                    li(v-for='opt in Column.unique_options') {{opt}}
              tr
                td 
                  h3.message Max Length: 
                td
                  b.coloured {{Column.max_length}}
              tr
                td 
                  h3.message Min Length: 
                td
                  b.coloured {{Column.min_length}}
              tr
                td 
                  h3.message NULL values found ?:
                td
                  b(v-bind:class='[{message : Column.nullOk}, {highlight : !Column.nullOk}]') {{Column.nullOk}}
              tr
                td 
                  h3.message Non-zero values:
                td
                  b {{Column.non_zero_count}}
              tr
                td(style='padding-right: 2rem') 
                  h3.message Unique Non-zero values:
                td
                  b {{Column.non_zero_unique_count}}
              //- tr  
              //-   td 
              //-     h3.message String ?:
              //-   td
              //-     b(v-bind:class='[{message : Column.string}, {highlight : !Column.string}]') {{Column.string}}
              //- tr
              //-   td 
              //-     h3.message Int ?:
              //-   td
              //-     b(v-bind:class='[{message : Column.numeric}, {highlight : !Column.numeric}]') {{Column.numeric}}
              //- tr
              //-   td 
              //-     h3.message Decimal ?:
              //-   td
              //-     b(v-bind:class='[{message : Column.numeric}, {highlight : !Column.numeric}]') {{Column.decimal}}
              //- tr
              //-   td 
              //-     h3.message Date ?:
              //-   td
              //-     b.coloured {{Column.date}}
              //- tr
              //-   td
              //-   td
              //-     pre {{JSON.stringify(Column, null, 2)}}

</template>

<script>

  export default {
    name: 'DataPlot',
    data () {
      return {
        headers: [],
        selected: [],
        Column: {},
        maxEnum: 10,
      }
    },
    props: {
      index: {
        type: Number,
        default: 1
      }
    },
    created () {
      this.loadData()
    },
    methods: {
      loadData: function () {

        var col = this.Summary.labels[this.index-1].value
        console.log('load Column ' + this.index + ' = ' + JSON.stringify(col))
        this.$set(this, 'Column', this.ColumnData[col])

        // var Unique = {}
        // var minLength = 500
        // var maxLength = 0
        // var numeric = true
        // var decimal = true
        // var date = true
        // var nullOk = false
        // var string = true

        // var values = this.Arrays.map( (a) => {
        //   if (a[this.index-1]) {
        //     var val = a[this.index-1] || ''
          
        //     Unique[val] = (true && val)

        //     var l = val.length
        //     if (l < minLength) { minLength = l }
        //     if (l > maxLength) { maxLength = l }
            
        //     if (val.constructor === Number) {
        //       // nullOk = false
        //       date = false
        //     } else if (val.constructor === String && !val.match(/\d+/) ) {
        //       numeric = false
        //     } else if (val.constructor === String && ! val.match(/^\d+\.\d+$/) ) {
        //       decimal = false
        //     } 
            
        //     if (val.constructor === String && ! val.match(/^\w$/) ) {
        //       nullOk = true
        //     } else if (val.constructor === String && !val.match(/[a-zA-Z]/)) {
        //       string = false
        //     }

        //     if (date && val.constructor === String && ! val.match(/^\d\d\d\d-\d\d-\d\d/) ) {
        //       date = false
        //     }
        //   }
        //   return val
        // })

        // var unique_options = Object.keys(Unique)
        // var non_zero_options = values.filter( a => { if (a) { return true } })
        // var non_zero_unique_options = unique_options.filter( a => { if (a) { return true } })

        // console.log('set column..' + this.index + ' from ' + JSON.stringify(this.Summary.labels))
        // var Column = {
        //   name: this.Summary.labels && this.Summary.labels[this.index-1] ? this.Summary.labels[this.index-1].text : null,
        //   count: values.length,
        //   // values: values,

        //   min_length: minLength,
        //   max_length: maxLength,

        //   numeric: numeric,
        //   decimal: decimal,
        //   date: date,
        //   nullOk: nullOk,
        //   string: string,

        //   unique_options: unique_options,
        //   non_zero_options: non_zero_options,
        //   non_zero_unique_options: non_zero_unique_options,

        //   unique_count: unique_options.length,
        //   non_zero_count: non_zero_options.length,
        //   non_zero_unique_count: non_zero_unique_options.length,
        // }
        // this.Column = Column
        // console.log('Column: ' + JSON.stringify(Column))
      },
      plotRecords: function () {
        console.log('Plot ' + this.selected.join(', '))
      }
    },
    computed: {
      Arrays: function () {
        return this.$store.state.hash.arrays || []
      },
      Summary: function () {
        return this.$store.state.hash.summary  || {}
      },
      ColumnData: function () {
        return this.$store.state.hash.columnData || {}
      }
    },
    watch: {
      index: function () {
        console.log('reload data on index change to ' + this.index)
        this.loadData()
      }
    }
  }
</script>
