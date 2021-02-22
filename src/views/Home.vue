<template>
  <div class="home">
    <Welcome msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
// import Welcome from '@/components/Welcome.vue'
const Welcome = () => import('@/components/Welcome')

export default {
  name: 'Home',
  components: {
    Welcome
  }
}
</script>
