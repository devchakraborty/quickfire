import co from 'co'
import firebase from 'firebase'
import natural from 'natural'
import uuid from 'node-uuid'
import _ from 'lodash'

['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_DATABASE_URL', 'FIREBASE_STORAGE_BUCKET'].forEach((key) => {
  if (process.env[key] == null) {
    throw new Error(`Missing env var ${key}.`)
  }
})

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
})

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
    return model.name.toLowerCase()
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

  destroy() {
    let model = this.constructor
    let self = this
    return co(function*() {
      let objectsRef = database.ref(`${model.namePlural()}`)
      console.log(yield objectsRef.once('value'))
      yield objectsRef.transaction((current) => {
        if (current[self.id]) {
          current._count -= 1
          current[self.id] = null
        }
        return current
      })
      return
    })
  }
}
