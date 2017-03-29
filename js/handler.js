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
