<template>
  <div>
  </div>
</template>

<script>
import * as d3 from 'd3'
//import evt from '../main.js'
import * as topojson from 'topojson-client'
import { evt } from '../main'

export default {
  name: 'MoveMap',
  props: ['dataset', 'margin', 'widthSVG', 'heightSVG', 'xDomain', 'yDomain', 'bodySizeDomain', 'numInd', 'indHovered', 'indUnhovered', 'radiosGroup', 'radiosSelect', 'selectedInds','showInactive', 'getStrokePath','getStrokeOpacityPath','getFillCircle','getOpacityCircle','getStrokeCircle','updateSelectedIndsOnClick','showLines'],
  mounted () {

    this.svg = d3.select(this.$el).append('svg')
      .attr('width', this.widthSVG)
      .attr('height', this.heightSVG)
      .on('click', d => {
          this.emptySelectedInds()
      })
    .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    this.render()
  },
  data () {
    return {
      emptyInds: this.selectedInds,
      circles: null
    }
  },
  computed: {


  },
  watch: {
    dataset () {
      this.render()
    },
    radiosGroup () {
      this.render()
    },
    selectedInds () {
      this.render()
    },
    showLines () {
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
console.log('inds', individuals)

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

      if(this.showLines) {
        this.svg.selectAll('path')
          .data(individuals)
          .enter()
          .append('path')
          .attr('d', d => line(d.values))
          .attr("fill", "none")
          .attr("stroke", this.getStrokePath) 
          .attr("stroke-width", 1)
          .attr('stroke-opacity', this.getStrokeOpacityPath)
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
      }

      this.svg.selectAll('circle').remove()

      var circles = this.svg.selectAll('circle')
        .data(this.dataset)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.xPos))
        .attr('cy', d => yScale(d.yPos))
        .attr('r', d => bodySizeScale(d.bodySize))
        .attr("fill", this.getFillCircle)       
        .attr('fill-opacity', this.getOpacityCircle)
        .attr("stroke", this.getStrokeCircle)
        .attr('stroke-opacity', this.getOpacityCircle)
        .on('mouseenter', function (d) {
          const tagIndex = d.tagIndex
          that.svg.selectAll('circle')
            .filter(d => d.tagIndex === tagIndex)
            .attr('r', 12) // 4 bigger than upper range on bodySizeScale 
            .attr('fill-opacity', 1)

          that.$emit('indHovered', d)
        })
        .on('mouseout', function (d) {
          const tagIndex = d.tagIndex
          that.svg.selectAll('circle')
            .filter(d => d.tagIndex === tagIndex)
            .attr('r', d => bodySizeScale(d.bodySize))
            .attr('fill-opacity', (that.selectedInds.includes(d.tagIndex) || that.selectedInds.length === 0) ? 1 : 0.01) // using getOpacityCircle doesn't work here, this/that problem

          that.$emit('indUnhovered', d)  
        })
        .on('click', d => {
          console.log("tagIndex",d.tagIndex)
          //d3.select(this).raise()  
          d3.event.stopPropagation() // does not allow svg.on('click') to fire - so only fires 'circle' not 'circle and 'svg'
          this.updateSelectedIndsOnClick(d)
        })
    },
    emptySelectedInds() {
      this.$emit("onEmptySelectedInds", [])
    }
  }
}
</script>

<style>
</style>