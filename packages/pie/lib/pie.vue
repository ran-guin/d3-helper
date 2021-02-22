<script>
import * as d3 from 'd3'

export default {
  data() {
      return {
        pieStatus: ''
      }
  },
  methods: {
    d3Arc (svg, options) {
      if (!options) { options = {} }

      console.log('d3 arc...')
      var fill = options.fill || 'blue'
      var stroke = options.stroke || 'black'
      var translate = options.translate
      var innerRadius = options.innerRadius || 0
      var outerRadius = options.outerRadius || 100
      var startAngle = options.startAngle || 0
      var endAngle = options.endAngle || 280

      const angleScale = d3
        .scaleLinear()
        .domain([0, 360])
        .range([0, 2 * Math.PI]);

      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(angleScale(startAngle))
        .endAngle(angleScale(endAngle));

      console.log(svg.constructor)
      const g = svg.append("g")

      g.append("path")
          .attr("d", arc)
          .attr("fill", fill)
          .attr("stroke", stroke)
          .attr("stroke-ypos", "1px")
      
      if (translate) {
        var x = +translate[0]
        var y = +translate[1]
        console.log(JSON.stringify(options))
        console.log('translate: ' + x + ', ' + y)
        g.attr("transform", `translate(${x},${y})`)
      }
      console.log('draw Arc')
    },

    d3Pie(svg, options) {          
      if (!options) { options = {} }
      console.log('draw pie chart')
      var fontsize = options.fontsize || 20
      var xAxis = options.xaxis
      var yAxis = options.yaxis
      var stroke = options.stroke || 'black'
      var inner = options.innerRadius
      var outer = options.outerRadius
      var dataset = options.dataset || []
      var labelPos = options.labelPos
      
      const data = d3.pie( dataset.map(d => { return { label: d[xAxis], value: d[yAxis] } }))

      const color = d3.scaleOrdinal(d3.schemeDark2);
      const arcLabel = d3.arc()
        .innerRadius(labelPos)
        .outerRadius(labelPos);

      const g = svg.append('g')

      const plotArea = g
        .attr('transform', `translate(250,250)`); // Fix

      const labels = plotArea.selectAll('text')
        .data(data)
        .enter()
        .append('text')
          .style('text-anchor', 'middle')
          .style('alignment-baseline', 'middle')
          .style('font-size', fontsize + 'px')
          .attr('transform', d => `translate(${arcLabel.centroid(d)[0]}, ${arcLabel.centroid(d)[1] + fontsize})`)
          // .attr('transform',`translate(0, 20)`)

      console.log(xAxis + ', ' + yAxis + ' data: ' + JSON.stringify(data))
      labels.append('tspan')
        .attr('y', '-0.6em')
        .attr('x', 0)
        .style('font-weight', 'bold')
        .text(d => `${d.data.label}`);

      console.log('Opt: ' + JSON.stringify(options))

      const arc = d3.arc()
      .innerRadius(inner)
      .outerRadius(outer)
      .startAngle((d) => d.startAngle)
      .endAngle((d) => d.endAngle)
      
      console.log('Data: ' + JSON.stringify(dataset))
      console.log('defined g...')

      g.selectAll("path")
        .data(data)
        .enter()
        .append("path")
          .attr("d", arc)
          .attr("fill", (d, i) => color(i))
          .attr("stroke", stroke)
          .attr("stroke-ypos", "1px")
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

      g.attr("transform", `translate(200, 200)`);
      console.log('drew pie')
      return g
    }
  }
}