import * as d3 from 'd3'
import d3Svg from './../../d3-svg/lib/d3-svg.js'

function addPie(options) {   
  console.log('add pie chart: ' + JSON.stringify(options))
  var svg = options.svg || this.initSvg(options)
  var data = options.data       // eg [{fname: 'Peter', state: 'BC', age: 41}, {fname: 'Paul', state: 'Alberta', age: 33}, {fname: 'Mary', state: 'Ontario', age: 27}]

  const set = d3Svg.setOptions('pie', options)
  console.log('default settings: ' + JSON.stringify(set))
  const color = set.color

  var radius = options.radius || Math.min(set.width, set.height) / 4
  
  var canvas = svg.append("g")
    .attr("transform", "translate(" + set.width / 2 + "," + set.height / 2 + ")");

  const arc = d3.arc()
    .innerRadius(set.innerRadius)
    .outerRadius(radius)
    // .startAngle((d) => d.startAngle)
    // .endAngle((d) => d.endAngle)
  
    // .attr('transform', "translate(" + set.xoffset + "," + set.yoffset + ")");

  console.log('add data')

  var pie = d3.pie()
    .value(function(d) { return d[set.valueCol]; });
  
  // canvas.
  canvas.selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g")
      .attr("class", 'arc')
        .append("path")
          .attr("d", arc)
          .attr("fill", (d, i) => color(i))
          .attr("stroke", set.stroke)
          .attr("stroke-ypos", "1px")
          .on("mouseenter", function(d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("opacity", 0.5);
            d3.select('#Legend' + d[set.labelCol]) // NOT WORKING (?)
              .transition()
              .duration(200)
              .attr("opacity", 0.5);
          })
          .on("mouseout", function(d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("opacity", 1);
            d3.select('#Legend' + d[set.labelCol]) // NOT WORKING (?)
              .transition()
              .duration(200)
              .attr("opacity", 1);
          });
    
  options.radius = radius

  this.addLabels(options)
  console.log('drew pie')
  return {records: data.length, max: set.maxValue }
}


function addLabels (options) {
  var set = d3Svg.setOptions('pie', options)  // uses bar options for spacing 
  var svg = options.svg
  var data = options.data

  var labelPos = options.labelPos
  if (set.labelPosition === 'outside' ) {
    labelPos = options.radius + set.spacing
  } else if (set.labelPosition === 'inside') {
    labelPos = options.radius * 0.65
  } else if (set.labelPosition === 'legend') {
    labelPos = set.width / 10
  }

  const color = d3.scaleOrdinal(d3.schemeDark2);

  const arcLabel = d3.arc()
    .innerRadius(labelPos)
    .outerRadius(labelPos)

  var xPos = arcLabel.centroid(60)
  console.log('test pos: ' + JSON.stringify(xPos))

  var pie = d3.pie()
    .value(function(d) { return d[set.valueCol] });

  const labels = svg
    .selectAll('text')
    .data(pie(data))
    .enter()
    .append('text')
    .style('font-size', set.fontSize + 'px')

  if (set.labelPosition === 'outside' ) {
    labels.style('text-anchor', function(d) {
      // are we past the center?
      return (d.endAngle + d.startAngle)/2 > Math.PI ?
          "end" : "start";
    })
    .attr('transform', d => `translate(${arcLabel.centroid(d)[0] + set.width/2}, ${arcLabel.centroid(d)[1] + set.height/2 + set.fontSize})`)

  } else if (set.labelPosition === 'inside') {
    labels.style('text-anchor','middle')
    .attr('transform', d => `translate(${arcLabel.centroid(d)[0] + set.width/2}, ${arcLabel.centroid(d)[1] + set.height/2 + set.fontSize})`)
  } else if (set.labelPosition === 'legend') {
    labels.style('text-anchor','start')
    .attr('transform', (d, i) => "translate(" + (labelPos + set.fontSize * 2) + "," + (labelPos + i*set.fontSize*2) + ")")
  }

  labels.style('alignment-baseline', 'middle')

  labels.append('tspan')
    .attr('y', '-0.6em')
    .attr('x', 0)
    .style('font-weight', 'bold')
    .style('font-size', set.fontSize + 'px')
    .text((d,i) => `${data[i][set.labelCol]}`)

  if (set.labelPosition === 'legend') {
    svg.selectAll(".myLegend")
      .data(data)
      .enter()
      .append("rect")
        .attr('id', (d) => `${"Legend" + d[set.labelCol]}`)
        .attr('x', labelPos)
        .attr('y', (d,i) => `${labelPos + i*set.fontSize*2 - set.fontSize - set.fontSize/2}` )  // - 23
        .attr('height', set.fontSize)
        .attr('width', set.fontSize)
        .attr('fill', (d, i) => color(i))
  }

  d3Svg.addRectangle({svg: svg, x: labelPos*2, y: labelPos*2, width: set.spacing*2, height: set.spacing*2, colour: 'red'})

  data.map(a => {
    console.log(set.labelCol + ' data labels: ' + a[set.labelCol])
  })
  return {options: options, valueColumn: set.valueCol, labelColumn: set.labelCol}
}

  function addArcs (options) {    
    console.log('add pie chart: ' + JSON.stringify(options))
    var svg = options.svg || this.initSvg(options)
    var data = options.data       // eg [{fname: 'Peter', state: 'BC', age: 41}, {fname: 'Paul', state: 'Alberta', age: 33}, {fname: 'Mary', state: 'Ontario', age: 27}]
  
    const set = d3Svg.setOptions('pie', options)
    console.log('default settings: ' + JSON.stringify(set))
  
    var arcWidth = (set.outerRadius - set.innerRadius) / data.length

    const angleScale = d3
      .scaleLinear()
      .domain([0, set.maxValue])
      .range([0, 1.5 * Math.PI]);

    const arc = d3.arc()
      .innerRadius((d, i) => (i + 1) * set.arcWidth + set.innerRadius)
      .outerRadius((d, i) => (i + 2) * set.arcWidth + set.innerRadius)
      .startAngle(angleScale(0))
      .endAngle(d => angleScale(d[set.yAxis]));

    console.log('width of arc: ' + arcWidth)

    var drawing = svg.append('g')
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => set.color(i))
        .attr("stroke", set.stroke)
        .attr("stroke-ypos", "1px")
        .on("mouseenter", function(d) {
          // d3.select(this)
          //   .transition()
          //   .duration(200)
          //   .attr("opacity", 0.5)
          d3.select('#Legend' + d[set.labelCol])
            .selectAll('rect')
            .transition()
            .duration(200)
            .attr("opacity", 0.5)
        })
        .on("mouseout", function(d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 1);
          d3.select('#Legend' + d[set.labelCol])
            .transition()
            .duration(200)
            .attr("opacity", 1)
        });
    
    // g.selectAll("text")
    //     .data(data)
    //     .enter()
    //     .append("text")
    //       .style('font-size', fontSize + 'px')
    //       .text(d => `${d[xAxis]} : ${d[yAxis]}`)
    //       .attr("x", -150)
    //       .attr("dy", -inner - arcWidth/2)
    //       .attr("y", (d, i) => -(i + 1) * arcWidth);

    drawing.attr("transform", `translate(200, 200)`);

    console.log('drew arcs')
    return {options: options}
  }

  export default { addPie, addArcs, addLabels };