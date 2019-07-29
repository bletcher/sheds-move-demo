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
  name: 'MoveMap2',
  props: ['dataset', 'margin', 'widthSVG', 'heightSVG', 'xDomain', 'yDomain', 'bodySizeDomain', 'numInd', 'indHovered', 'indUnhovered', 'radiosGroup', 'radiosSelect', 'selectedInds','showInactive', 'getStrokePath','getStrokeOpacityPath','getFillCircle','getOpacityCircle','getStrokeCircle','updateSelectedIndsOnClick','showLines'],
  // move get... functions to methods in this component
  mounted () {

    this.map = L.map(this.$el).setView([42.42, -121.955], 11)
//[42.41, -121.95], 11
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoiYmxldGNoZXIiLCJhIjoiY2pzNHlqMDVnMGE3NzQzbWo1M29pa3l2ZCJ9.W9wn_So2RWf7tIs2W1PkXg'
    }).addTo(this.map);

 //   this.map.on("moveend", this.updateLocations)

    // this.map.on('click', function() { 
    //   alert('Coordinates are: ' + 
    //   this.map.getCenter().lat + 
    //   ', ' + 
    //   this.map.getCenter().lng); 
    // })

    const svg = d3.select(this.map.getPanes().overlayPane).append('svg')
    svg.append('g').attr('class', 'leaflet-zoom-hide')

    //    this.svg
    //     .on('click', d => {
    //       console.log("click LatLon", this.d)
    //     })

    this.render()

 
  },
  data () {
    return {
      map: null,
      disableClick: false,
      bounds: null,
      zoomLevel: null,
      emptyInds: this.selectedInds
  //    circles: null
    }
  },
  computed: {
    svg () {
      return d3.select(this.map.getPanes().overlayPane).select('svg')
    }
    // svg () {
    //   return d3.select(this.map.getPanes().overlayPane).select('svg')
    // }
    // path () {
    //   const map = this.map
    //   function projectPoint (x, y) {
    //     const point = map.latLngToLayerPoint(new L.LatLng(y, x))
    //     this.stream.point(point.x, point.y)
    //   }
    //   const transform = d3.geoTransform({ point: projectPoint })
    //   return d3.geoPath().projection(transform).pointRadius(this.pointRadius)
    // },
//    map () {
//      return this.$parent.map
//    }
    // zoomLevel () {
    //   return this.$parent.zoomLevel
    // },
    // pointRadius () {
    //   return this.zoomLevel - 2
    // }

  },
  watch: {
    dataset () {
//      this.render()
    },
    radiosGroup () {
//      this.render()
    },
    selectedInds () {
//      this.render()
    },
    showLines () {
//      this.render()
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

      const map = this.map

console.log('latLon', 
  map.latLngToLayerPoint([42.5, -121.9]).x,
  map.latLngToLayerPoint([42.5, -121.9]).y)

const markers = [
  {lng: -121.9, lat: 42.5}, 
  {lng: -121.8, lat: 42.4} 
];

//const tmp = this.getLayerPoints(markers)
//const tmp2 = this.getLayerPoint2(markers[0].long, markers[0].lat)


console.log('latLon2', markers, markers[0].lng, markers[0].lat,
  this.map.latLngToLayerPoint([42.5, -121.9]).x,
  this.map.latLngToLayerPoint([42.5, -121.9]).y,
    this.map.latLngToLayerPoint([markers[0].lat, markers[0].lng]).x,
  this.map.latLngToLayerPoint([markers[0].lat, markers[0].lng]).y
//  this.map.latLngToLayerPoint([markers.lat, markers.lng]).x
  )



      this.svg.selectAll('circle').remove()

      var circles = this.svg.selectAll('circle')
        .data(this.dataset)
        .enter()
        .append('circle')
    //.attr("cx", this.getLayerPoints().x)
    //.attr("cy", this.getLayerPoints().y)
       .attr('cx', function(d){ return map.latLngToLayerPoint([d.yPos, d.xPos]).x })
       .attr('cy', function(d){ return map.latLngToLayerPoint([d.yPos, d.xPos]).y })
        .attr("r", 4)
        .attr("fill", "red")
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("fill-opacity", 1)


      // var circles = this.svg.selectAll('circle')
      //   .data(this.dataset)
      //   .enter()
      //   .append('circle')
      // //  .attr('cx', function(d){ return this.map.latLngToLayerPoint([d.yPos, d.xPos]).x })
      // //  .attr('cy', function(d){ return this.map.latLngToLayerPoint([d.yPos, d.xPos]).y })
      //   .attr('cx', d => xScale(d.xPos))
      //   .attr('cy', d => yScale(d.yPos))
      //   .attr('r', d => bodySizeScale(d.bodySize))
      //   .attr("fill", this.getFillCircle)       
      //   .attr('fill-opacity', this.getOpacityCircle)
      //   .attr("stroke", this.getStrokeCircle)
      //   .attr('stroke-opacity', this.getOpacityCircle)
      //   .on('mouseenter', function (d) {
      //     const tagIndex = d.tagIndex
      //     that.svg.selectAll('circle')
      //       .filter(d => d.tagIndex === tagIndex)
      //       .attr('r', 12) // 4 bigger than upper range on bodySizeScale 
      //       .attr('fill-opacity', 1)

      //     that.$emit('indHovered', d)  
      //   })
      //   .on('mouseout', function (d) {
      //     const tagIndex = d.tagIndex
      //     that.svg.selectAll('circle')
      //       .filter(d => d.tagIndex === tagIndex)
      //       .attr('r', d => bodySizeScale(d.bodySize))
      //       .attr('fill-opacity', (that.selectedInds.includes(d.tagIndex) || that.selectedInds.length === 0) ? 1 : 0.01) // using getOpacityCircle doesn't work here, this/that problem

      //     that.$emit('indUnhovered', d)  
      //   })
      //   .on('click', d => {
      //     console.log("tagIndex",d.tagIndex)
      //     //d3.select(this).raise()  
      //     d3.event.stopPropagation() // does not allow svg.on('click') to fire - so only fires 'circle' not 'circle and 'svg'
      //     this.updateSelectedIndsOnClick(d)
      //   })

    },
    updateLocations () {
      const map = this.map

      d3.selectAll('circle')
       .attr('cx', function(d){ return map.latLngToLayerPoint([d.yPos, d.xPos]).x })
       .attr('cy', function(d){ return map.latLngToLayerPoint([d.yPos, d.xPos]).y })
    }
  }
}
</script>

<style>
/* .ice-map {
  width: 100%;
  height: 100vh;
} */
.ice-map {
  width: 700px;
  height: 500px;
} 
/*div.leaflet-top.leaflet-left {
  margin-left: 450px;
  margin-top: 60px;
} */
div.leaflet-top.leaflet-left {
  margin-left: 5px;
  margin-top: 5px;
} 
 .leaflet-touch .leaflet-control-layers-toggle {
  width: 30px !important;
  height: 30px !important;
}
.ice-control-transparency {
  width: 34px;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 5px;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.4);
}
.ice-control-transparency-slider {
  height: 100px;
  display: inline-block;
}
</style>