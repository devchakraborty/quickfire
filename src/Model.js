import co from 'co'
import firebase from 'firebase'
import natural from 'natural'
import uuid from 'uuid'
import _ from 'lodash'
import changeCase from 'change-case'

let database = firebase.database()

export default class Model {
  constructor(attrs={}) {
    let model = this
    if (model.constructor == Model) {
      throw new Error('Cannot instantiate Model')
    }
    this._attrs = attrs
  }

  val() {
    return this._attrs
  }

  get id() {
    return this._attrs.id
  }

  static nameSingular() {
    let model = this
    return changeCase.snakeCase(changeCase.noCase(model.name.toLowerCase()))
  }

  static namePlural() {
    let model = this
    if (model._namePlural != null) return model._namePlural
    return (model._namePlural = (new natural.NounInflector().pluralize(model.nameSingular())))
  }

  static count() {
    let model = this
    return co(function* () {
      let countRef = database.ref(`${model.namePlural()}/_count`)
      let countSnapshot = yield countRef.once('value')
      let count = countSnapshot.val()
      if (count == null) {
        let objectsRef = database.ref(`${model.namePlural()}`)
        let objectsSnapshot = yield objectsRef.once('value')
        let updatedCount = objectsSnapshot.numChildren()
        countRef.set(updatedCount) // optimistic
        return updatedCount
      }
      return count
    })
  }

  static create(attrs={}) {
    let model = this
    return co(function*() {
      let objectId = attrs.id || uuid.v4()
      let objectsRef = database.ref(`${model.namePlural()}`)
      let objectValues = _.assign(attrs, {
        id: objectId,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      })

      yield objectsRef.transaction((current) => {
        if (current == null) current = {}
        if (current._count == null) {
          current._count = 1
        } else {
          current._count += 1
        }
        if (current._ids == null) {
          current._ids = {}
        }
        current._ids[objectId] = true
        current[objectId] = objectValues
        return current
      })

      return yield model.find(objectId)
    })
  }

  static find(id) {
    let model = this
    return co(function*() {
      let attrsSnapshot = yield database.ref(`${model.namePlural()}/${id}`).once('value')
      let attrs = attrsSnapshot.val()
      if (attrs == null) return null
      return new model(attrs)
    })
  }

  update(attrs={}) {
    let model = this.constructor
    let self = this
    return co(function*() {
      var values = _.omit(attrs, 'id', 'createdAt', 'updatedAt')
      _.assign(values, {
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      })
      let objectRef = database.ref(`${model.namePlural()}/${self.id}`)
      yield objectRef.transaction((current) => {
        return _.assign(current, values)
      })
      return yield model.find(self.id)
    })
  }

  set(attrs={}) {
    let model = this.constructor
    let self = this
    return co(function*() {
      let keys = Object.keys(attrs)
      keys.push('id', 'createdAt', 'updatedAt')
      let objectRef = database.ref(`${model.namePlural()}/${self.id}`)
      yield objectRef.transaction((current) => {
        return _.assign({}, _.pick(current, keys), _.omit(attrs, 'id', 'createdAt', 'updatedAt'), {updatedAt: firebase.database.ServerValue.TIMESTAMP})
      })
      return yield model.find(self.id)
    })
  }

  destroy() {
    let model = this.constructor
    let self = this
    return co(function*() {
      let objectsRef = database.ref(model.namePlural())
      yield objectsRef.transaction((current) => {
        if (current == null) current = {}
        if (current[self.id]) {
          current._count -= 1
          current._ids[self.id] = null
          current[self.id] = null
        }
        return current
      })
      return
    })
  }

  static allIds() {
    let model = this
    return co(function*() {
      let keysRef = database.ref(`${model.namePlural()}/_ids`)
      let keysSnapshot = yield keysRef.once('value')
      let keysRoot = keysSnapshot.val() || {}
      return Object.keys(keysRoot)
    })
  }

  static select(filter=_.stubTrue) {
    let model = this
    return co(function*() {
      let keys = yield model.allIds()
      let objects = keys.map(key => model.find(key))
      return _.filter(yield objects, object => filter(object.val()))
    })
  }

  static all() {
    let model = this
    return model.select()
  }

  static sample(num, filter=_.stubTrue) {
    let model = this
    return co(function*() {
      let objects = yield model.select(filter)
      let result = _.sampleSize(objects, num || 1)
      if (!num) return _.first(result)
      return result
    })
  }
}
