<script>
import * as d3 from 'd3'
import svg from './Svg'

export default {
  data() {
      return {
        barStatus: ''
      }
  },
  mixins: [
    svg
  ],
  methods: {
    d3Bar (dataset, options) {
      if (!options) { options = {} }
      console.log('constructing bar plot...')
      var barPadding = options.padding || 3
      var h = options.height || 400
      var w = options.width || 600
      var scale = options.scale || 10
      var yAxis = options.yaxis || 'value'

      var count = dataset.length
      var axes = {y: yAxis}

      const color = d3.scaleOrdinal(d3.schemeDark2);

      dataset.map(d => { 
        console.log(JSON.stringify(d))
        console.log('axes: ' + axes.y)
        console.log(h + ' - ' + d[axes.y] + '*' + scale)  
      })
      console.log('draw bar chart with ' + dataset.length + 'datapoints')

      this.mySvg({clear: true, height: h, width: w})
        .selectAll("rect")
          .data(dataset)
          .enter()
          .append("rect")
            .attr("x", function(d, i) {
                return i * (w/count);
                })
            .attr("y", function(d) {
                return (h - d[axes.y]*scale);
                })
            .attr("width", w/count - barPadding)
            .attr("height", function(d) {
                return d[axes.y] * scale;
                })
            .attr("fill", (d, i) => color(i))
    },
    d3Arcs(svg, options) {    
      if (!options) { options = {} }

      console.log('draw arcs chart')
      var fontsize = options.fontsize // 20
      var xAxis = options.xaxis
      var yAxis = options.yaxis
      var stroke = options.stroke || 'black'
      var inner = options.innerRadius
      var outer = options.outerRadius
      var dataset = options.dataset

      const color = d3.scaleOrdinal(d3.schemeDark2);
      var arcWidth = (outer - inner) / dataset.length

      const g = svg.append("g");

      const originalData = JSON.parse(JSON.stringify(dataset))

      const data = originalData.sort((a, b) => (a[xAxis] > b[xAxis] ? 1 : -1));

      const max_val = d3.max(data, o => o[yAxis]);
      // const sum_gdp = d3.sum(sortedGDP, o => o.gdp);

      const angleScale = d3
        .scaleLinear()
        .domain([0, max_val])
        .range([0, 1.5 * Math.PI]);

      const arc = d3.arc()
        .innerRadius((d, i) => (i + 1) * arcWidth + inner)
        .outerRadius((d, i) => (i + 2) * arcWidth + inner)
        .startAngle(angleScale(0))
        .endAngle(d => angleScale(d[yAxis]));

      console.log('width of arc: ' + arcWidth)

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
      
      g.selectAll("text")
          .data(data)
          .enter()
          .append("text")
            .style('font-size', fontsize + 'px')
            .text(d => `${d[xAxis]} : ${d[yAxis]}`)
            .attr("x", -150)
            .attr("dy", -inner - arcWidth/2)
            .attr("y", (d, i) => -(i + 1) * arcWidth);

      g.attr("transform", `translate(200, 200)`);

      console.log('drew arcs')
      return g
    }
  }
}
</script>