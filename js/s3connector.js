'use strict'

let S3 = require('aws-sdk/clients/s3')
let POOP_BUCKET = 'canigoyet.teespring.com'
let POOP_STATUS_FILE_NAME = 'state'
let POOP_LAST_UPDATED_FILE_NAME = 'last_updated'

module.exports.init = function () {
  S3 = new S3({
    apiVersion: '2012-08-10',
    signatureVersion: 'v4',
    region: 'us-east-1'
  })

  return this
}

module.exports.updatePoopStatusFileBusy = function () {
  return new Promise((resolve, reject) => {
    S3.putObject(updatePoopStatusParams('NO'), handlePromiseError(resolve, reject))
  })
}

module.exports.updatePoopStatusFileFree = function () {
  return new Promise((resolve, reject) => {
    S3.putObject(updatePoopStatusParams('YES'), handlePromiseError(resolve, reject))
  })
}

module.exports.updatePoopLastUpdatedFile = function (stateFile) {
  return new Promise((resolve, reject) => {
    S3.putObject(getUpdateParams(stateFile), handlePromiseError(resolve, reject))
  })
}

module.exports.getStateFiles = function (fileName) {
  return new Promise((resolve, reject) => {
    S3.getObject(generateGetObjectParams(fileName), handlePromiseError(resolve, reject))
  })
}

function updatePoopStatusParams (isFree) {
  return {
    Bucket: POOP_BUCKET,
    Key: POOP_STATUS_FILE_NAME,
    ACL: 'public-read',
    Body: JSON.stringify({state: isFree, UpdatedDate: new Date().toISOString()})
  }
}

function getUpdateParams (stateFile) {
  return {
    Bucket: POOP_BUCKET,
    Key: POOP_LAST_UPDATED_FILE_NAME,
    ACL: 'public-read',
    Body: JSON.stringify(stateFile)
  }
}

function generateGetObjectParams (fileName) {
  return {
    Bucket: POOP_BUCKET,
    Key: fileName
  }
}

function handlePromiseError (resolve, reject) {
  return (err, data) => {
    if (err) {
      reject(err)
    } else {
      resolve(data)
    }
  }
}
