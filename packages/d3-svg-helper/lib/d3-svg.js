
import * as d3 from 'd3'

const defaults = {
  svg: {
    canvasId: 'd3Canvas',
    canvasHeight: '600',
    canvasWidth: '800'
  },
  circle: {
    x: 20,
    y: 20,
    radius: 30
  },
  bar: {
    xOffset: 10,
    yOffset: 5,
    thickness: 15,
    spacing: 2,
    orientation: 'vertical',
    labelSpacing: 5,
    fontSize: 14,

    topMargin: 50,   // should be at least >= fontSize + labelSpacing
    bottomMargin: 50,
    leftMargin: 50,
    rightMargin: 10,
    padding: 15
    // height: 600,
    // width: 600,
    // scale: 10,
    // yaxis: 'value',
    // barPadding: 3,
    // colorTheme: 'schemeDark2'
  },
  pie: {
    labelPosition: 'legend',
    innerRadius: 0,
    outerRadius: 150,
    stroke: 'black',
    fontSize: 20,
    spacing: 20
  },
  scatter: {
    labelPosition: 'legend',
    stroke: 'black',
    fontSize: 20,
    topMargin: 50,   // should be at least >= fontSize + labelSpacing
    bottomMargin: 50,
    leftMargin: 50,
    rightMargin: 10,
    padding: 15
  },
  text: {
    fontSize: 20
  }
}

function initSvg (svgOptions) {
  const options = this.setOptions('svg', svgOptions)

  var id = options.canvasId
  console.log('initialize d3 canvas : ' + id)

  if (svgOptions.clear) {
    console.log('clear existing svg first...')
    d3.select('#' + id).selectAll('svg').remove()
  }
  var h = options.canvasHeight
  var w = options.canvasWidth

  console.log(h + ' x ' + w + ' Canvas Generated...')

  return d3.select('#' + id)
    .append('svg')
      .attr('height', h)
      .attr('width', w)
}

function resize (options) {
  var id = options.id
  var height = options.height
  var width = options.width

  console.log('resize to ' + height + ' x ' + width)
  d3.select(id).selectAll('svg')
    .attr('height', height)
    .attr('width', width)

}

