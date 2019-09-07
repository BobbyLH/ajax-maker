import Request from '../src';

const rootDom = document.getElementById('app')
const reqBtn1 = document.createElement('button')
const reqBtn2 = document.createElement('button')
const reqBtn3 = document.createElement('button')

const style = 'width: 200px; height: 50px; display: block; margin: 10px';

reqBtn1.innerText = '请求 - 回调'
reqBtn1.onclick = req1
reqBtn1.style = style
rootDom.appendChild(reqBtn1)

reqBtn2.innerText = '请求 - Promise'
reqBtn2.onclick = req2
reqBtn2.style = style
rootDom.appendChild(reqBtn2)

reqBtn3.innerText = '请求 - 自定义链式'
reqBtn3.onclick = req3
reqBtn3.style = style
rootDom.appendChild(reqBtn3)

const { request } = new Request({
  codeMap: {
    login_code: '40100'
  }
});

function req1 () {
  const success = res => console.log('suc', 123, res)
  const fail = res => console.log('fail', 456, res)
  const error = res => console.log('error', 789, res)
  const login = res => console.log('login', 555, res)

  request({
    baseURL: 'http://172.16.49.244/api/login',
    data: {
      "token": "364a8e3a-ce25-11e9-ab1a-00163f00da8c"
    },
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    success,
    login,
    fail,
    error
  })
}

function req2 () {
  const success = res => console.log('suc', 123, res)
  const error = res => console.log('error', 789, res)

  request({
    baseURL: 'http://172.16.49.244/api/login',
    data: {
      "token": "364a8e3a-ce25-11e9-ab1a-00163f00da8c"
    },
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(success)
  .catch(error)
}

function req3 () {
  const success = res => console.log('suc', 123, res)
  const fail = res => console.log('fail', 456, res)
  const error = res => console.log('error', 789, res)
  const login = res => console.log('login', 555, res)

  request({
    baseURL: 'http://172.16.49.244/api/login',
    data: {
      "token": "364a8e3a-ce25-11e9-ab1a-00163f00da8c"
    },
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .success(success)
  .login(login)
  .fail(fail)
  .error(error)
}
