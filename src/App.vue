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
            <move-map 
              :dataset="filteredRows" 
              :widthSVG="550" 
              :heightSVG="400" 
              :xDomain="xDomain" 
              :yDomain="yDomain" 
              :margin="margin" 
              :numInd="numInd"
              @indSelected="onIndSelected" 
              @indDeselected="onIndDeselected">
            </move-map>
            <tooltip
              v-if="currentInd"
              :description="currentIndDescription"
            />
            <move-slider :domain="this.dateDomain" 
              @brushed="filterDate"></move-slider>
          </v-flex>
          <v-flex xs3>
            <p># Filtered Rows: {{filteredRows.length}} of {{ dataset.length }}</p>
            <v-select 
              :items="cohorts"
              label="Cohort"
              v-model="selectedCohort"
              multiple>
            </v-select>
            <move-histogram :width="250" :height="250" :data="cohortData" @click="filterCohort"></move-histogram>
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

const xf = crossfilter()

const dimCohort = xf.dimension(d => d.cohort)
const groupCohort = dimCohort.group()

const dimDate = xf.dimension(d => d.date)
//const groupDate = dimCohort.group()

import MoveMap from './components/MoveMap.vue'
import MoveSlider from './components/MoveSlider.vue'
import MoveHistogram from './components/MoveHistogram.vue'
import tooltip from './components/tooltip.vue'

export default {
  name: 'App',
  components: {
    MoveMap,
    MoveSlider,
    MoveHistogram,
    tooltip
  },
  data () {
    return {
      dataset: [],
      filteredRows: [],
      cohorts: [],
      selectedCohort: [],
      cohortData: [],
      dateDomain: [],
      xDomain: [0, 1],
      yDomain: [0, 1],
      margin: {top: 80, right: 50, bottom: 50, left: 50},
      selectedInds: [],
      uniqueTags: [],
      currentInd: null,
      currentDate: null,
      numInd: null
    }
  },
  mounted () {
    axios.get('http://localhost:8082/data/dummyData3.csv')
      .then((response) => {
        const dataString = response.data
        const dataIn = d3.csvParse(dataString)
 //         .filter(d => d.river === 'WB')
          .map(d => ({
            date: new Date(d.date),
            tag: d.tag,
            xPos: +d.xPos,
            yPos: +d.yPos,
            cohort: d.cohort
          }))
 //         .splice(0, 1000)

        // get unique tag ids
        this.uniqueTags = [...new Set(dataIn.map(d => d.tag))]
        this.numInd = this.uniqueTags.length

        var data = dataIn

        // add uniqueTags index to data.tagIndex
        data.forEach(d => {
          this.uniqueTags.forEach((dd,i) => {
            if (d.tag === this.uniqueTags[i]) {
              d.tagIndex = i + 1
            }
          }) 
        })
console.log("data", data, this.uniqueTags)
console.log("numInds", this.numInd)

        const cohorts = []
        data.forEach(d => {
          if (!cohorts.includes(d.cohort)) {
            cohorts.push(d.cohort)
          }
        })
        this.cohorts = cohorts.sort()
console.log('cohorts', this.cohorts, cohorts, this.selectedCohort)

        this.dataset = data
        this.filteredRows = this.dataset
        this.dateDomain = d3.extent(this.filteredRows, d => d.date)
        this.xDomain = d3.extent(this.dataset, d => d.xPos)
        this.yDomain = d3.extent(this.dataset, d => d.yPos)
console.log('dateDomain',this.dateDomain,this.filteredRows,this.xDomain,this.yDomain)        

        xf.add(this.dataset)

        this.cohortData = groupCohort.all()
      })
  },
  watch: {
    selectedCohort () {
      this.filterCohort(this.selectedCohort)
    }
  },
  computed: {
    currentIndDescription (d) {
console.log("currentInd", d, this)
      return "Individual = " + this.currentInd + ", Date = " + this.currentDate.toDateString()
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
    filterCohort (cohort) {
      if (this.selectedCohort !== cohort) {
        this.selectedCohort = cohort
      }
      dimCohort.filterExact(cohort)
      this.onFilter()
      this.dateDomain = d3.extent(this.filteredRows, d => d.date)
    },
    onFilter () {
      this.filteredRows = xf.allFiltered()
    },
    onIndSelected (d) {
      this.currentInd = d.tagIndex
      this.currentDate = d.date
console.log("onIndSelected", d, this.currentInd)      
    },
    onIndDeselected () {
      this.currentInd = undefined
    }


  }
}
</script>
