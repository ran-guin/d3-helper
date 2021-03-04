import readXlsxFile from 'read-excel-file';

function loadRaw (data, format) {
  this.uploadError = ''
  this.uploadMessage = ''

  var parsed
  if (data.constructor === String) {
    if (format === 'JSON') {
      parsed = JSON.parse(data)
      console.log("parse json (?): " + JSON.stringify(parsed))
    } else if (format === 'YAML') {
      console.log("YAML converter not yet installed...")
    }    
  }

  if (parsed.constructor === Array) {
    var arrayFormat = parsed[0].constructor

    if (arrayFormat === Array) {
      // Load array of hashes
      console.log('load array of arrays')
      return this.loadAofA({arrays: parsed, original: data})
    } else if (arrayFormat === Object) {
      console.log('load array of hashes')
      return this.loadAofH(parsed)
    } else {
      console.log('load array of values')
      var AofA = parsed.map(a => {return [a]})
      return this.loadAofA({arrays: AofA, original: data})
    }
  } else {
    console.log("Data not in applicable format (?)" + JSON.stringify(data))
    return Promise.reject('improper format')
  }
}

function loadAofH (data) {
  var keys = Object.keys(data[0])

  var AofA = [keys]
  console.log("keys: " + keys.join(', '))
  for (var i = 0; i < data.length; i++) {
    var record = []
    for (var k = 0; k < keys.length; k++) {
      record.push(data[i][keys[k]] || '')
    }
    AofA.push(record)
    console.log('Add ' + JSON.stringify(record))
  }
  console.log('reverse generate array of arrays: ' + JSON.stringify(AofA))
  return this.loadAofA({arrays: AofA, original: data})
}

function loadAofA (data) {
  console.log('call parse Arrays for ' + data.arrays.length + ' records...')

  return this.parseArrays(data)
    .then( data1 => {
      console.log('** loaded arrays: ' + JSON.stringify(Object.keys(data1)))
      console.log(JSON.stringify(data1.summary))
      return this.resetHeaders(data1)
    })
    .then( data2 => {
      console.log('** reset Headers: ' + JSON.stringify(Object.keys(data2)))
      return this.resetHashes(data2)
    })
    .then( data3 => {
      console.log("** reset hashes: " + JSON.stringify(Object.keys(data3)))
      return this.parseColumnData(data3)    
    })
    .then( data5 => {
      console.log("** parsed column data: " + JSON.stringify(Object.keys(data5)))
      return Promise.resolve(data5)    
    })
    .catch( err => {
      console.log('Error loading Array of Arrays: ' + err.message)
      console.log(err.stack)
      console.trace()
      return Promise.resolve({})    
    })
}

function test (data) {
  console.log('testing...' + JSON.stringify(data))
  return 'ok'
}

