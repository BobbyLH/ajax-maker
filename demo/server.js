const path = require('path')
const express = require('express')
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const config = require('./config')
const compiler = webpack(config)
const app = express()
const { exec } = require('child_process')

app.use(middleware(compiler, {
  publicPath: '/',
  logLevel: 'debug'
}))

app.use('*', function (req, res, next) {
  var filename = path.join(compiler.outputPath, 'index.html')
  compiler.outputFileSystem.readFile(filename, function (err, result) {
    if (err) {
      return next(err)
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.listen(6201, () => {
  const url = 'http://localhost:6201/';
  switch(process.platform) {
    case 'darwin':
      exec(`open ${url}`)
      break
    case 'win32':
      exec(`start ${url}`)
      break
   }
  console.log(`server start at: ${url}`)
})
