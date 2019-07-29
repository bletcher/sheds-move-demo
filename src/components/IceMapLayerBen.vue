<script>
//import { mapGetters } from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
//import d3Tip from 'd3-tip'
//import VariableMixin from '../mixins/variable'
//import evt from '../event-bus'
import { evt } from '../main'
export default {
  name: 'IceMapLayerBen',
  props: ['dataset', 'margin', 'widthSVG', 'heightSVG', 'xDomain', 'yDomain', 'bodySizeDomain', 'numInd', 'indHovered', 'indUnhovered', 'radiosGroup', 'radiosSelect', 'selectedInds','showInactive', 'getStrokePath','getStrokeOpacityPath','getFillCircle','getOpacityCircle','getStrokeCircle','updateSelectedIndsOnClick','showLines'],
//  mixins: [VariableMixin],
  data () {
    return {
      data: null,
      g: null,
      emptyInds: this.selectedInds,
      circles: null//,
//      tip: d3Tip()
//        .attr('class', 'd3-tip')
    }
  },
  computed: {
//    ...mapGetters(['theme', 'variable']),
    map () {
      return this.$parent.map
    },
    zoomLevel () {
      return this.$parent.zoomLevel
    },
    pointRadius () {
      return this.zoomLevel - 2
    }
  },
  mounted () {
    console.log(`map-layer(${this.id}):mounted`)
//    evt.$on('map:zoom', this.resize)
//    evt.$on('map:render', this.renderFill)
//    this.g = this.$parent.svg.select('g.leaflet-zoom-hide')
//      .append('g')
  },
  beforeDestroy () {
    // console.log(`map-layer(${this.id}):beforeDestroy`)
    // evt.$off('map:zoom', this.resize)
    // evt.$off('map:render', this.renderFill)
    // this.g.remove()
    // this.data = null
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
    resize () {
      console.log(`map-layer(${this.id}):resize`)
      if (this.setBounds) {
        const bounds = this.path.bounds(this.data)
        this.$parent.$emit('resize', bounds)
      }
      this.render()
    },
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

      // this.svg.selectAll('g').remove()

      // this.svg.append("g")
      //   .attr("class", "x axis")
      //   .attr("transform", "translate(0," + height + ")")
      //   .call(d3.axisBottom(xScale)) 

      // this.svg.append("g")
      //   .attr("class", "y axis")
      //   .call(d3.axisLeft(yScale))  




    },
    renderFill () {
      // console.log(`map-layer(${this.id}):renderFill`)
      this.g
        .selectAll('path')
        .style('fill', this.getFill)
    },
    renderSelected () {
      console.log(`map-layer(${this.id}):renderSelected`)
      this.g
        .selectAll('path')
        .style('stroke', d => this.isSelected(d) ? 'red' : null)
    },
    isSelected (feature) {
      return !!this.selected && this.selected.id === feature.id
    }
  },
  render: function (h) {
    return null
  }
}
</script>

<style>
path {
  fill: rgb(200,200,200);
  stroke: rgb(0, 0, 0);
  stroke-width: 0.5px;
}
/*
  d3-tip -----------------------------------------------------------
  https://rawgit.com/Caged/d3-tip/master/examples/example-styles.css
*/
.d3-tip {
  line-height: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #000;
  border-radius: 2px;
  pointer-events: none;
  font-family: sans-serif;
  z-index: 1000;
}
</style>