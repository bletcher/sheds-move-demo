<template>
<div id="tooltipPositioner">
  <div id="tooltip">
    <div id="tooltipContainer">
      <div class="description">{{description}}</div>
    </div>
  </div>
</div>
</template>

<script>
  module.exports = {
    name: 'tooltip',
    props: ['description']
  }
</script>

<style scoped>
#tooltipPositioner {
  position: relative;
  top: 5px;
  left: 45px;
  
}
#tooltipContainer {
  position: relative;
  font-size: 12px;
  line-height: 16px;
  padding: 5px;
  border-radius: 3px;
  background: rgba(255,255,255,0.9);
  color: #000;
  box-shadow: 0 1px 2px rgba(0,0,0,0.4);
  -moz-box-shadow: 0 1px 5px rgba(0,0,0,0.4);
  border:1px solid rgba(200,200,200,0.85);
  text-align:center;
}
#tooltip {
  text-align:center;
  z-index: 1000;
  position: absolute;
  display: block;
}
#tooltip .description {
  color:#666;
  font-size: 11px;
  text-align: center;
}

</style>