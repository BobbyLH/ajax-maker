const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
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

app.use(require('body-parser').urlencoded({ extended: false }))

app.use(bodyParser.json())

app.post('/api', function (req, res, next) {
  console.info(req.path, '请求');
  res.status = 200;
  res.send({
    data: {
      token: req.body.token,
      name: '请求demo',
      time: Date.now()
    },
    code: +req.body.code
  });
  res.end()
})

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
