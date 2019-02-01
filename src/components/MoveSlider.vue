<template>
  <div></div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'MoveSlider',
  props: ['domain'],
  data () {
    return {
      margin: {top: 0, right: 20, bottom: 30, left: 50},
      height: 100,
      width: 550
    }
  },
  computed: {
    xScale() {
      return d3.scaleTime()
        .domain(this.domain)
        .range([this.margin.left, this.width - this.margin.right])
    }
  },
  watch: {
    domain () {
      this.render()
    }
  },
  mounted () {
    this.svg = d3.select(this.$el)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.brush = d3.brushX()
      .extent([
        [this.margin.left, this.margin.top],
        [this.width - this.margin.right, this.height - this.margin.bottom]
      ])
      .on("start brush end", this.brushed)

    this.svg.append("g")
      .attr("class", "brush")
      .attr('stroke', d3.rgb(230, 230, 230))
      .style("fill", d3.rgb(248, 248, 248))
      .call(this.brush);

    this.gAxis = this.svg.append('g')

    this.render()
  },
  methods: {
    brushed () {
      if (d3.event.selection) {
        const d = d3.event.selection.map(this.xScale.invert)
        this.$emit('brushed', d)
      } else {
        this.$emit('brushed', null)
      }
    },
    render () {
      const gBrush = this.svg.select('g.brush')
      gBrush.call(this.brush.move, null)

      const xAxis = g => g
        .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
        .call(d3.axisBottom(this.xScale))

      this.gAxis.call(xAxis);
    }
  }
}
</script>

<style>

</style>