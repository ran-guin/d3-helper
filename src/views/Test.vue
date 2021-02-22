<template lang='pug'>
  v-container
    v-layout
      h3 Test Data Retrieval...
      v-row.justify-space-around
        div
          h3 Test Data Access:
          div(v-for='record in dataset')
            h3 {{record}}
            hr
        v-btn(@click='getData') Get Data
</template>

<script>

export default {
  name: 'Register',
  data () {
    return {
      dataset: [{name: 'Joe', id: 1}, {name: 'Jane', id: 2}]
    }
  },
  components: {
  },
  methods: {
    register: function () {
      console.log('Register ' + this.email)
    },
    getData: function () {
      console.log('retrieve data...') 
      this.dataset = [{name: 'Peter', id: 1}, {name: 'Paul', id: 2}]
      console.log('new dataset: ' + JSON.stringify(this.dataset))
    }
  }
}
</script>
