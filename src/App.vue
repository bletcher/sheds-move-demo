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
            <move-map 
              :dataset="filteredRows" 
              :widthSVG="550" 
              :heightSVG="400" 
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
              @onEmptySelectedInds="onEmptySelectedInds">
            </move-map>
            <move-slider :domain="this.dateDomain" 
              @brushed="filterDate"></move-slider>
            <p></p>
            <v-divider light></v-divider>
            <p># Filtered Rows: {{filteredRows.length}} of {{ dataset.length }}</p> 
            <p># Selected Individual(s): {{ selectedInds }}</p> 
             
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
                  grid-list-lg
                >
                  <v-layout row wrap>


                    <v-flex xs12>
                      <v-card color="blue-grey darken-1" class="white--text">
                        <v-card-title primary-title>
                          <div class="headline">Group</div>

                          <v-container fluid>
                            <v-radio-group v-model="radiosGroup" :mandatory="true">
                              <v-radio label="Individual" value="radio-group-individual"></v-radio>
                              <v-radio label="Season" value="radio-group-season"></v-radio>
                            </v-radio-group>
                          </v-container>

                        </v-card-title>

                      </v-card>
                    </v-flex>


                    <v-flex xs12>
                      <v-card color="blue-grey darken-2" class="white--text">
                        <v-card-title primary-title>
                          <div class="headline">Filter</div>
                          <move-histogram :width="175" :height="175" :data="cohortData" @click="filterCohort"></move-histogram>
                        </v-card-title>

                      </v-card>
                    </v-flex>


                    <v-flex xs12>
                      <v-card color="blue-grey darken-2" class="white--text">
                        <v-card-title primary-title>
                          <div class="headline">Select</div>

                          <v-container fluid>
                            <v-radio-group v-model="radiosSelect" :mandatory="true">
                              <v-radio label="Individual" value="radio-select-individual"></v-radio>
                              <v-radio label="Area" value="radio-select-area"></v-radio>
                            </v-radio-group>
                          </v-container>

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
      bodySizeDomain: [],
      margin: {top: 50, right: 50, bottom: 50, left: 50},
      selectedInds: [],
      uniqueTags: [],
      currentInd: null,
      currentDate: null,
      currentSeason: null,
      numInd: null,
      seasonCheckbox: false,
      radiosGroup: 'radio-group-individual',
      radiosSelect: 'radio-select-individual'
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
            bodySize: +d.bodySize,
            cohort: d.cohort
          }))
 //         .splice(0, 1000)

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
      })
  },
  watch: {
    selectedCohort () {
      this.filterCohort(this.selectedCohort)
    }

  },
  computed: {
    currentIndDescription () {
      return "Individual: " + this.currentInd + ", Date: " + this.currentDate.toDateString() + ", Season: "+ this.currentSeason 
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
    onIndHovered (d) {
      this.currentInd = d.tagIndex
      this.currentDate = d.date 
      this.currentSeason = d.season    
    },
    onIndUnhovered () {
      this.currentInd = undefined
    },
    onEmptySelectedInds (d) {
      this.selectedInds = d
      //https://codepen.io/Kradek/pen/ZKKGNJ?editors=1010
    }


  }
}
</script>
