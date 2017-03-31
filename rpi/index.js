// var http = require('http');
var http = require('follow-redirects').http

const exec = require('child_process').exec

// let POOP_READ_PORT = 23

console.log('Starting...')

sendStatus()
setInterval(sendStatus, 5000)

function readPort (callback) {
  exec('gpio read 23', (err, stdout, stderr) => {
    if (err) {
      console.log(err)
      return err
    }
    return callback(stdout)
  })
}

function sendStatus () {
  readPort(function (status) {
    var path = '/dev/poop/free'
    if (status.trim() === '1') {
      path = '/dev/poop/busy'
    }
    http.get({
      hostname: '1r2pwixx9j.execute-api.us-east-1.amazonaws.com',
      port: 80,
      path: path
    }, (res) => {
    }).on('error', (e) => {
      //console.log('Got error: $(e.message')
    })
  })
};
