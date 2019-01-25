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
          <v-flex xs6>
            <move-map :dataset="filteredRows" :width="550" :height="200" :domain="xDomain"></move-map>
            <move-slider :domain="this.dateDomain" @brushed="filterDate"></move-slider>
          </v-flex>
          <v-flex xs6>
            <p># Filtered Rows: {{filteredRows.length}} of {{ dataset.length }}</p>
            <v-select
              :items="cohorts"
              label="Cohort"
              v-model="selectedCohort">
            </v-select>
            <move-histogram :width="500" :height="250" :data="cohortData" @click="filterCohort"></move-histogram>
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
const groupDate = dimCohort.group()

import MoveMap from './components/MoveMap.vue'
import MoveSlider from './components/MoveSlider.vue'
import MoveHistogram from './components/MoveHistogram.vue'

export default {
  name: 'App',
  components: {
    MoveMap,
    MoveSlider,
    MoveHistogram
  },
  data () {
    return {
      dataset: [],
      filteredRows: [],
      cohorts: [],
      selectedCohort: null,
      dateDomain: [new Date(2000, 0, 1), new Date(2002, 11, 31)],
      xDomain: [0, 1],
      cohortData: []
    }
  },
  mounted () {
    axios.get('http://localhost:8081/data/pitdata.csv')
      .then((response) => {
        const dataString = response.data
        const data = d3.csvParse(dataString)
          .filter(d => d.river === 'WB')
          .map(d => ({
            date: new Date(d.date),
            tag: d.tag,
            section: +d.section,
            cohort: d.cohort,
            y: Math.random()
          }))
          .splice(0, 1000)

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
        this.xDomain = d3.extent(this.dataset, d => d.section)

        xf.add(this.dataset)

        this.cohortData = groupCohort.all()
      })
  },
  watch: {
    selectedCohort () {
      this.filterCohort(this.selectedCohort)
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
    }
  }
}
</script>