function setOptions (type, options) {
  if (!options) { options = {} }
  // enables easy use of pre-defined default options by type
  var Options = {}
  if (defaults[type]) {
    var opts = Object.keys(defaults[type])
    console.log('check for ' + opts.join(', '))

    console.log(JSON.stringify(options))
    for (var i = 0; i < opts.length; i++) {
      var opt = opts[i]
      if (options[opt] !== undefined) {
        Options[opt] = options[opt]
      } else if (defaults[type][opt] !== undefined) {
        Options[opt] = defaults[type][opt]
      }
    }
  } else {
    console.debug(type + 'defaults not defined')
    Options = options
  }
  console.log(type + ' input options: ' + JSON.stringify(options))
  
  var inputKeys = Object.keys(options)
  for (var ki = 0; ki < inputKeys.length; ki++) {
    if (inputKeys[ki] !== 'data' && inputKeys[ki] !== "svg") {
      if (!Options[inputKeys[ki]]) {
        Options[inputKeys[ki]] = options[inputKeys[ki]]
        console.log(inputKeys[ki] + ' custom option added: ' + JSON.stringify(options[inputKeys[ki]]))
      }
    }
  }

  // Add additional options for plots:
  if (options.data) {
    if (!options.headers) {
      Options.headers = Object.keys(options.data[0]).map(a => {
        return { text: a, value: a }
      })
    }

    if (options.svg) {
      if (!options.width) {
        Options.width = options.svg.attr("width")
      }
      if (!options.height) {
        Options.height = options.svg.attr("height")
      }
      
      Options.dataHeight = Options.height - Options.topMargin - Options.bottomMargin
      Options.dataWidth = Options.width - Options.leftMargin - Options.rightMargin 
      console.log("extract svg attributes... for height & width")
      console.log('eg height: ' + Options.height + ' - ' + Options.topMargin + ' - ' + Options.bottomMargin)
    }

    if (!options.valueCol || !options.labelCol) {
      console.log("Confirm key index for value column...")
      var valueCol
      var labelCol
      var index = 0
      for (var o = 0; o < Options.headers.length; o++) {
        valueCol = Options.headers[o].value
        console.log(valueCol + ' ? ')
        var cType = options.data[0][valueCol].constructor
        if (cType === Number && !index) {
          index = o
          o = Options.headers.length
        } else if (!labelCol) {
          labelCol = valueCol
        } else if (cType === String) {
          labelCol = valueCol
        }
      }

      if (!options.valueCol) { Options.valueCol = valueCol }
      if (!options.labelCol) { Options.labelCol = labelCol }
    }

    if (!options.color) {
      Options.color = d3.scaleOrdinal(d3.schemeDark2)
    }

    var max = 0
    console.log(JSON.stringify(options.data))
    options.data.map((a) => {
      var val = parseInt(a[Options.valueCol])
      if (val > max) { max = val }
    })
    Options.maxValue = max
    Options.records = options.data.length
  }


  if (type === 'bar') {
    var xPadding = 0
    var yPadding = 0
    var span
    var crossSpan
    if (Options.orientation === 'horizontal') {
      xPadding = Options.maxValue.toString().length * Options.fontSize / 2
      span = Options.dataWidth + xPadding
      crossSpan = Options.dataHeight
      console.log('set span as ' + Options.width + ' - ' + Options.leftMargin + ' - ' + Options.rightMargin + ' - ' + xPadding)
    } else {
      yPadding = Options.fontSize
      span = Options.dataHeight + yPadding
      crossSpan = Options.dataWidth
      console.log('set span as ' + Options.height + ' - ' + Options.topMargin + ' - ' + Options.bottomMargin + ' - ' + yPadding)
    }
    Options.span = span
    Options.crossSpan = crossSpan
    
    if (!options.scale) {
      // default if not manually specified (Note: options is input.. Options includes defaults)
      Options.scale = Options.span / Options.maxValue
      console.log('auto set scale to ' + Options.scale + ' (based on max value of ' + Options.maxValue + ' and an effective canvas size of ' + span)
    }
    if (!options.thickness) {
      Options.thickness = ((crossSpan - 2*Options.spacing) / Options.records) - Options.spacing
      console.log('auto set bar thickness to ' + Options.thickness + ' (based on ' + Options.records + ' records (spaced at ' + Options.spacing + ') spanning an effective canvas base of ' + crossSpan )
    }
  } else if (type === 'scatter') {
    Options.xCol = Options.labelCol
    Options.yCol = Options.valueCol

    var maxX = 0
    console.log(JSON.stringify(options.data))
    options.data.map((a) => {
      var val = parseInt(a[Options.xCol])

      if (val > maxX) {
        maxX = val
      }
    })
    Options.maxX = maxX
    Options.maxY = max

    console.log('set scale height to max:' + Options.dataHeight + ' / ' + Options.maxY)
    console.log('set scale width to max:' + Options.dataWidth + ' / ' + Options.maxX)
    Options.scaleX = Options.dataWidth / Options.maxX
    Options.scaleY = Options.dataHeight / Options.maxY

  }



  console.log(type + ' output OPTIONS: ' + JSON.stringify(Options))
  return Options
}

function addCircle (options) {
  console.log('add circle: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)

  const set = this.setOptions('circle', options)

  return svg.append('circle')
          .attr('cx', set.x)
          .attr('cy', set.y)
          .attr('r', set.radius)
          .attr('fill', set.color || 'green');
}

function addRectangle(options) {
  console.log('add rectangle: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)

  const set = this.setOptions('rectangle', options)

  return svg.append('rect')
          .attr('x', set.x)
          .attr('y', set.y)
          .attr('height', set.radius)
          .attr('width', set.radius)
          .attr('fill', set.color || 'green');
}

export default { initSvg, resize, setOptions, addCircle, addRectangle};