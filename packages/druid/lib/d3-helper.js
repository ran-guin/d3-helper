
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
    labelSpacing: 10,
    fontSize: 14,

    topMargin: 25,   // should be at least >= fontSize + labelSpacing
    bottomMargin: 10,
    leftMargin: 10,
    rightMargin: 10
    // height: 600,
    // width: 600,
    // scale: 10,
    // yaxis: 'value',
    // barPadding: 3,
    // colorTheme: 'schemeDark2'
  },
  pie: {
    labelPos: 150 * 1.2,
    innerRadius: 0,
    outerRadius: 150,
    xaxis: 'X',
    yaxis: 'Y',
    stroke: 'black',
    fontSize: 20
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
  console.log(type + ' options: ' + JSON.stringify(Options))
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
          .attr('fill', set.colour || 'green');
}

function addBars (options) {
  console.log('add bars: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)
  
  const set = this.setOptions('bar', options)
  console.log('default settings: ' + JSON.stringify(set))

  var color = d3.scaleOrdinal(d3.schemeDark2)

  var bars = svg.selectAll(".myBars")
    .data(options.data)
    .enter()
    .append("rect")

  var records = options.data.length

  var max = 0
  options.data.map(a => {
    if (a > max) { max = a }
  })

  var maxHeight
  var maxWidth

  if (set.orientation === 'horizontal') {
    maxWidth = max
    maxHeight = records * (set.thickness + set.spacing) 

    bars
      .attr('x', set.xOffset)
      .attr('y', function(d,i) { return set.yOffset + i*(set.thickness + set.spacing) })
      .attr('width', function(d) { return d })
      .attr('height', set.thickness)
      .attr("fill", (d, i) => color(i))
  } else {
    maxHeight = max
    maxWidth = records * (set.thickness + set.spacing) 

    bars
      .attr('x', function(d,i) { return set.xOffset + i*(set.thickness + set.spacing) })
      .attr('y', function(d) { return set.topMargin + maxHeight - d })
      .attr('width', set.thickness)
      .attr('height', function(d) { return d })
      .attr("fill", (d, i) => color(i))

  }

  maxHeight = maxHeight + set.yOffset + set.topMargin + set.bottomMargin
  maxWidth = maxWidth + set.xOffset + set.leftMargin + set.rightMargin


  options.maxHeight = maxHeight
  options.maxWidth = maxWidth
  options.records = records
  options.max = max

  this.addText(options)
  this.addAxis(options)
  
  return {records: records, max: max, maxHeight: maxHeight, maxWidth: maxWidth }
}

function addText (options) {
  console.log('add text: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)

  var color = d3.scaleOrdinal(d3.schemeDark2)
  var set = this.setOptions('bar', options)  // uses bar options for spacing 

  var texts = svg.selectAll(".myTexts")
      .data(options.data)
      .enter()
      .append("text");

  if (set.orientation === 'horizontal') {
    texts.attr("x", function(d) { return d + set.xOffset + set.labelSpacing})
      .attr("y", function(d,i) { return set.yOffset + i*(set.thickness + set.spacing) + set.thickness/2 + set.fontSize/2 - set.spacing})
      .attr("stroke", (d, i) => color(i))
      .text(function(d) { return d });
  } else {
    texts
      .attr('x', function(d,i) { return set.xOffset + i*(set.thickness + set.spacing) + set.thickness/2 - d.toString().length*set.fontSize/4})
      .attr('y', function(d) { return options.maxHeight - d - set.labelSpacing - set.fontSize })
      .attr("stroke", (d, i) => color(i))
      .text(function(d) { return d });
  }
}

function addAxis (options) {
  console.log('add axis: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)

  var set = this.setOptions('bar', options)  // uses bar options for spacing 

  // var x = d3.time.scale().range([0, 500]);
  // var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);

  svg.append('text')
    .attr('x', options.maxWidth/2)
    .attr('y', options.maxHeight)
    .text(function () { return 'X Axis' })

  svg.append('text')
    .attr('y', set.leftMargin)
    .attr('x', - options.maxHeight/2)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text('Y Axis')

  return true
}

export default { initSvg, resize, setOptions, addCircle, addBars, addText, addAxis };