async function loadFile (files) {
  var file = files[0]

  this.filename = file.name
  console.log('File: ' + file.name)
  console.log('Size: ' +  file.size)

  this.uploadError = ''
  this.uploadMessage = ''

  var filetype = this.testType(file)

  if (filetype.ext === 'xlsx') {
    console.log('excel file loaded: ' + file.name)
    return this.loadExcel(file)
      .then( filedata  => {
        return this.cacheOriginal(filedata, 'arrays')
      })
      .then( data => {
        console.log('** cached: ' + Object.keys(data).join(', '))
        console.log('file data: ' + JSON.stringify(data.original.length + ' records'))
        return this.parseArrays(data, filetype.ext)
      })
      .then( data1 => {
        console.log('** loaded arrays: ' + JSON.stringify(Object.keys(data1)))
        console.log(JSON.stringify(data1.summary))
        return this.resetHeaders(data1)
      })
      .then( data2 => {
        console.log('** reset Headers: ' + JSON.stringify(Object.keys(data2)))
        return this.resetHashes(data2)
      })
      .then( data3 => {
        console.log("** reset hashes: " + JSON.stringify(Object.keys(data3)))
        return this.parseColumnData(data3)    
      })
      .then( data5 => {
        console.log("** parsed column data: " + JSON.stringify(Object.keys(data5)))
        return Promise.resolve(data5)    
      })
      .catch( err => {
        console.log('Error reading excel file: ' + err.message)
        console.log(err.stack)
        console.trace()
        return Promise.resolve({})    
      })
  } else if (filetype.ext) {
    console.log('csv/tsv file loaded: ' + file.name)
    return this.loadTxt(file, filetype.ext)
      .then( filedata  => {
        return this.cacheOriginal(filedata)
      })
      .then( data => {
        console.log('** cached: ' + Object.keys(data).join(', '))
        console.log('file data: ' + JSON.stringify(data.original.length + ' records'))
        var sep = /,\s*/
        if (filetype.ext === 'tsv') { sep = /\t/ }

        return this.parseStrings(data, sep)
      })
      .then( data1 => {
        console.log('** loaded strings: ' + JSON.stringify(Object.keys(data1)))
        return this.parseArrays(data1)
      })
      .then( data2 => {
        console.log('** loaded strings: ' + JSON.stringify(Object.keys(data2)))
        return this.resetHeaders(data2)
      })
      .then( data3 => {
        console.log('** reset Headers: ' + JSON.stringify(Object.keys(data3)))
        return this.resetHashes(data3)
      })
      .then( data4 => {
        console.log("** reset hashes: " + JSON.stringify(Object.keys(data4)))
        return this.parseColumnData(data4)   
      })
      .then( data5 => {
        console.log("** parsed column data: " + JSON.stringify(Object.keys(data5)))
        return Promise.resolve(data5)    
      })
      .catch( err => {
        console.log('Error reading csv/tsv file: ' + err.message)
        console.log(err.stack)
        console.trace()
        return Promise.resolve({})    
      })


      .then( data => {
        console.log('** After csv/tsv upload: ' + JSON.stringify(Object.keys(data)))
        return Promise.resolve(data)  
      })
      .catch( err => {
        console.log('error loading excel file ' + err.message)
        return Promise.resolve({})
      })
  } else {
    console.log(filetype.message)
    return Promise.resolve({})
  }
}

  function testType (file) {
    // internal only

    const test = /^([a-zA-Z0-9\s_\\.\-:])+\.(csv|tsv|xlsx)$/

    var msg
    var ext
    var matched = file.name.match(test)
    if (matched) {
      ext = matched[2]
      msg = 'Found ' + ext + ' file'
    } else {
      msg = 'Unrecognized file type (should be .csv, .tsv or .xlsx)'
    }
    return {ext: ext, message: msg}
  }

  function loadExcel (file) {
    // internal only

    return readXlsxFile(file)
      .then((filedata) => {
        console.log('load Excel Data: ' + JSON.stringify(filedata.length) + ' records')
        return Promise.resolve(filedata)
      })
      .catch((err) => {
        console.log('Err: ' + err.message)
        return Promise.reject(err.message)
      })
  }

  function loadTxt (file) {
    console.log('load file : ' + file.name)

    if (typeof (FileReader) != "undefined") {
      var reader = new FileReader();

      return new Promise( resolve => {
        reader.onload = function (e) {
          const rows = e.target.result.split('\n')    
          resolve(rows)
        }
        reader.readAsText(file);
      })
    } else {
      alert("This browser does not support HTML5.");
      return Promise.resolve({})
    }
  }

  function cacheOriginal (data, key) {
    var cache = { original: data }
    if (key) {
      cache[key] = data
    }
    console.log("cached: " + JSON.stringify(cache))
    return Promise.resolve(cache)
  }

  async function parseStrings (data, sep) {
    // internal only - calls parseArrays...

    var input = data.original
    console.log('loaded raw input as array of strings separated by: ' + sep.toString())

    var arrays = input.map( (a) => {
      input = a.replace('\r','')

      var b = []
      b = a.split(sep)
      return b
    })

    data.arrays = arrays
    return Promise.resolve(data)
  }

  async function parseArrays (data) {
    // internal only - All data loading processes should ultimately load data via this method
    console.log('parse arrays...')
    var arrays = data.arrays

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

    var min_columns = 2

    // var Rtypes = {blank: [], custom: []}
    var myArrays = []
    var myHeader = []
    var myAttributes = {}
    var myIgnored = []

    var included = 0

    arrays.map( (record, r) => {
      var rowLength = record.length
      console.log('Row: ' + JSON.stringify(record))
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
        console.log('Row: incomplete ... set columns to ' + columns)
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
        console.log('incomplete line: ' + JSON.stringify(Ctypes) + ' of ' + columns)
      }

      if (include) {
        myArrays.push(record)
        included++
      } else if (header && header === r + 1) {
        console.log("Header: " + JSON.stringify(record))
        myHeader = record
      } else {
        myIgnored.push(record)
      }
      lines++
    })
    
    myAttributes = {
      source: this.dataSource,
      lines: lines,
      headerLines: headerLines,
      blankLines: blankLines,
      commentLines: commentLines,
      fullLines: fullLines,
      partialLines: partialLines,
      okLines: okLines, // not all columns populated, but min_columns populated
      ignored: myIgnored,
      columnTypes: columnTypes,
    }
    
    console.log('Data Summary: ' + JSON.stringify(myAttributes))
    
    console.log('*** Comment Lines Skipped: ')
    commentLines.map((c) => {
      console.log(JSON.stringify(arrays[c-1]))
    })

    console.log('*** Warning of partial records: ')
    partialLines.map((p,i) => {
      console.log(i + ': ' + (p-1))
      console.log(JSON.stringify(arrays[p-1]))
    })
    
    const summary = {
      details: myAttributes,
      header: myHeader,
      headers: header ? arrays[header-1] : [],
      columns: columns,
      key: 0 // default key is first element...
    }

    console.log(included + ' records : ' + myArrays.length + ' of ' + data.arrays.length + ' records')
    data.arrays = myArrays
    data.summary = summary
    // console.log('loadString return atts: ' + JSON.stringify(data.summary.details.)
    // var updated = await this.resetHeaders(data)
    // console.log('** after parseArrays + resetting headers: ' + JSON.stringify(Object.keys(updated)))
    return Promise.resolve(data)
  }
      
  function toArray (input, type) {
    // internal only
    var headerArray = []
    if (input.constructor === String) {
      if (type === 'csv') {
        headerArray = input.split(/,\s*/)
      } else if (type === 'tsv') {
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
  }
      
  async function resetHeaders (data) {
    // internal only (requires details, summary, key)
    console.log('headers ?' + JSON.stringify(data.summary.details.headerLines))
    console.log("arrays length: " + data.arrays.length)
    var headerRow = data.summary.details.headerLines[0]

    var defaultKey = data.key || data.summary.labels && data.summary.labels[data.key] ? data.summary.labels[data.key].text : 0
    console.log('use ' + defaultKey + ' as key column')
    if (headerRow) { 
      data.summary.details.headersIncluded = true
      data.summary.details.headersDefined = true
      console.log('headers included on row ' + headerRow)
    }
    // data.summary.labels = labels
    data.key = defaultKey

    var format = {} // not sure where this should be defined (?)
    var labels
    if (headerRow) {
      data.summary.details.headersDefined = true
      data.summary.details.headersIncluded = true

      labels = data.summary.headers.map( (a,i) => {
        var h = a || 'col' + (i + 1)
        var label = format[h] || h
        var type; 
        if (label === 'price') { type = 'decimal(4,2)' } // custom (temporary)
        return {text: label.toString(), value: label.toString(), type: type}
      })
    } else {
      labels = data.summary.headers.map( (a,i) => {
        return {text: 'Col' + (i+1), value: 'col' + (i+1)}
      })
    }
    console.log("set labels in resetHeaders..." + JSON.stringify(labels))
    console.log(headerRow + " header..." + JSON.stringify(data.summary.header))
    console.log("att.headers  header..." + JSON.stringify(data.summary.headers))
    
    data.summary.labels = labels
    // var updated = await this.resetHashes(data)
    // console.log('*** after reset Headers & Hashes: ' + JSON.stringify(Object.keys(updated)))
    return Promise.resolve(data)
  }

  function deleteRecords (data, selected) {
    var key = data.summary.labels[data.key].value
    
    var arrays = data.arrays
    var removed = 0
    for (var i = 0; i < selected.length; i++) {
      var item = selected[i][key]
      arrays = arrays.filter( (a,index) => {
        if (a[data.key] === item || (!a[data.key])) {
          console.log('cleared record ' + (index+1) + ': ' + a[data.key])
          removed++
          return false
        } else {
          if (!a[data.key]) {
            console.debug(data.key + ' : ' + a[data] + ' != ' + item)
            console.debug(JSON.stringify(a))
          }
          return true
        }
      })
      if (removed) { console.log('removed ' + removed + ': ' + JSON.stringify(arrays))}
    }
    this.selected = []
    data.arrays = arrays
    console.log('updated data arrays after deleting records ' + JSON.stringify(data))
    return data
  }
     
  async function resetHashes (data) {
    // internal only (requires arrays, labels -> updates hashes)
    var keys = Object.keys(data)
    console.log("reset Hashes input: " + keys.join(', '))
    var dataAsHashes = []

    var type = data.type
    console.log('original input length: ' + data.arrays.length)
    for (var i = 0; i < data.arrays.length; i++) {
      var record = {}

      data.summary.labels.map( (a,j) => {
        var recordArray = this.toArray(data.arrays[i], type)
        record[a.text] = recordArray[j] || ''
      })

      // console.log('add hash record: ' + JSON.stringify(record))
      dataAsHashes.push(record)
    }

    data.hashes = dataAsHashes
    console.log('** resetHashes ** updated data in resetHashes: ' + JSON.stringify(Object.keys(data)))
    return Promise.resolve(data)
  }

function changeHeader (data, index) {
  // Fix Summary Labels
  var oldKey = data.summary.labels[index].text
  var newKey = data.format[data.summary.labels[index].value]
  console.log(index + ' reset ' + oldKey + ' text to ' + newKey)

  data.summary.labels[index].text = data.format[data.summary.labels[index].value]
  data.summary.labels[index].value = data.format[data.summary.labels[index].value]
  data.summary.headers[index] = newKey

  if (data.key === oldKey) {
    data.key = newKey
    console.log('changed default Key to ' + newKey)
  }
  
  // Fix Hashes
  var updatedHashes = data.hashes.map( a => {
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
  data.hashes = updatedHashes
  console.log('** after changeHeader ** updated after header change: ' + JSON.stringify(Object.keys(data)))
}

  // ignoreTop: function () {
  //   for (var i = 0; i < this.skipTop; i++) {
  //     this.clearRecord(1)
  //   }
  //   console.log('skipped ' + this.skipTop + 'lines at top')
  // },
  // ignoreBottom: function () {
  //   for (var j = 0; j < this.skipBottom; j++) {
  //     this.clearRecord(this.dataAsArrays.length)
  //   }
  //   console.log('skipped ' + this.skipBottom + 'lines at bottom')
  // }

function parseColumnData (data) {
  var columns = data.summary.headers
  var enumLimit = 20 // upper limit on likely enum values

  var ColumnData = {}
  columns.map((c,index) => {

    var Unique = {}
    var minLength = 500 // data.arrays[0][index].length
    var maxLength = 0
    var numeric = true
    var decimal = true
    var date = true
    var time = true
    var nullOk = true
    var string = true
    
    var type

    var values = data.arrays.map( a => {
      if (a[index]) {
        type = typeof a[index]
        var val = a[index] || ''
        
        Unique[val] = (true && val)

        var l = val.length
        if (l < minLength) { minLength = l }
        if (l > maxLength) { maxLength = l }
        
        if (val.constructor === Number) {
          nullOk = false
          date = false
          string = false
        } else if (val.constructor === String && val && ! val.match(/^\d+$/) ) {
          numeric = false
          decimal = false
        } else if (val.constructor === String && val && ! val.match(/^\d+\.\d+$/) ) {
          decimal = false
        } 
        
        if (val.constructor === String && ! val.match(/^\w$/) ) {
          nullOk = false
        } else if (val.constructor === String && val && ! val.match(/[a-zA-Z]/)) {
          string = false
        }

        if (date && val.constructor === String && val && !val.match(/^\d\d\d\d-\d\d-\d\d/) ) {
          date = false
          time = false
        } else if (date && val.constructor === String && val && !val.match(/^\d\d\d\d-\d\d-\d\d \d\d:\d\d/) ) {
          time = false
        }
      }
      return val
    })

    var unique_options = Object.keys(Unique)
    var non_zero_options = values.filter( a => { if (a) { return true } })
    var non_zero_unique_options = unique_options.filter( a => { if (a) { return true } })

    console.log(type + ' Column identified' + (index + 1) + ' from ' + JSON.stringify(data.summary.labels))

    var enums = ((unique_options.length < values.length) && (unique_options.length < enumLimit)) ? unique_options.join(', ') : false

    var Column = {
      name: data.summary.labels && data.summary.labels[index] ? data.summary.labels[index].text : null,
      type: type,
      enum: enums,
      count: values.length,
      // values: values,

      min_length: minLength,
      max_length: maxLength,

      numeric: numeric,
      decimal: decimal,
      date: date,
      time: time,
      nullOk: nullOk,
      string: string,

      // unique_options: unique_options,
      // non_zero_options: non_zero_options,
      // non_zero_unique_options: non_zero_unique_options,

      unique_count: unique_options.length,
      non_zero_count: non_zero_options.length,
      non_zero_unique_count: non_zero_unique_options.length,
    }

    if ( (non_zero_unique_options.length <= enumLimit) && (non_zero_unique_options.length < values.length)) {
      Column.unique_options = unique_options
    }

    ColumnData[c] = Column
    console.log(c + ' Column Data generated: ' + JSON.stringify(Column))
  })
  data.columnData = ColumnData
  return Promise.resolve(data)
}

function embedData (rows, sep, element) {
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
}

export default {test, loadRaw, loadAofA, loadAofH, loadFile, cacheOriginal, embedData, testType, deleteRecords, toArray, loadExcel, loadTxt, parseStrings, parseArrays, resetHeaders, resetHashes, changeHeader, parseColumnData }