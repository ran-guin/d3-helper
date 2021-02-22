<template lang='pug'>
  //- div.home
  //-   img(src='/pi-druid.png' height='50px' style='padding-right: 2rem')
  //-   h2 DRUID: Dataset Remote Upload Interface for Databases

  div.home
    v-app-bar(
      app
      color="primary"
      dark)
      

      v-row.align-center(style='padding: 1rem')
        div(style='padding-left: 2rem')
          router-link(to='/')
            img(src='/pi-druid.png' height='50px' style='padding-right: 2rem')
            //- v-icon mdi-home
        div
          h3(style='padding-left: 2rem') DRUID: Dataset Remote Upload Interface for Databases
        //- span(style='padding-left: 2rem') C3 Interactive Data Visualization
        //- div#canvas
    hr
    v-container
      Welcome(msg="Welcome to Your Vue.js App")
  </div>
</template>

<script>
import Welcome from '@/../lib/Welcome.vue'

export default {
  name: 'Home',
  components: {
    Welcome,
  },
  data () {
    return {
    }
  },
  mounted: function () {
  }
}
</script>
