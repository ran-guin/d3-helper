
import * as d3 from 'd3'

import d3Svg from './../../svg/lib/d3-svg.js'
import d3Data from './../../data/lib/d3-data.js'

function testSvg (input) {
  console.log('svg test...' + JSON.stringify(input))

  // var tooltip = d3.select("body")
  //   .append("div")
  //   .style("position", "absolute")
  //   .style("z-index", "50")
  //   .style("visibility", "hidden")
  //   .style("background", "#F00")
  //   .text("a simple tooltip");

  var svg = input.svg
  
  svg.select('body').append('div')
    .attr('id', 'tooltip')
    .attr('style', 'padding: 3rem; position: absolute; opacity: 0; background-color: #F99; color: blue;');

  svg.append('text')
      .attr('id', 'tooltip')
      .attr('x', 300)
      .attr('y', 50)
      // .attr('stroke', 'black')
      .attr('style', 'padding: 3rem; position: absolute; opacity: 0; background-color: #F99; color: blue;')
      .text('hello')
      .style('opacity', 0.5)

  svg.selectAll('circle')
    .data(['a','b','c'])
    .join('circle')
      .attr('r', 40)
      .attr('cy', 200)
      .attr('cx', (d,i) => 100 + i*100)
      .on('mouseover', function(e, d) {
        console.log('add tooltip for ' + d + ' or ' + e)
        d3.select('#tooltip')
          .transition().duration(200)
          .style('opacity', 1)
          .text(d)
      })
      .on('mouseout', function() {
        d3.select('#tooltip').style('opacity', 0)
      })
      .on('mousemove', function() {
        // d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px')
      }) 
  return 'ok'
}

function addBars (options) {
  console.log('add bars: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)
  var data = options.data       // eg [{fname: 'Peter', state: 'BC', age: 41}, {fname: 'Paul', state: 'Alberta', age: 33}, {fname: 'Mary', state: 'Ontario', age: 27}]
  var scale = options.scale || 1

  const set = d3Svg.setOptions('bar', options)
  console.log('default settings: ' + JSON.stringify(set))

  var dataHeight = set.height - set.topMargin - set.bottomMargin
  var dataWidth = set.width - set.leftMargin - set.rightMargin 
  var xPadding = 0
  var yPadding = 0
  var span
  var crossSpan
  if (set.orientation === 'horizontal') {
    xPadding = set.maxValue.toString().length * set.fontSize / 2
    span = dataWidth + xPadding
    crossSpan = dataHeight
    console.log('set span as ' + set.width + ' - ' + set.leftMargin + ' - ' + set.rightMargin + ' - ' + xPadding)
  } else {
    yPadding = set.fontSize
    span = dataHeight + yPadding
    crossSpan = dataWidth
    console.log('set span as ' + set.height + ' - ' + set.topMargin + ' - ' + set.bottomMargin + ' - ' + yPadding)
  }
  
  if (!options.scale) {
    scale = span / set.maxValue
    console.log('auto set scale to ' + scale + ' (based on max value of ' + set.maxValue + ' and an effective canvas size of ' + span)
  }
  if (!options.thickness) {
    set.thickness = ((crossSpan - 2*set.spacing) / set.records) - set.spacing
    console.log('auto set bar thickness to ' + set.thickness + ' (based on ' + set.records + ' records (spaced at ' + set.spacing + ') spanning an effective canvas base of ' + crossSpan )
  }

  var bars = svg.selectAll(".myBars")
    .data(data)
    .enter()
    .append("rect")

  var formatted = d3Data.formatData(data)
  console.log('Formatted: ' + JSON.stringify(formatted))

  console.log('max value = ' + set.maxValue)

  if (set.orientation === 'horizontal') {
    bars
      .attr('x', set.leftMargin)
      .attr('y', function(d,i) { return set.topMargin + i*(set.thickness + set.spacing) + set.spacing})
      .attr('width', function(d) { return d[set.valueCol]*scale })
      .attr('height', set.thickness)
      .attr("fill", (d, i) => set.color(i))
  } else {

    bars
      .attr('x', function(d,i) { return set.leftMargin + i*(set.thickness + set.spacing) + set.spacing })
      .attr('y', function(d) { return set.topMargin + dataHeight - d[set.valueCol]*scale })
      .attr('width', set.thickness)
      .attr('height', function(d) { return d[set.valueCol]*scale })
      .attr("fill", (d, i) => set.color(i))     
  }

  bars
    .on("mouseenter", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 0.5);
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 1);
    });


  options.dataHeight = dataHeight
  options.dataWidth = dataWidth
  options.scale = scale
  
  console.log('... add text for datapoints ...')
  this.addText(options)

  console.log('... add axes ...')
  this.addAxis(options)
  
  console.log('complete.')
  return {records: set.records, max: set.maxValue, dataHeight: dataHeight, dataWidth: dataWidth, height: set.height, width: set.width }
}

function addText (options) {
  console.log('add text: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)
  var data = options.data
  var scale = options.scale

  var set = d3Svg.setOptions('bar', options)  // uses bar options for spacing 

  var color = set.color

  console.log('add bar text for ' + data.length + ' records')
  var texts = svg.selectAll(".myTexts")
      .data(data)
      .enter()
      .append("text");

  if (set.orientation === 'horizontal') {
    texts.attr("x", function(d) { return d[set.valueCol]*scale + set.leftMargin + set.labelSpacing})
      .attr("y", function(d,i) { return set.topMargin + i*(set.thickness + set.spacing) + set.thickness/2 + set.fontSize/2 + set.spacing})
      .attr("stroke", (d, i) => set.color(i))
      .text(function(d) { return d[set.labelCol] });
  } else {
    texts
      .attr('x', function(d,i) { return set.leftMargin + set.spacing + i*(set.thickness + set.spacing) + set.thickness/2 - d[set.valueCol]*scale.toString().length*set.fontSize/4})
      .attr('y', function(d) { return set.topMargin + options.dataHeight - d[set.valueCol]*scale - set.labelSpacing })
      .attr("stroke", (d, i) => set.color(i))
      .text(function(d) { return d[set.labelCol] });
  }
  console.log('added labels')
}

function addAxis (options) {
  console.log('add axis: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)
  var data = options.data
  
  var set = d3Svg.setOptions('bar', options)  // uses bar options for spacing 
 
  svg.append('text')
    .attr('x', options.dataWidth/2)
    .attr('y', set.height)
    .text(options.xaxis)

  svg.append('text')
    .attr('y', set.fontSize)
    .attr('x', - set.height/2)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text(options.yaxis)

  // var x = d3.scaleTime()  // dates ... 

  if (set.orientation === 'horizontal') {
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return + d[set.valueCol] })])
      .range([ set.leftMargin, set.leftMargin + options.maxValue ]);
    svg.append("g")
      .call(d3.axisBottom(x))
      .attr("transform", "translate(0," + (options.dataHeight + set.topMargin) + ")")
  } else {
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return + d[set.valueCol] })])
      .range([ set.height - set.bottomMargin, set.bottomMargin ]);
    svg.append("g")
      .call(d3.axisLeft(y))
      .attr("transform", "translate(" + set.leftMargin + ", 0)")

  }
  return true
}

export default { addBars, addText, addAxis, testSvg};