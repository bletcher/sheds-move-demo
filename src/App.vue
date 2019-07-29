<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Tagged Individual Movements</span>
      </v-toolbar-title>
    </v-toolbar>

    <v-content>
      <v-container>
        <v-layout row wrap>

          <v-flex xs9>
            <tooltip
              v-if="currentInd"
              :description="currentIndDescription"
            />

          <ice-map-ben2 id="ice-map"
            :options="map.options" 
            :overlays="map.overlays">
            
            <move-map-layer2 id="move-layer" 
              :dataset="filteredRows" 
              :widthSVG="widthSVG" 
              :heightSVG="heightSVG" 
              :xDomain="xDomain" 
              :yDomain="yDomain" 
              :bodySizeDomain="bodySizeDomain"
              :margin="margin" 
              :numInd="numInd"
              @indHovered="onIndHovered" 
              @indUnhovered="onIndUnhovered"
              :radiosGroup="radiosGroup"
              :radiosSelect="radiosSelect"
              :selectedInds="selectedInds"
              @onEmptySelectedInds="onEmptySelectedInds"
              :getStrokePath="getStrokePath"
              :getStrokeOpacityPath="getStrokeOpacityPath"
              :getFillCircle="getFillCircle"
              :getOpacityCircle="getOpacityCircle"
              :getStrokeCircle="getStrokeCircle"
              :updateSelectedIndsOnClick="updateSelectedIndsOnClick"
              :showLines="showLines" >
            </move-map-layer2>
          </ice-map-ben2>

            <move-slider 
              :domain="this.dateDomain" 
              @brushed="filterDate"
              :widthSVG="widthSVG"
            ></move-slider>

          
            <v-divider light></v-divider>
            <p></p>
            <p># Filtered Rows: {{filteredRows.length}} of {{ dataset.length }}</p> 
            <p>Selected Individual(s): {{ selectedInds }}</p> 
            <p>Selected cohorts: {{ selectedCohorts }}</p> 

            <v-switch
              v-model="showLines"
              :label="'Show Lines?'"
            ></v-switch>



<div id="mapid"></div>

          </v-flex>

          <v-flex xs3>
            
            <div
              id="e3"
              style="max-width: 400px; margin: auto;"
              class="grey lighten-3"
            >
              <v-card>
                <v-container
                  fluid
                  grid-list-md
                >
                  <v-layout row wrap>


                    <v-flex xs12>
                      <v-card color="blue-grey darken-1" class="white--text" >
                        <v-card-title primary-title class="pb-0">
                          <div class="headline">Color</div>
                        </v-card-title>

                          <v-card-text  class="py-0 my-0">

                            <v-radio-group v-model="radiosGroup" :mandatory="true">
                              <v-radio label="Individual" value="radio-group-individual"></v-radio>
                              <v-radio label="Season" value="radio-group-season"></v-radio>
                            </v-radio-group>

                          </v-card-text>

                      </v-card>
                    </v-flex>


                    <v-flex xs12>
                      <v-card color="blue-grey darken-2" class="white--text">
                        <v-card-title primary-title>
                          <div class="headline">Filter</div>

                          <div class="text-xs-center"><v-btn small color="blue-grey darken-1" @click="resetXF">Reset</v-btn></div>
                          <move-histogram 
                            :width="175" 
                            :height="150" 
                            :data="cohortData" 
                            :selectedCohorts="selectedCohorts" 
                            @click="filterCohorts">                          
                          </move-histogram>
                          <div class="text-xs-center"><v-btn small color="blue-grey darken-1" @click="buttonInactive">{{ showInactiveLabel }}</v-btn></div>
                        </v-card-title>

                      </v-card>
                    </v-flex>


                    <v-flex xs12>
                      <v-card color="blue-grey darken-2" class="white--text">
                        <v-card-title primary-title>
                          <div class="headline">Select</div>

                          <v-card-text  class="py-0 my-0">
                            <v-radio-group v-model="radiosSelect" :mandatory="true">
                              <v-radio label="Individual" value="radio-select-individual"></v-radio>
                              <v-radio label="Area" value="radio-select-area"></v-radio>
                            </v-radio-group>
                          </v-card-text>

                        </v-card-title>

                      </v-card>
            
                    </v-flex>

                  </v-layout>
                </v-container>
              </v-card>

            </div>

          </v-flex>

        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import axios from 'axios'
