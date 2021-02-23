
import * as d3 from 'd3'

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

function addBars (barOptions) {
  console.log('add bars ' + JSON.stringify(barOptions))
  return 'added'
}

export default {initSvg, addBars};