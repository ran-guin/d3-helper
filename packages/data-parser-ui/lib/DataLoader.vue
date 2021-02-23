<script>
  import readXlsxFile from 'read-excel-file';

  export default {
    data () {
      return {
        localData: [],
        originalData: [],
        dataAsArrays: [],
        dataAsHashes: [],
        TableHeaders: [],
        dataHeader: [],
        localHeaders: [],
        headersIncluded: false,
        headersDefined: false,
        defaultKey: '',
        keyIndex: 0,
        dataSource: '',
        headerArray: [],
        dataAttributes: {},
        dataIgnored: [],
        uploadMessage: '',
        uploadError: ''
      }
    },
    computed: {
      dataSummary: function () {
        return {
          lines: this.dataAttributes.lines,
          headerLines: this.dataAttributes.headerLines,
          blankLines: this.dataAttributes.blankLines,
          commentLines: this.dataAttributes.commentLines,
          fullLines: this.dataAttributes.fullLines,
          partialLines: this.dataAttributes.partialLines,
          okLines: this.dataAttributes.okLines || [], // not all columns populated, but min_columns populated
          columns: this.dataAttributes.columns,
          columnTypes: this.dataAttributes.columnTypes,
          header: this.dataAttributes.header,
          labels: this.dataAttributes.labels,
          key: this.dataAttributes.key,
          source: this.dataAttributes.source
        }
      },
      TableData: function () {
        return this.dataAsHashes
      },
      hasHeaders: function () {
        return this.headersIncluded || this.headersDefined
      },
      startIndex: function () {
        if (this.headersIncluded) {
          return 1
        } else {
          return 0
        }
      },
      endIndex: function () {
        if (this.headersIncluded) {
          return this.dataAsArrays.length
        } else {
          return this.dataAsArrays.length-1
        }
      },
      recordCount: function () {
        if (this.headersIncluded) {
          return this.dataAsArrays.length-1
        } else {
          return this.dataAsArrays.length
        }
      }
    },
    methods: {
      initData (files, options) {
        if (!options) { options = {} }

        var file = files[0]
        var source = options.type
        this.dataSource = source

        this.filename = file.name
        console.log('File: ' + file.name)
        console.log('Size: ' +  file.size)

        this.uploadError = ''
        this.uploadMessage = ''

        var data = []

        if (this.testType(file, options)) {
        
          console.log('load file...')
          if (source === 'excel') {
            this.loadExcel(file, options)
            console.log('excel file loaded: ' + data)
          } else if (source === 'txt') {
            this.loadTxt(file, options)
            console.log('txt data loaded: ' + data)
          } else {
            console.log('unknown source: ' + source)
          }
        }
      },
      testType (file, options) {
        const match = {
          txt: /^([a-zA-Z0-9\s_\\.\-:])+\.(csv|tsv|txt)$/,
          excel: /^([a-zA-Z0-9\s_\\.\-:])+\.(xlsx)$/
        }

        if (options.type) {
          var confirm = match[options.type]
          var matched = file.name.match(confirm)
          if (matched) {
            this.dataSource = matched[2]
            console.log('type match passed ' + this.dataSource)
            return true
          } else {
            console.log('type match failed')
            this.uploadError = 'File type mismatch: "' + file.name + '" not expected file type'
            return false
          }
        } else {
          console.log('no type test')
          return true
        }
      },

      loadExcel (file, options) {
        if (!options) { options = {} }

        readXlsxFile(file)
          .then((filedata) => {
            console.log('load Excel Data: ' + JSON.stringify(filedata))
            
            this.loadArrays(filedata, 'excel')
            this.originalData = filedata
            // this.dataAsArrays = filedata

            console.log('Defined original data ' + filedata.length + ' records')
            console.log('Original Data: ' + JSON.stringify(this.originalData))

            this.$store.dispatch('setHash', {key: 'original', value: filedata})
            // this.$store.dispatch('setHash', {key: 'arrays', value: filedata})
          })
          .catch((err) => {
            console.log('Err: ' + err.message)
          })
      },
      async loadTxt (file, options) {
        // calls loadStrings -> loadArrays...
        if (!options) { options = {} }
        
        var embed = options.embed
        console.log('loadTxt options: ' + JSON.stringify(options))
        
        var sep = /,\s*/
        if (this.dataSource === 'tsv') {
          sep = /\t/
        }

        console.log('load file : ' + file.name)

        if (typeof (FileReader) != "undefined") {
          var reader = new FileReader();

          var _this = this;
          reader.onload = function (e) {
            const rows = e.target.result.split('\n')
            if (embed) { 
              console.log('embed dataset in element: ' + embed)
              this.embedData(rows, sep, embed)
            } else {
              console.log('dataset not embedded') 
            }
        
            _this.originalData = rows
            _this.loadStrings(rows, sep)
            console.log('loaded text data...')
            _this.$store.dispatch('setHash', {key: 'original', value: rows})
          }
          reader.readAsText(file);
        } else {
          alert("This browser does not support HTML5.");
        }
      },
      loadStrings: function (input, sep) {
        // calls loadArrays...
        // if (!options) { options = {} }

        console.log('loaded raw input as array of strings separated by: ' + sep.toString())

        var arrays = input.map( (a) => {
          input = a.replace('\r','')

          var b = []
          b = a.split(sep)
          return b
        })
        this.loadArrays(arrays)
      },
      loadArrays: function (arrays) {
        // All data loading processes should ultimately load data via this method
        // if (!options) { options = {} }
        // console.log('load Array data...' + JSON.stringify(options))
          
        var lines = 0
        var header = 0
        var headerLines = []
        var blankLines = []
        var commentLines = [] // single column populated
        var okLines = []
        var fullLines = []
        var partialLines = []
        var columns = 0
        var columnTypes = []

        var min_columns = 4

        // var Rtypes = {blank: [], custom: []}
        
        arrays.map( (record, r) => {
          var rowLength = record.length

          var rtypes = [];  // {blank: [], alpha: [], numeric: [], custom: []}
          var Ctypes = {blank: [], alpha: [], numeric: [], custom: []}

          record.map( (c,i) => {
            if (!c) {
              Ctypes.blank.push(r + ',' + i)
            } else {
              var a = c.toString()

              if (a.match(/^\s*$/)) {
                rtypes.push('blank')
                Ctypes.blank.push(r + ',' + i)
              } else if (a.match(/[a-zA-Z]/)) { 
                rtypes.push('alpha')
                Ctypes.alpha.push(r + ',' + i)
              } else if (a.match(/[0-9]/)) {
                rtypes.push('numeric')
                Ctypes.numeric.push(r + ',' + i)
              } else {
                rtypes.push('custom')
                Ctypes.custom.push(r + ',' + i) 
              }
            }

          })
          // console.log((r+1) + ' row types: ' + JSON.stringify(rtypes))
          // console.log((r+1) + ' Col types: ' + JSON.stringify(Ctypes) + ' - ' + Ctypes.alpha.length + ' + ' + Ctypes.numeric.length + ' / ' + columns)

          var include = false
          if (!header && rowLength && Ctypes.alpha.length === rowLength) {
            header = r + 1
            columns = rowLength
            headerLines.push(r+1)
          } else if (Ctypes.blank.length === rowLength) {
            blankLines.push(r+1)
          } else if (Ctypes.blank.length === rowLength - 1) {
            commentLines.push(r+1)
          } else if (columns && ((Ctypes.alpha.length + Ctypes.numeric.length) >= columns)) {
            fullLines.push(r+1)
            columnTypes = rtypes
            include = true
          } else if (columns && ((Ctypes.alpha.length + Ctypes.numeric.length) >= min_columns)) {
            okLines.push(r+1)
            include = true
          } else {
            partialLines.push(r+1)
          }

          if (include) {
            this.dataAsArrays.push(record)
          } else if (header && header === r + 1) {
            console.log("Header: " + JSON.stringify(record))
            this.dataHeader = record
          } else {
            this.dataIgnored.push(record)
          }
          lines++
        })
        
        this.dataAttributes = {
          source: this.dataSource,
          lines: lines,
          headerLines: headerLines,
          blankLines: blankLines,
          commentLines: commentLines,
          fullLines: fullLines,
          partialLines: partialLines,
          okLines: okLines, // not all columns populated, but min_columns populated
          columns: columns,
          columnTypes: columnTypes,
          header: header ? arrays[header-1] : []
        }
        
        console.log('updated Data Summary: ' + JSON.stringify(this.dataAttributes))
        
        console.log('*** Comment Lines Skipped: ')
        commentLines.map((c) => {
          console.log(JSON.stringify(arrays[c-1]))
        })

        console.log('*** Warning of partial records: ')
        partialLines.map((p,i) => {
          console.log(i + ': ' + (p-1))
          console.log(JSON.stringify(arrays[p-1]))
        })
        
        this.resetHeaders()

      },
      embedData: function (rows, sep, element) {
        var table = document.createElement("table");
        for (var i = 0; i < rows.length; i++) {
            var row = table.insertRow(-1);
            var cells = rows[i].split(sep);
            for (var j = 0; j < cells.length; j++) {
                var cell = row.insertCell(-1);
                cell.innerHTML = cells[j];
            }
        }
        var embedElement = document.getElementById(element);
        if (embedElement) {
          embedElement.innerHTML = "";
          embedElement.appendChild(table);
        }
        console.log('embed table data into element: ' + element)
      },
      toArray: function (input) {
        var headerArray = []
        if (input.constructor === String) {
          if (this.dataSource === 'csv') {
            headerArray = input.split(/,\s*/)
          } else if (this.dataSource === 'tsv') {
            headerArray = input.split(/\s*\t*\s*/)
          } else {
            console.log('unexpected source of String input: ' + this.dataSource)
          }
        } else if (input.constructor === Array) {
          headerArray = input
        } else {
          console.log('input record loaded as object ?')          
        }

        return headerArray
      },
      resetHeaders: function () {
        console.log("Summary: " + JSON.stringify(this.dataAttributes))
        var headerRow = this.dataAttributes.headerLines[0]

        console.log('check first line for headers: ' + JSON.stringify(this.dataHeader))

        this.TableHeaders = this.dataAttributes.header.map( (a,i) => {
          var h = a || 'col' + (i + 1)
          var label = this.format[h] || h
          var type; 
          if (label === 'price') { type = 'decimal(4,2)' } // custom (temporary)
          return {text: label.toString(), value: label.toString(), type: type}
        })
        
        this.defaultKey = this.useKey || this.TableHeaders[this.keyIndex].text
        console.log('use ' + this.defaultKey + ' as key column')
        if (headerRow) { 
          this.headersIncluded = true
          this.headersDefined = true
          console.log('headers included on row ' + headerRow)
        }
        this.dataAttributes.labels = this.TableHeaders
        this.dataAttributes.key = this.defaultKey


        if (headerRow) {
          this.headersDefined = true
          this.headersIncluded = true
          this.TableHeaders = this.dataAttributes.header.map( (a,i) => {
            var h = a || 'col' + (i + 1)
            var label = this.format[h] || h
            var type; 
            if (label === 'price') { type = 'decimal(4,2)' } // custom (temporary)
            return {text: label.toString(), value: label.toString(), type: type}
          })
        } else {
          this.TableHeaders = this.dataHeader.map( (a,i) => {
            return {text: 'Col' + (i+1), value: 'col' + (i+1)}
          })
        }
        this.dataAttributes.labels = this.TableHeaders

        this.resetHashes()

        console.log('reset stored hash summary/hashes/arrays')
        this.$store.dispatch('setHash', {value: this.dataSummary, key: 'summary'})
        this.$store.dispatch('setHash', {value: this.dataAsHashes, key: 'hashes'})
        this.$store.dispatch('setHash', {value: this.dataAsArrays, key: 'arrays'})
      },
      clearRecord: function (i) {
        // var reset = true
        console.log('remove record ' + i + this.headersIncluded) 
        if (i && this.dataAsArrays.length) {
          if (this.headersIncluded) { i++ }

          this.dataAsArrays.splice(i-1, 1)
          // if (i === 1) { reset = true }

          this.resetHashes()
        } else {
          this.dataAsArrays = []

          this.dataAsHashes = []
          this.TableHeaders = []

          this.headersIncluded = false
          this.headersDefined = false

          this.originalData = []
          this.dataAttributes = {}
  
          this.$store.dispatch('clearHash')
        }

      },
      deleteRecords: function (selected) {
        var key = this.TableHeaders[this.keyIndex].value
        
        for (var i = 0; i < selected.length; i++) {
          var item = selected[i][key]
          var remove = this.dataAsArrays.filter( (a,index) => {
            if (a[this.keyIndex] == item || (!a[this.keyIndex])) {
              console.log('cleared record ' + (index+1) + ': ' + a[this.keyIndex])
              this.clearRecord(index+1)
              return true
            } else {
              if (!a[this.keyIndex]) {
                console.debug(this.keyIndex + ' : ' + a[this.keyIndex] + ' != ' + item)
                console.debug(JSON.stringify(a))
              }
              return false
            }
          })
          if (remove) { console.log('removed: ' + JSON.stringify(remove))}
        }
        this.selected = []
      },
      // resetHeaders: function (included) {
      //   this.TableHeaders = []
      //   // console.log('reset first line for headers: ' + JSON.stringify(this.dataAsArrays[0]) + ' = ' + this.dataAsArrays[0].constructor)
      //   // this.headerArray = this.toArray(this.dataAsArrays[0]) || []
      //   // console.log('headerArray set to ' + this.headerArray.constructor)
      //   // console.log(JSON.stringify(this.headerArray))

      //   this.TableHeaders = this.dataAttributes.header.map( (a,i) => {
      //     var h = a || 'col' + (i + 1)
      //     var label = this.format[h] || h
      //     var type; 
      //     if (label === 'price') { type = 'decimal(4,2)' } // custom (temporary)
      //     return {text: label.toString(), value: label.toString(), type: type}
      //   })
        
      //   this.defaultKey = this.useKey || this.TableHeaders[this.keyIndex].text
      //   console.log('use ' + this.defaultKey + ' as key column')
      //   if (included) { 
      //     this.headersIncluded = true
      //     this.headersDefined = true
      //     console.log('headers included')
      //   }
      //   this.dataAttributes.labels = this.TableHeaders
      //   this.$store.dispatch('setHash', {key: 'summary', value: this.dataSummary})
      // },      
      resetHashes: function () {
        this.dataAsHashes = []
      //   var skip = []
        console.log('original input length: ' + this.dataAsArrays.length)
        for (var i = 0; i < this.dataAsArrays.length; i++) {
          var record = {}
          this.dataSummary.labels.map( (a,j) => {
            var recordArray = this.toArray(this.dataAsArrays[i])
            record[a.text] = recordArray[j] || ''
          })

          // console.log('add hash record: ' + JSON.stringify(record))
          this.dataAsHashes.push(record)
        }
      },

        // if (i || !this.headersIncluded ) {
        // this.TableHeaders.map( (a,j) => {
        //   var recordArray = this.toArray(this.dataAsArrays[i])
        //   record[a.text] = recordArray[j] || ''
        // })
        // console.log('add record: ' + JSON.stringify(record))
        //       if (!this.hasHeaders || record[this.defaultKey]) {
        // this.dataAsHashes.push(record)
        //         console.log('add hash record: ' + JSON.stringify(record))
        //       } else {
        //         console.log('skip ' + i)
        //         skip.push(i)
        //       } 
        //     } else {
        //       console.log('skip header line: ' + JSON.stringify(this.dataAsArrays[i]))
        //     }
        //   }

        //   if (skip.length) {
        //     for (var j = 0; j < skip.length; j++) {
        //       var clear = skip[j] - j // account for already spliced record(s) 
        //       if (this.headerIncluded) { clear-- }
        //       console.log('clear empty datapoint: ' + this.dataAsArrays[clear])
        //       this.dataAsArrays.splice(clear, 1)
        //     }
        //     this.note = 'Skipped ' + skip.length + ' Records with empty primary column: ' + skip.join(', ')
        //     console.log(this.dataAsHashes.length + ' vs ' + this.dataAsArrays.length + ' or ' + this.endIndex)
        //   }
        //   console.log('(re)loaded Data: ' + this.dataAsArrays.length)
        //   console.log(this.dataAsHashes.length + 'Table records: ')
        //   console.log(JSON.stringify(this.dataAsHashes))
        
      //   this.presetHeaders()
      // },
      // resetTable: function (options) {
      //   if (!options) { options = {} }
      //   console.log('reset table: ' + JSON.stringify(options))

      //   if (this.dataAsArrays.length) {
      //     if (options.reset || ! this.TableHeaders.length) {
      //       this.resetHeaders(options.headersIncluded)
      //     }
      //     this.resetData()
      //   } else {
      //     console.log('no input...')
      //   }
      // },
      changeHeader: function (index) {
        console.log(JSON.stringify(this.format))

        // Fix Summary Labels
        var Summary = this.$store.state.hash.summary
        console.log(JSON.stringify(Summary.labels))
        var oldKey = Summary.labels[index].text
        var newKey = this.format[Summary.labels[index].value]
        console.log(index + ' reset ' + oldKey + ' text to ' + newKey)
      
        Summary.labels[index].text = this.format[Summary.labels[index].value]
        Summary.labels[index].value = this.format[Summary.labels[index].value]
        Summary.header[index] = newKey

        if (this.defaultKey === oldKey) {
          this.defaultKey = newKey
          console.log('changed default Key to ' + newKey)
        }
        Summary.key = this.defaultKey
        this.$store.dispatch('setHash', {key: 'summary', value: Summary})
        
        // Fix Hashes
        var Hashes = this.$store.state.hash.hashes
        Hashes = Hashes.map( a => {
          if (a[oldKey]) {
            a[newKey] = a[oldKey]
            delete a[oldKey]
            console.log('changed ' + oldKey + ' to ' + newKey)
            console.log(JSON.stringify(a))
          } else {
            console.log('unchanged: ' + JSON.stringify(a))
          }
          return a
        })
        this.$store.dispatch('setHash', {key: 'hashes', value: Hashes})
      }, 
      ignoreTop: function () {
        for (var i = 0; i < this.skipTop; i++) {
          this.clearRecord(1)
        }
        console.log('skipped ' + this.skipTop + 'lines at top')
      },
      ignoreBottom: function () {
        for (var j = 0; j < this.skipBottom; j++) {
          this.clearRecord(this.dataAsArrays.length)
        }
        console.log('skipped ' + this.skipBottom + 'lines at bottom')
      }
    },
    watch: {
    }
  }
</script>