import * as d3 from 'd3'
import * as crossfilter from 'crossfilter2'
import { evt } from './main'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

var csv2geojson = require('csv2geojson');

const xf = crossfilter()

const dimCohort = xf.dimension(d => d.cohort)
const groupCohort = dimCohort.group()

const dimDate = xf.dimension(d => d.date)
//const groupDate = dimCohort.group()

import MoveMapLayer2 from './components/MoveMapLayer2.vue'
import MoveSlider from './components/MoveSlider.vue'
import MoveHistogram from './components/MoveHistogram.vue'
import tooltip from './components/tooltip.vue'
import IceMapBen2 from './components/IceMapBen2.vue'
import IceMapLayerBen from './components/IceMapLayerBen.vue'

export default {
  name: 'App',
  components: {
    MoveMapLayer2,
    MoveSlider,
    MoveHistogram,
    tooltip,
    IceMapBen2,
    IceMapLayerBen
  },
  data () {
    return {
      dataset: [],
      filteredRows: [],
      cohorts: [],
      selectedCohort: [],
      selectedCohorts: [],
      cohortData: [],
      dateDomain: [],
      xDomain: [0, 1],
      yDomain: [0, 1],
      bodySizeDomain: [],
      margin: {top: 50, right: 50, bottom: 50, left: 50},
      selectedInds: [],
      uniqueTags: [],
      currentInd: null,
      currentIndIndex: null,
      currentDate: null,
      currentSeason: null,
      numInd: null,
      seasonCheckbox: false,
      radiosGroup: 'radio-group-individual',
      radiosSelect: 'radio-select-individual',
      showInactive: false,
      showInactiveLabel: "Show inactive",
      showLines: true,
      widthSVG: 700,
      heightSVG: 500,

      map: {
        options: {
          center: [42.375, -121.925],
          zoom: 12,
          maxZoom: 18,
          minZoom: 5
        },
        overlays: [
          {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'Major Streams',
            layer: 'sheds:flowlines_strahler_3',
            visible: true
          }, {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'Minor Streams',
            layer: 'sheds:detailed_flowlines',
            minZoom: 10
          }, {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'NHD Waterbodies',
            layer: 'sheds:waterbodies'
          }, {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'HUC8 Boundaries',
            layer: 'sheds:wbdhu8'
          }, {
            url: 'http://ecosheds.org:8080/geoserver/wms',
            label: 'HUC12 Boundaries',
            layer: 'sheds:wbdhu12',
            minZoom: 10
          }
        ]
      },
      catchments: {
        layer: null,
        selected: null
      }
    }
  },
  mounted () {
    // const myMap = L.map('mapid').setView([42.375, -121.925], 13)

    // L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    //   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //   maxZoom: 18,
    //   id: 'mapbox.streets',
    //   accessToken: 'pk.eyJ1IjoiYmxldGNoZXIiLCJhIjoiY2pzNHlqMDVnMGE3NzQzbWo1M29pa3l2ZCJ9.W9wn_So2RWf7tIs2W1PkXg'
    // }).addTo(myMap);


 //    axios.get('http://localhost:8082/data/pitdata.csv')
 // //   axios.get('http://localhost:8082/data/dummyData3.csv')
 //      .then((response) => {
 //        const dataString = response.data
 //        const dataIn = d3.csvParse(dataString)
 // //         .filter(d => d.river === 'WB')
 //          .map(d => ({
 //            date: new Date(d.date),
 //            tag: d.tag,
 //            xPos: +d.section,
 // //                       xPos: +d.xPos,
 //            yPos: Math.random(),
 // //                       yPos: +d.yPos,
 //            bodySize: +d.len,
 //  //                      bodySize: +d.bodySize,
 //            cohort: d.cohort
 //          }))
 //          .splice(0, 5000)

/////////////////////////
// sucker data

      //axios.get('http://localhost:8082/data/suckerViz.csv')
      axios.get('data/suckerViz.csv')
      .then((response) => {
        const dataString = response.data
        const dataIn = d3.csvParse(dataString)
 //         .filter(d => d.river === 'WB')
          .map(d => ({
            date: new Date(d.datetime),
            tag: d.uid,
            xPos: +d.long,
            yPos: +d.lat,
            latLng: new L.LatLng(+d.lat, +d.long),
            bodySize: +d.totalLength,
            cohort: d.releaseLocation,
            active: +d.active
          }))
//         .splice(0, 5000)     
//////////////////////////////////////////////////////////////


// http://bl.ocks.org/kristin-henry-sf/2ffa2a4d06412db552f627b48b85cf97
// d.LatLng = new L.LatLng(d.loc[0], d.loc[1]);

// var csv2geojson = require('csv2geojson');
// var geoJson = csv2geojson.csv2geojson(dataIn, function(err, data) {
//     // err has any parsing errors
//     // data is the data.
//     console.log('geoJson1',data)
// });
// console.log('geoJson2',geoJson)


        // get unique tag ids
        this.uniqueTags = [...new Set(dataIn.map(d => d.tag))]
        this.numInd = this.uniqueTags.length

        var data = dataIn
        const getSeason = d => Math.floor((d.getMonth() / 12 * 4)) % 4

        // add uniqueTag index to data.tagIndex
        // add season
        data.forEach(d => {
          this.uniqueTags.forEach((dd,i) => {
            if (d.tag === this.uniqueTags[i]) {
              d.tagIndex = i + 1
            }
          })
          d.season = getSeason(d.date)
        })
console.log("data", data, this.uniqueTags)
console.log("numInds", this.numInd, this.radiosGroup)

        const cohorts = []
        data.forEach(d => {
          if (!cohorts.includes(d.cohort)) {
            cohorts.push(d.cohort)
          }
        })
        this.cohorts = cohorts.sort()

        this.dataset = data
        this.filteredRows = this.dataset
        this.dateDomain = d3.extent(this.filteredRows, d => d.date)
        this.xDomain = d3.extent(this.dataset, d => d.xPos)
        this.yDomain = d3.extent(this.dataset, d => d.yPos)
        this.bodySizeDomain = d3.extent(this.dataset, d => d.bodySize)      

        xf.add(this.dataset)

        this.cohortData = groupCohort.all()
        this.selectedCohorts = this.cohorts

         console.log('beginning',this.cohorts,this.cohortData,this.selectedCohort,this.selectedCohorts)

    }) // axios call
  },
  watch: {
    // selectedCohort () {
    //   this.filterCohort(this.selectedCohort)
    // },
    //selectedCohorts () {
    //  this.filterCohorts(this.selectedCohorts)
   // }

  },
  computed: {
    currentIndDescription () {
      return "Tag#: " + this.currentInd + ", IndIndex: " + this.currentIndIndex + ", Date: " + this.currentDate.toDateString() + ", Season: "+ this.currentSeason 
    }
  },
  methods: {
    filterDate (d) {
      // console.log('filterDate', d)
      if (d === null) {
        dimDate.filterAll()
      } else {
        dimDate.filterRange(d)
      }
      this.onFilter()
    },

    // filterCohort (cohort) {
    //         console.log('cohort',cohort,this.selectedCohort,this.selectedCohorts)
    //   if (this.selectedCohort !== cohort) {
    //     this.selectedCohort = cohort
    //   }
    //   dimCohort.filterExact(cohort) //.filterFunction(d => select includes cohort)
    //   this.onFilter()
    //   this.dateDomain = d3.extent(this.filteredRows, d => d.date)
    // },

    filterCohorts (cohort) {
 
      if (!this.selectedCohorts.includes(cohort)) { // cohort is not included             
        this.selectedCohorts.push(cohort)  
        this.selectedCohorts.sort()       
      } else {
        const indexToRemove = this.selectedCohorts.indexOf(cohort)       
        if(indexToRemove > -1) {                
          this.selectedCohorts.splice(indexToRemove, 1)                               
        } 
      }

      dimCohort.filterFunction(d => this.selectedCohorts.includes(d)) 

      this.onFilter()
      this.dateDomain = d3.extent(this.filteredRows, d => d.date)
    },
    onFilter () {
      this.filteredRows = xf.allFiltered()
      //console.log('on filter',this.selectedCohorts)
    },
    fillFilterBars () {

    },

    resetXF () {
      this.cohortData = groupCohort.all()
      this.selectedCohort = []
      this.filteredRows = xf.all()
      this.dateDomain = d3.extent(this.filteredRows, d => d.date)

console.log('reset',this.selectedCohort)

     //this.filterCohort(this.cohorts)
     // this.filteredRows = xf.all()
     // this.dateDomain = d3.extent(this.filteredRows, d => d.date)
      //this.selectedCohort = []
    },
    buttonInactive () {
      this.showInactive = !this.showInactive
      if (this.showInactive) {
        this.showInactiveLabel = "Show all" }
      else { 
        this.showInactiveLabel = "Show inactive"
      }  
      console.log('showInactive:', this.showInactive, this.showInactiveLabel)
    },
    onIndHovered (d) {
      this.currentInd = d.tag
      this.currentIndIndex = d.tagIndex
      this.currentDate = d.date 
      this.currentSeason = d.season    
    },
    onIndUnhovered () {
      this.currentInd = undefined
    },
    onEmptySelectedInds (d) {
      this.selectedInds = d
      //https://codepen.io/Kradek/pen/ZKKGNJ?editors=1010
    },
    getStrokePath (d) {
      //console.log('getColorPath', d)
      var color = d3.scaleSequential(d3.interpolateSpectral)
      const colorOut = color(d.values[0].tagIndex / this.numInd / 1)
      return colorOut
    },
    getStrokeOpacityPath (d) {
      const opacityOut = (this.selectedInds.includes(d.values[0].tagIndex) || this.selectedInds.length === 0) ? 1 : 0.01
      return opacityOut
    },
    getFillCircle (d) {
      var color = d3.scaleSequential(d3.interpolateSpectral)
      const colorOut = this.radiosGroup === 'radio-group-individual' ? color(d.tagIndex / this.numInd / 1) : color(d.season / 4 / 1)
      return colorOut
    },
    getOpacityCircle (d) {
      const opacityOut = (this.selectedInds.includes(d.tagIndex) || this.selectedInds.length === 0) ? 1 : 0.01
      return opacityOut
    },
    // getOpacityCircleMouseOut (d) {
    //   const that = this
    //   const opacityOut = (that.selectedInds.includes(d.tagIndex) || that.selectedInds.length === 0) ? 1 : 0.01
    //   return opacityOut
    // },
    getStrokeCircle (d) {
      const strokeOut = d.active === 0 ? "black" : "transparent"
      return strokeOut
    },
    updateSelectedIndsOnClick (d) {
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
    }
//    switchLines () {
      //jwant to run render - better to run in MoveMap
 //     console.log('switchLines',showLines)
 //   }

  }
}
</script>
<style>
  #mapid { height: 500px; }
  #move-map { height: 500px; width: 700px; }

