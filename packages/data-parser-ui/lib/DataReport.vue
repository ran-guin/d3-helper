<template lang='pug'>
  div
    v-container
      h2.heading Data Report
      hr
      v-container
        v-card
          v-card-title
            h3.heading {{title}}
          v-card-text
            div(v-if='Hashes && Hashes.length')
            h4 Records: {{Hashes.length}}

</template>

<script>

  export default {
    name: 'DataReport',
    data () {
      return {
        title: 'Data Report'
      }
    },
    props: {
    },
    created () {
      console.log('load Reporting Page')
    },
    mounted () {
    },
    computed: {
      Hashes: function () {
        return this.$store.state.hash.hashes
      }
    }
  }
</script>
