<template>
  <div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'MoveMap',
  props: ['dataset', 'width', 'height', 'domain'],
  mounted () {
    this.svg = d3.select(this.$el).append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
    this.render()
  },
  watch: {
    dataset () {
      this.render()
    }
  },
  methods: {
    render () {
      if (!this.dataset) return

      const xScale = d3.scaleLinear().domain(this.domain).range([0, this.width])
      const yScale = d3.scaleLinear().domain([0, 1]).range([0, this.height])

      const individuals = d3.nest()
        .key(d => d.tag)
        .entries(this.dataset)

      var color = d3.scaleSequential(d3.interpolateSpectral)

      const line = d3.line().x(d => xScale(d.section)).y(d => yScale(d.y))

      this.svg.selectAll('path').remove()
      this.svg.selectAll('path')
        .data(individuals)
        .enter()
        .append('path')
        .attr('d', d => line(d.values))
        .attr("fill", "none")
        .attr("stroke", (d, i) => color(i / individuals.length))
        .attr("stroke-width", 1)

      this.svg.selectAll('circle').remove()

      const that = this
      this.svg.selectAll('circle')
        .data(this.dataset)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.section))
        .attr('cy', d => yScale(d.y))
        .attr('r', 3)
        .style('stroke', 'black')
        .on('mouseenter', function (d) {
          const tag = d.tag
          that.svg.selectAll('circle')
            .filter(d => d.tag === tag)
            .attr('r', 8)
        })
        .on('mouseout', function (d) {
          const tag = d.tag
          that.svg.selectAll('circle')
            .filter(d => d.tag === tag)
            .attr('r', 3)
        })
        .on('click', d => {
          console.log(d)
        })
    }
  }
}
</script>

<style>
</style>