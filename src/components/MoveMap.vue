<template>
  <div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'MoveMap',
  props: ['dataset', 'margin', 'widthSVG', 'heightSVG', 'xDomain', 'yDomain', 'bodySizeDomain', 'numInd', 'indHovered', 'indUnhovered', 'radiosGroup', 'radiosSelect', 'selectedInds','showInactive'],
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
  watch: {
    dataset () {
      this.render()
    },
    radiosGroup () {
      this.render()
    },
    selectedInds () {
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
        .attr('stroke-opacity', d => (that.selectedInds.includes(d.values[0].tagIndex) || that.selectedInds.length === 0) ? 1 : 0.1)
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

      var circles = this.svg.selectAll('circle')
        .data(this.dataset)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.xPos))
        .attr('cy', d => yScale(d.yPos))
        .attr('r', d => bodySizeScale(d.bodySize))
        .attr("fill", d => that.radiosGroup === 'radio-group-individual' ? color(d.tagIndex / that.numInd / 1) : color(d.season / 4 / 1))       
        .attr('fill-opacity', d => (that.selectedInds.includes(d.tagIndex) || that.selectedInds.length === 0) ? 1 : 0.1)
        .attr("stroke", d => d.active === 0 ? "black" : "transparent")
        .attr('stroke-opacity', d => (that.selectedInds.includes(d.tagIndex) || that.selectedInds.length === 0) ? 1 : 0.1)
        .on('mouseenter', function (d) {
          const tagIndex = d.tagIndex
          that.svg.selectAll('circle')
            .filter(d => d.tagIndex === tagIndex)
            .attr('r', 9) // 1 bigger than upper range on bodySizeScale 
            .attr('fill-opacity', 1)

          that.$emit('indHovered', d)  
        })
        .on('mouseout', function (d) {
          const tagIndex = d.tagIndex
          that.svg.selectAll('circle')
            .filter(d => d.tagIndex === tagIndex)
            .attr('r', d => bodySizeScale(d.bodySize))
            .attr('fill-opacity', d => (that.selectedInds.includes(d.tagIndex) || that.selectedInds.length === 0) ? 1 : 0.1)          
          that.$emit('indUnhovered', d)  
        })
        .on('click', d => {
          console.log("tagIndex",d.tagIndex)
          //d3.select(this).raise()  
          d3.event.stopPropagation() // does not allow svg.on('click') to fire - so only fires 'circle' not 'circle and 'svg'
          if(this.radiosSelect === 'radio-select-individual') {
            if (!this.selectedInds.includes(d.tagIndex)) { // ind is not selected              
              this.selectedInds.push(d.tagIndex)
              this.selectedInds.sort((a, b) => a - b) // (a,b)... needed to sort numbers             
            } else { // ind is selected
              const indexToRemove = this.selectedInds.indexOf(d.tagIndex)
              if(indexToRemove > -1) {                
                this.selectedInds.splice(indexToRemove, 1)               
                this.selectedInds.sort((a, b) => a - b)                 
              }             
            }
          }
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