# Ajax Maker

[![NPM downloads](http://img.shields.io/npm/dm/ajax-maker.svg?style=flat-square)](https://www.npmjs.com/package/ajax-maker)
[![npm version](https://badge.fury.io/js/ajax-maker.svg)](https://badge.fury.io/js/ajax-maker)
[![install size](https://packagephobia.now.sh/badge?p=ajax-maker)](https://packagephobia.now.sh/result?p=ajax-maker)
[![license](http://img.shields.io/npm/l/ajax-maker.svg)](https://github.com/BobbyLH/ajax-maker/blob/master/LICENSE)

## API
```ts
  import Request from 'ajax-maker';

  type CodeMap = {
    suc_code?: string | number | boolean;
    err_code?: string | number;
    login_code?: string | number;
  };

  type DefaultCallbacks = (res: ResObj) => any;

  interface Config {
    codeMap?: CodeMap;
    codeField?: string;
    debug?: boolean;
    logLevel?: "error" | "warn" | "detail" | "info" | "silent";
    defaultCallbacks?: {
      success?: DefaultCallbacks;
      fail?: DefaultCallbacks;
      error?: DefaultCallbacks;
      login?: DefaultCallbacks;
    };
  }

  const config: Config = {
    codeMap: {
      suc_code: 200,
      err_code: -1,
      login_code: '40100'
    },
    codeField: 'code',
  }

  // initialize instance
  // axios is AxiosStatic
  const { request, setting, axios } = new Request(config)

  // method 1
  request(
    {
      url: `https://api.com/getMessage`,
      method: 'get'
    }
  )
  .then(res => console.log(res))
  .catch(err => console.error(err))

  // method 2
  request(
    {
      baseUrl: `https://api.com/getMessage`,
      method: 'get',
      success: res => console.log(res),
      login(res => console.log(res)),
      fail: res => console.log(res),
      error: err => console.error(err)
    }
  )

  // method 3
  request(
    {
      baseUrl: `https://api.com/getMessage`,
      method: 'get'
    }
  )
  .success(res => console.log(res))
  .login(res => console.log(res))
  .fail(res => console.log(res))
  .error(err => console.error(err))


  // dynamic setting
  setting({
    codeMap: {
      suc_code: 500;
    },
    codeField: 'ret'
  })

  // AxiosStatic
  const myInterceptor = axios.interceptors.request.use(function () {/*...*/});
```

**Note**: If the `codeField` doesn't existence, you can get result in `then` method.
```typescript
  const config = {
    codeMap: {
      suc_code: 200,
      err_code: -1,
      login_code: '40100'
    },
    codeField: 'non-existent-code'
  }

  const { request } = new Request(config);

  request(
    {
      url: `https://api.com/getMessage`,
      method: 'get'
    }
  )
  .then(res => console.log('get result in then', res))
```



