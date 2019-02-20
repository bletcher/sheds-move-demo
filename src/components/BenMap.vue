<template>
  <div >
    
  </div>
</template>

<script>
import * as d3 from 'd3'
//import '../libs/controlTransparency'
import 'leaflet/dist/leaflet.css'
//import evt from '../event-bus'
//require('leaflet-bing-layer')
export default {
  name: 'BenMap',
  props: [],
  data () {
    return {

    }
  },
  mounted () {
    console.log('test....................')
    this.map = L.map(this.$el, {
      ...this.options
    })
   
  },
  computed: {

  },
  methods: {

  }
}
</script>

<style>

</style>