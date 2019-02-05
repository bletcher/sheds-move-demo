<template>
  <div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'MoveMap',
  props: ['dataset', 'margin', 'widthSVG', 'heightSVG', 'xDomain', 'yDomain', 'bodySizeDomain', 'numInd', 'indSelected', 'indDeselected'],
  mounted () {
    this.svg = d3.select(this.$el).append('svg')
      .attr('width', this.widthSVG)
      .attr('height', this.heightSVG)
    .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

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

      const that = this // for mouseover

      const width = this.widthSVG - this.margin.left - this.margin.right 
      const height = this.heightSVG - this.margin.top - this.margin.bottom;

      const xScale = d3.scaleLinear().domain(this.xDomain).range([0, width])
      const yScale = d3.scaleLinear().domain(this.yDomain).range([height, 0])
      const bodySizeScale = d3.scaleLinear().domain(this.bodySizeDomain).range([3, 8])

      const individuals = d3.nest()
        .key(d => d.tag)
        .entries(this.dataset)

      var color = d3.scaleSequential(d3.interpolateSpectral)
//      var color = d3.scaleOrdinal(d3.schemeCategory10)

      const line = d3.line().x(d => xScale(d.xPos)).y(d => yScale(d.yPos))

      this.svg.selectAll('g').remove()

      this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)) 

      this.svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale))  

      this.svg.selectAll('path').remove()
      this.svg.selectAll('path')
        .data(individuals)
        .enter()
        .append('path')
        .attr('d', d => line(d.values))
        .attr("fill", "none")
        .attr("stroke", d => color(d.values[0].tagIndex / this.numInd / 1)) // 1 color/ind, just use first obs
        .attr("stroke-width", 1)
        .on('mouseenter', function (d, i) {
          const ind = i
          that.svg.selectAll('path')
            .filter((d, i) => i === ind)
            .attr("stroke-width", 2)
        })
        .on('mouseout', function (d, i) {
          const ind = i
          that.svg.selectAll('path')
            .filter((d, i) => i === ind)
            .attr("stroke-width", 1)
        })

      this.svg.selectAll('circle').remove()

      this.svg.selectAll('circle')
        .data(this.dataset)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.xPos))
        .attr('cy', d => yScale(d.yPos))
        .attr('r', d => bodySizeScale(d.bodySize))
        .style("fill", d => color(d.tagIndex / this.numInd / 1))
//        .style("fill", (d, i) => color(d.tagIndex))
        .on('mouseenter', function (d) {
          const tagIndex = d.tagIndex
          that.svg.selectAll('circle')
            .filter(d => d.tagIndex === tagIndex)
            .attr('r', 9) 

          that.$emit('indSelected', d)  
        })
        .on('mouseout', function (d) {
          const tagIndex = d.tagIndex
          that.svg.selectAll('circle')
            .filter(d => d.tagIndex === tagIndex)
            .attr('r', d => bodySizeScale(d.bodySize))

          that.$emit('indDeselected', d)  
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