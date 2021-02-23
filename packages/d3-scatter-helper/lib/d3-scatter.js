import * as d3 from 'd3'
import d3Svg from './../../d3-svg-helper/lib/d3-svg.js'

function addScatter(options) {   
  console.log('add scatter chart: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)
  var data = options.data       // eg [{fname: 'Peter', state: 'BC', age: 41}, {fname: 'Paul', state: 'Alberta', age: 33}, {fname: 'Mary', state: 'Ontario', age: 27}]

  const set = d3Svg.setOptions('scatter', options)
  console.log('default settings: ' + JSON.stringify(set))

  // var radius = options.radius || Math.min(set.width, set.height) / 4

  console.log('add data ' + JSON.stringify(data))
  var color = set.color || d3.scaleOrdinal(d3.schemeDark2)

  // var scatter = svg
  //   .data(data)
  //   .enter()
  //   .append("rect")

  var scatter = svg.selectAll(".myScatter")
    .data(data)
    .enter()
    .append("rect")

  console.log('Scatter: ' + JSON.stringify(data))

  data.map(d => {
    console.log('X: ' + set.xCol + ': ' + d[set.xCol] + ' x ' + set.scaleX + ' = ' + d[set.xCol] * set.scaleX)
    console.log('Y: ' + set.yCol + ': ' + d[set.yCol] + ' x ' + set.scaleY + ' = ' + d[set.yCol] * set.scaleY)
  })

  scatter
    .attr('x', (d) => d[set.xCol] * set.scaleX)
    .attr('y', (d) => set.height - set.bottomMargin - d[set.yCol] * set.scaleY)
    .attr('height', 20)
    .attr('width', 20)
    .attr('fill', (d, i) => color(i))

  scatter
    .on("mouseenter", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 0.5);
      d3.select('#xAxis')        // Testing .. not accessing this element (?)
        .style('color', 'red');
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 1);
    });


  console.log('added data')

  // scatter
  //   .attr('x', 200)
  //   .attr('y', 200)
  //   .attr('height', 10)
  //   .attr('width', 10)
  //   .attr("fill", (d, i) => color(i))
    //       .attr("d", arc)
    //       .attr("fill", (d, i) => color(i))
    //       .attr("stroke", set.stroke)
    //       .attr("stroke-ypos", "1px")
    //       .on("mouseenter", function(d) {
    //         d3.select(this)
    //           .transition()
    //           .duration(200)
    //           .attr("opacity", 0.5);
    //         d3.select('#Legend' + d[set.labelCol]) // NOT WORKING (?)
    //           .transition()
    //           .duration(200)
    //           .attr("opacity", 0.5);
    //       })
    //       .on("mouseout", function(d) {
    //         d3.select(this)
    //           .transition()
    //           .duration(200)
    //           .attr("opacity", 1);
    //         d3.select('#Legend' + d[set.labelCol]) // NOT WORKING (?)
    //           .transition()
    //           .duration(200)
    //           .attr("opacity", 1);
    //       });
    

    // options.radius = radius

  this.addAxis(options)

  this.addLabels(options)
  // console.log('drew pie')
  return {records: data.length, max: set.maxValue }
}


function addLabels (options) {
  var set = d3Svg.setOptions('pie', options)  // uses bar options for spacing 
  var svg = options.svg
  var data = options.data

  // const labels = 
  svg
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .style('font-size', set.fontSize + 'px')

//   if (set.labelPosition === 'outside' ) {
//     labels.style('text-anchor', function(d) {
//       // are we past the center?
//       return (d.endAngle + d.startAngle)/2 > Math.PI ?
//           "end" : "start";
//     })
//     .attr('transform', d => `translate(${arcLabel.centroid(d)[0] + set.width/2}, ${arcLabel.centroid(d)[1] + set.height/2 + set.fontSize})`)

//   } else if (set.labelPosition === 'inside') {
//     labels.style('text-anchor','middle')
//     .attr('transform', d => `translate(${arcLabel.centroid(d)[0] + set.width/2}, ${arcLabel.centroid(d)[1] + set.height/2 + set.fontSize})`)
//   } else if (set.labelPosition === 'legend') {
//     labels.style('text-anchor','start')
//     .attr('transform', (d, i) => "translate(" + (labelPos + set.fontSize * 2) + "," + (labelPos + i*set.fontSize*2) + ")")
//   }

//   labels.style('alignment-baseline', 'middle')

//   labels.append('tspan')
//     .attr('y', '-0.6em')
//     .attr('x', 0)
//     .style('font-weight', 'bold')
//     .style('font-size', set.fontSize + 'px')
//     .text((d,i) => `${data[i][set.labelCol]}`)

//   if (set.labelPosition === 'legend') {
//     svg.selectAll(".myLegend")
//       .data(data)
//       .enter()
//       .append("rect")
//         .attr('id', (d) => `${"Legend" + d[set.labelCol]}`)
//         .attr('x', labelPos)
//         .attr('y', (d,i) => `${labelPos + i*set.fontSize*2 - set.fontSize - set.fontSize/2}` )  // - 23
//         .attr('height', set.fontSize)
//         .attr('width', set.fontSize)
//         .attr('fill', (d, i) => color(i))
//   }

//   d3Svg.addRectangle({svg: svg, x: labelPos*2, y: labelPos*2, width: set.spacing*2, height: set.spacing*2, colour: 'red'})

//   data.map(a => {
//     console.log(set.labelCol + ' data labels: ' + a[set.labelCol])
//   })
//   return {options: options, valueColumn: set.valueCol, labelColumn: set.labelCol}
}

function addAxis (options) {
  console.log('add axis: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)
  var data = options.data
  
  var set = d3Svg.setOptions('scatter', options)  // uses bar options for spacing 
 
  svg.append('text')
    .attr('id', 'xAxis')
    .attr('x', set.dataWidth/2)
    .attr('y', set.height - set.fontSize)
    .text(options.xaxis)
    .style('font-weight', 'bold')

  svg.append('text')
    .attr('id', 'yAxis')
    .attr('y', set.fontSize)
    .attr('x', - set.height/2)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text(options.yaxis)
    .style('font-weight', 'bold')

  // var x = d3.scaleTime()  // dates ... 

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return + d[set.xCol] })])
    .range([ set.leftMargin, set.leftMargin + set.maxX*set.scaleX ]);
  svg.append("g")
    .call(d3.axisBottom(x))
    .attr("transform", "translate(0," + (set.dataHeight + set.topMargin) + ")")
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return + d[set.yCol] })])
    .range([ set.height - set.bottomMargin, set.height - set.bottomMargin - set.maxY*set.scaleY ]);
  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("transform", "translate(" + set.leftMargin + ", 0)")

  return true
}

export default { addScatter, addLabels, addAxis };