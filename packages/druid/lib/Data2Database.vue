<template lang='pug'>
  div
    v-container
      h2 Parsed Data
      hr
            
      v-container
        p &nbsp;
        v-row.justify-space-around
          div(v-for='h, i in Summary.labels')
            v-btn.btn-primary(@click='loadColumn(i)') {{h.text}}
        p &nbsp;
      
      v-container(style='border: 1px solid black')
        div(v-if='Summary.fullLines || Summary.okLines')
          h5(v-if='selected.length') Selected: 
            span(v-for='s in selected') {{s}}; &nbsp;
          v-btn.btn-primary(v-if='selected.length' @click='plotRecords()') Only use these Records
          b Current Dataset: {{Summary.fullLines + Summary.okLines}} Records / {{Summary.labels.length}} Columns
          v-data-table(v-model='selected' :items='Hashes' :headers='Summary.labels' :item-key='Summary.key' show-select)

      v-container
        v-row
          v-radio-group(v-model='target')
            v-radio(label='New Database' value='new')
            v-radio(label='Existing Database' value='existing')
        v-row
          v-btn.btn-primary(@click='databaseDump') Generate Full SQL Dump
          v-card(v-if='sqlCommand')
            v-card-title
              h3.heading mySQL Command
            v-card-text
              h4.message
                pre {{sqlCommand}}
    v-dialog(v-model='columnData' max-width='500')
      v-card
        v-card-title Column Data
        v-card-text
          DataColumn(:index='loadIndex')
</template>

<script>

  const DataColumn = () => import('./DataColumn')

  export default {
    name: 'Data2Database',
    components: {
      DataColumn
    },
    data () {
      return {
        data: [],
        selected: [],
        createDB: false,
        target: 'existing',
        sqlCommand: '',
        loadIndex: 1,
        columnData: false
      }
    },
    props: {
    },
    created () {
      console.log('load Data2Database Page')
    },
    computed: {
      Summary: function () {
        return this.$store.state.hash.summary
      },
      Hashes: function () {
        return this.$store.state.hash.hashes
      }
    },
    methods: {
      loadColumn: function (i) {
        this.loadIndex = i + 1
        this.columnData = true
      },
      databaseDump: function () {
        var sql = ''
        var dbName = 'testDB'
        var table = 'test'

        if (this.Summary.labels && this.Hashes && this.Summary.labels.length && this.Hashes.length) {
          var createSQL = sql + "CREATE TABLE " + table
            + '(id INT NOT NULL Auto_Increment Primary Key, '
          var insertSQL = "INSERT INTO " + table

          if (this.target === 'new') {
            sql = 'CREATE DATABASE ' + dbName + ';'
          }
          
          var fields = []
          var creates = []
          console.log('access Headers: ' + JSON.stringify(this.Summary.labels))
          for (var i = 0; i < this.Summary.labels.length; i++) {
            var h = this.Summary.labels[i]
            const space = /\s+/g
            var field = h.text.replace(space, '_')
            fields.push(field)
            if (h.type) {
              creates.push(field + ' ' + h.type)
            } else {
              creates.push(field + ' VARCHAR(255)')
            }
          }
          createSQL = createSQL + creates.join(', ')
          createSQL = createSQL + "); \n"

          var records = []
          console.log('access Hashes eg: ' + JSON.stringify(this.Hashes[0]))
          console.log('... loop through field: ' + fields.join(', '))
          for (var j = 0; j < this.Hashes.length; j++) {
            var inserts = []
            for (var k = 0; k < fields.length; k++) {
              var insert = '"' + (this.Hashes[j][fields[k]] || '') + '"'
              inserts.push(insert)
            }
            var include = inserts.join(',\n\t')
            records.push('(\n\t' + include + '\n)')
          }
          
          if (records.length) {
            insertSQL = insertSQL + '(`' + fields.join('`, `') + '`) VALUES \n'
            insertSQL = insertSQL + records.join(',\n\n')
          }

          sql = sql + createSQL + insertSQL

          console.log('create: ' + createSQL)
          console.log('insert: ' + insertSQL)
          console.log('fields: ' + fields)
          console.log('records: ' + records)

          console.log('SQL: ' + sql)
        } else {
          console.log('missing headers or hashes ?')
          console.log(JSON.stringify(this.Summary.labels))
          console.log(JSON.stringify(this.Hashes))
        }
        this.sqlCommand = sql
      }
    },
    watch: {

    }
  }
</script>