body {
  padding: 0px;
  margin: 0px;
  font-family: "proxima-nova-alt", Helvetica, Arial, sans-serif;
}
a {
  cursor: pointer;
}
.ice-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.ice-left-sidebar {
  display: inline;
  position: absolute;
  top: 60px;
  left: 0px;
  width: 440px;
  z-index: 3000;
}
.ice-right-sidebar {
  display: inline;
  position: absolute;
  top: 60px;
  right: 0px;
  width: 475px;
  z-index: 3000;
}
.ice-box {
  padding: 10px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  border-bottom-right-radius: 2px;
  box-shadow: 0px 0px 3px 0px #aaa;
}
.ice-box-title {
  font-weight: bold;
  font-size: 1.1em;
  font-variant: small-caps;
  margin-bottom: 5px;
}
.ice-box-label {
  font-weight: bold;
  font-size: 1.1em;
  font-variant: small-caps;
  text-align: right;
  margin-top: 5px
}
.ice-filter-legend {
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: 5px;
  padding-right: 5px;
}
.ice-filter-container {
  max-height: 460px;
  margin-top: 5px;
  overflow-y: auto;
  overflow-x: hidden;
}
.ice-loading {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  padding-top: 50px;
  z-index: 5000;
  background: rgba(0, 0, 0, 0.7);
  text-align: center;
  color: #f5f5f5;
}
</style>