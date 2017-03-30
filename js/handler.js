'use strict'

let s3connector = require('./s3connector').init()

module.exports.pooperBusy = (event, context, callback) => {
  s3connector.updatePoopStatusFileBusy()
  .then(function () {
    handleCallback(true, callback)
  }).catch(function (err) {
    handleCallback(false, callback, err)
  })
}

module.exports.pooperFree = (event, context, callback) => {
  s3connector.updatePoopStatusFileFree()
    .then(function () {
      handleCallback(true, callback)
    }).catch(function (err) {
      handleCallback(false, callback, err)
    })
}

module.exports.pooperLastUpdated = (event, context, callback) => {
  let promises = []
  promises.push(s3connector.getStateFiles('state.json'))
  promises.push(s3connector.getStateFiles('last_updated'))
  Promise.all(promises).then(function (data) {
    let currentStateObject = JSON.parse(String.fromCharCode.apply(null, data[0].Body))
    let lastUpdatedObject = JSON.parse(String.fromCharCode.apply(null, data[1].Body))
    if (currentStateObject.state != lastUpdatedObject.state) {
      return s3connector.updatePoopLastUpdatedFile(currentStateObject)
    } else {
      return Promise.resolve()
    }
  }).then(function () {
      handleCallback(true, callback)
  }).catch(function (err) {
      handleCallback(false, callback, err)
  })
}

function handleCallback (isSuccessful, callbackFunction, err) {
  let callbackObject = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Success!'
    })
  }

  if (!isSuccessful) {
    callbackObject.statusCode = 500
    callbackObject.body = JSON.stringify({
      message: 'SOMETHING IS BROKEN',
      error: err
    })
  }

  callbackFunction(null, callbackObject)
}
