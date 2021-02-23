<script>
import * as d3 from 'd3'

export default {
  data() {
      return {
        default: {
          svg: {
            canvasId: 'd3Canvas',
            canvasHeight: '900',
            canvasWidth: '900'
          },
          bar: {
            xoffset: 10,
            yoffset: 10,
            thickness: 15,
            spacing: 2,
            orientation: 'vertical',
            labelSpacing: 10,
            fontsize: 14
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
            fontsize: 20
          }
        },
        svgStatus: ''
      }
  },
  methods: {
    d3Svg: function (svgOptions) {
      if (!svgOptions) { svgOptions = {} }
      // initialize d3 Canvas with options to specify height, width (use clear option to start from scratch)
      console.log('d3svg..')

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
    },

    setOptions: function (type, options) {
      if (!options) { options = {} }
      // enables easy use of pre-defined default options by type
      var Options = {}
      if (this.default[type]) {
        var opts = Object.keys(this.default[type])
        console.log('check for ' + opts.join(', '))
        console.log(JSON.stringify(options))
        for (var i = 0; i < opts.length; i++) {
          var opt = opts[i]
          if (options[opt] !== undefined) {
            Options[opt] = options[opt]
          } else if (this.default[type][opt] !== undefined) {
            Options[opt] = this.default[type][opt]
          }
        }
      } else {
        console.debug(type + 'defaults not defined')
        Options = options
      }
      console.log(type + ' options: ' + JSON.stringify(Options))
      return Options
    },

    d3ColourTheme: function (theme) {
      if (theme) {
        return d3.scaleOrdinal(d3[theme])
      } else {
        return d3.scaleOrdinal(d3[this.default.colorTheme])
      }
    },

    addCircle: function (options) {
      console.log('add circle: ' + JSON.stringify(options))
      var svg = options.svg || this.d3Svg()

      svg.append('circle')
            .attr('cx', options.x)
            .attr('cy', options.y)
            .attr('r', options.radius)
            .attr('fill', options.colour || 'green');
    },
    addBars: function (options) {
      console.log('add bars: ' + JSON.stringify(options))
      var svg = options.svg || this.d3Svg()
      
      var set = this.setOptions('bar', options)

      var color = d3.scaleOrdinal(d3.schemeDark2)

      var bars = svg.selectAll(".myBars")
        .data(options.data)
        .enter()
        .append("rect")

      bars
        .attr('x', set.xoffset)
        .attr('y', function(d,i) { return set.yoffset + i*(set.thickness + set.spacing) })
        .attr('width', function(d) { return d })
        .attr('height', set.thickness)
        .attr("fill", (d, i) => color(i))

      this.addText(options)
    },

    addText: function (options) {
      console.log('add text: ' + JSON.stringify(options))
      var svg = options.svg || this.d3Svg()

      var color = d3.scaleOrdinal(d3.schemeDark2)
      var set = this.setOptions('bar', options)

      var texts = svg.selectAll(".myTexts")
          .data(options.data)
          .enter()
          .append("text");

      texts.attr("x", function(d) { return d + set.xoffset + set.labelSpacing})
          .attr("y", function(d,i) { return set.yoffset + i*(set.thickness + set.spacing) + set.thickness/2 + set.fontsize/2 - set.spacing})
          .attr("stroke", (d, i) => color(i))
          .text(function(d) { return d });

    },

    d3Bar: function (dataset, svgOptions, barOptions) {
      console.log('constructing bar plot for ' + dataset.length + ' datapoints')

      // {barPadding, height, width, scale, xaxis, yaxis, colorTheme}
      const {barPadding, scale, height, width, xaxis, yaxis} = this.setOptions('bar', barOptions)
      var count = dataset.length
      var axes = {x: xaxis, y: yaxis}

      var color = d3.scaleOrdinal(d3.schemeDark2)
      console.log('use colours: ' + color(0) + ', ' + color(1))

      var svg = this.d3Svg(svgOptions)

      console.log('initiated svg object')
      svg
        .selectAll("rect")
          .data(dataset)
          .enter()
          .append("rect")
            .attr("x", function(d, i) {
                return i * (width/count);
                })
            .attr("y", function(d) {
                return (height - d[axes.y]*scale);
                })
            .attr("width", width/count - barPadding)
            .attr("height", function(d) {
                return d[axes.y] * scale;
                })
            .attr("fill", (d, i) => color(i))
    },

    d3Pie: function (dataset, svgOptions = {}, pieOptions = {}) {
      console.log('constructing pie chart for ' + dataset.length + ' datapoints')

      // {labelPos, innerRadius, outerRadius, xaxis, yaxis, stroke, fontsize} 
      const {labelPos, innerRadius, outerRadius, stroke, fontsize} = this.setOptions('pie', pieOptions)

      // const data = d3.pie( dataset.map(d => { return { label: d[xAxis], value: d[yAxis] } }))

      const arcLabel = d3.arc()
        .innerRadius(labelPos)
        .outerRadius(labelPos);

      console.log('...defined arc label')
      var color = d3.scaleOrdinal(d3['schemeDark2'])
      console.log('use pie colours: ' + color(0) + ', ' + color(1))

      const pieCanvas = this.d3Svg(svgOptions).append('g').attr('transform', `translate(250,250)`); // Fix

      pieCanvas.selectAll('text')
        .data(dataset)
        .enter()

      pieCanvas.append('text')
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .style('font-size', fontsize + 'px')
        .attr('transform', d => `translate(${arcLabel.centroid(d)[0]}, ${arcLabel.centroid(d)[1] + fontsize})`)
          // .attr('transform',`translate(0, 20)`)

      pieCanvas.append('tspan')
        .attr('y', '-0.6em')
        .attr('x', 0)
        .style('font-weight', 'bold')
        .text(d => `${d.data.label}`);

      console.log('...defined pieCanvas')

      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle((d) => d.startAngle)
        .endAngle((d) => d.endAngle)
      
      console.log('...defined arc')

      pieCanvas.selectAll("path")
        .data(dataset)
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

      console.log('translate..')

      pieCanvas.attr("transform", `translate(200, 200)`);
      console.log('drew pie')
      return pieCanvas
    }
  }
} 
</script>