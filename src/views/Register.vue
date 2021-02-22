<template lang='pug'>
  v-container
    v-layout
      v-row.justify-space-around
        div.login
          h3 Registration:
          v-text-field(v-model='email' placeholder='email' label='Email')
          v-text-field(v-model='password' type='password' placeholder='' label='Pwd')
          v-btn.v-btn-primary(@click='register') Register

</template>

<script>

export default {
  name: 'Register',
  data () {
    return {
      email: '',
      password: 'password'
    }
  },
  components: {
  },
  methods: {
    register: function () {
      console.log('Register ' + this.email)
    }
  }
}
</script>
