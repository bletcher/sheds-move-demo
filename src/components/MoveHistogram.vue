<template>
  <div></div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'MoveHistogram',
  props: ['data', 'width', 'height'],
  data () {
    return {
      margin: {top: 20, right: 0, bottom: 30, left: 40}
    }
  },
  computed: {
    xScale() {
      return d3.scaleBand()
        .domain(this.data.map(d => d.key))
        .range([this.margin.left, this.width - this.margin.right])
        .padding(0.1)
    },
    yScale() {
      return d3.scaleLinear()
        .domain([0, d3.max(this.data, d => d.value)]).nice()
        .range([this.height - this.margin.bottom, this.margin.top])
    }
  },
  mounted () {
    const svg = d3.select(this.$el)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.xAxis = g => g
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.xScale)
          .tickSizeOuter(0))

    this.yAxis = g => g
      .attr("transform", `translate(${this.margin.left},0)`)
      .call(d3.axisLeft(this.yScale))
      .call(g => g.select(".domain").remove())

    this.gBar = svg.append("g")
        .attr("fill", "steelblue");

    this.gXAxis = svg.append("g");

    this.gYAxis = svg.append("g");

    this.render()
  },
  watch: {
    data() {
      this.render()
    }
  },
  methods: {
    render () {
      this.gBar
        .selectAll("rect")
        .remove()
      this.gBar
        .selectAll("rect")
        .data(this.data)
        .enter()
        .append("rect")
        .attr("x", d => this.xScale(d.key))
        .attr("y", d => this.yScale(d.value))
        .attr("height", d => this.yScale(0) - this.yScale(d.value))
        .attr("width", this.xScale.bandwidth())
        .on('click', (d) => {
          this.$emit('click', d.key)
        });

      this.gXAxis.call(this.xAxis)
      this.gYAxis.call(this.yAxis)
    }
  }
}
</script>

<style>

</style>