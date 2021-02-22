/** Generic cashing functionality for store

Standard getters:
  active_id
  status(key)
  getHash(key)

Standard actions:

  activate(id)
  status('page', 'loaded')
  setHash('patient', {name: 'John', id: 123})

**/

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    active_id: null,
    status: { 'default': null },
    hash: {},
    hash_fields: {},
    hash_map: {},
    hash_defaults: {},
    updates: 1   
  },
  getters: {
    active_id: state => {
      return state.active_id
    },
    getList: state => key => {
      if (!key) { key = 'default' }
      return state.hash[key]
    },
    status: state => key => {
      if (key === 'all') {
        return state.status
      } else if (key) {
        return state.status[key]
      } else { return state.status['default'] }
    },
    updates: state => {
      console.log('reload updates')
      return state.updates
    },
    getHash: state => key => {
      console.log(' Get cached ' + key + ': ' + JSON.stringify(state.hash[key]))
      console.log('updates: ' + JSON.stringify(state.updates)) // this log message triggers update (required !)
      if (key) {
        return state.hash[key]
      } else { return state.hash }
    }    
  },
  mutations: {
    append (state, options) {
      if (!options) { options = {} }
      var key = options.key || ''
      var item = options.key || null
      Vue.set(state.hash, key, item)
    },
    activate_id (state, id) {
      console.log('activate ' + id)
      state.active_id = id
    },
    setStatus (state, key) {
      if (key.constructor === Object) {
        var keys = Object.keys(key)
        for (var i = 0; i < keys.length; i++) {
          state.status[keys[i]] = key[keys[i]]
        }
      } else {
        state.status['default'] = key
      }
    },
    clearHash (state, key) {
      // define custom hash - typically called from created section of primary component
      if (key) {
        delete state.hash[key]
        console.log('cleared ' + key + ' key in hash')
      } else {
        state.hash = {}
        console.log('cleared hash')
      }
    },
    setHash (state, options) {
      // define custom hash - typically called from created section of primary component
      if (!options) { options = {} }
      var key = options.key
      var value = options.value
      var fields = options.fields
      var defaults = options.defaults
      var map = options.map
  
      if (key && fields && fields.length) {
        // console.log('set cached ' + key + ' to: ' + JSON.stringify(value))
        state.hash_fields[key] = fields
        for (var i = 0; i < fields.length; i++) {
          Vue.set(state.hash_fields[key], i, fields[i])
          console.log('set ' + i + ' to ' + fields[i])
        }
        if (defaults) {
          state.hash_defaults[key] = defaults
        }
  
        if (map) {
          state.hash_map[key] = map
        }
      } else if (key) {
        if (!value) { console.log(key + ' value cleared in hash ') }
        // else { console.log('set cached ' + key + ' to: ' + JSON.stringify(value)) }
        Vue.set(state.hash, key, value)
      } else {
        state.hash = options
        console.log('hash defined in entirety without key')
      }
      state.updates = state.updates + 1
    },
    pushHash (state, data) {
      var key = data.key
      var record = data.record
  
      if (key && record) {
        if (!state.hash[key]) { state.hash[key] = [] }
  
        console.log(' add record to ' + key)
        console.log('+ ' + JSON.stringify(record))
  
        var length = state.hash[key].length
  
        Vue.set(state.hash[key], length, record)
        console.log(JSON.stringify(state.hash[key]))
        state.updates = state.updates + 1
      } else {
        console.log('incorrect input data (require key and record')
        return null
      }
    },
    removeHashItem (state, options) {
      var key = options.key
      var index = options.index
  
      console.log('remove item ' + index + ' from ' + key)
      console.log('was: ' + JSON.stringify(state.hash[key]))
  
      // state.hash[key].splice(index, 1)
      Vue.delete(state.hash[key], index)
      state.updates++ // required to force re-rendering
  
      // Vue.set(state.hash[key], null)
      console.log('result: ' + JSON.stringify(state.hash[key]))
    },
    squeezeHash (state, data) {
      // similar to setHash, but only includes keys based on pre-defined fields for this hash element
      console.log('squeeze')
      console.log(JSON.stringify(data))
      var key = data.key
      var record = data.record
  
      if (key && record) {
        console.log('adding ' + key)
        var fields = state.hash_fields[key] || Object.keys(record)
        var defaults = state.hash_defaults[key] || {}
  
        console.log('f: ' + fields)
        if (fields) {
          var map = state.hash_map[key]
          if (!state.hash[key]) { state.hash[key] = [] }
  
          var newRecord = {}
          var info = 0
          console.log('add fields: ' + fields.join(','))
          for (var i = 0; i < fields.length; i++) {
            var field = fields[i]
  
            if (record[field]) {
              newRecord[field] = record[field]
              info++
            } else if (map && map[field] && record[map[field]]) {
              console.log('mapped ' + field + ' to ' + map[field])
              newRecord[field] = record[map[field]]
              info++
            } else if (defaults && defaults[field]) {
              newRecord[field] = defaults[field]
            }
          }
          console.log('info...')
          if (info) {
            console.log(' add record to ' + key)
            console.log('+ ' + JSON.stringify(newRecord))
  
            var array = state.hash[key]
            array.push(newRecord)
            Vue.set(state.hash, key, array)
  
            state.updates++ // required to force re-rendering
            // var length = state.hash[key].length
            // Vue.set(state.hash[key], length, newRecord)
  
            // state.hash[key].push(newRecord)
            console.log(JSON.stringify(state.hash[key]))
          } else {
            console.log('no data to add')
          }
        } else {
          console.log('field list not supplied... ')
        }
      } else {
        console.log('incorrect input data (require key and record and defined hash_fields)')
        return null
      }
    }   
  },
  actions: {
    append (state, options) {
      if (!options) { options = {} }
  
      var key = ''
      var item = null
  
      if (options.constructor !== Object) {
        key = 'default'
        item = options
      } else {
        key = options.key || 'default'
        item = options.item || null
      }
      state.commit('append', {key: key, item: item})
    },
    activate (state, id) {
      state.commit('activate_id', id)
    },
    status (state, key) {
      state.commit('setStatus', key)
    },
    setHash (state, options) {
      state.commit('setHash', options)
    },
    clearHash (state, key) {
      state.commit('clearHash', key)
    },
    deleteHashItem (state, options) {
      var key = options.key
      var index = options.index
  
      console.log('Remove item ' + index + ' from ' + key)
      state.commit('removeHashItem', {key: key, index: index})
    }
  }
})