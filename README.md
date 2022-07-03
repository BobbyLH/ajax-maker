# Ajax Maker

[![NPM downloads](http://img.shields.io/npm/dm/ajax-maker.svg?style=flat-square)](https://www.npmjs.com/package/ajax-maker)
[![npm version](https://badge.fury.io/js/ajax-maker.svg)](https://badge.fury.io/js/ajax-maker)
[![install size](https://packagephobia.now.sh/badge?p=ajax-maker)](https://packagephobia.now.sh/result?p=ajax-maker)
[![license](http://img.shields.io/npm/l/ajax-maker.svg)](https://github.com/BobbyLH/ajax-maker/blob/master/LICENSE)

## API
```ts
  import Request from 'ajax-maker';

  interface InitConfig<T = any> {
    onSuccess?: (res: T) => any;
    onFail?: (res: T) => any;
    onLogin?: (res: T) => any;
    onError?: (res: ParseError) => any;
    isSuccess?: (res: T, status: number) => boolean;
    isLogin?: (res: T, status: number) => boolean;
    debug?: boolean;
    logLevel?: TlogLevelStr;
  }

  const onSuccess = res => console.log('init success', res);
  const onFail = res => console.log('init fail', res);
  const onError = res => console.log('init error', res);
  const onLogin = res => console.log('init login', res);

  // initialize instance
  // axios is AxiosStatic
  const { request, setting, axios } = new Request({
    isSuccess: (res, status) => res.code === 0,
    isLogin: (res, status) => res.code === 50,
    onSuccess,
    onFail,
    onError,
    onLogin
  });

  // method 1 with init callbacks
  request(
    {
      url: `https://api.com/getMessage`,
      method: 'get'
    }
  )
  .then(res => console.log(res))
  .catch(err => console.error(err))

  // method 2 with custom callbacks
  request(
    {
      baseUrl: `https://api.com/getMessage`,
      method: 'get',
      onSuccess: res => console.log(res),
      onFail(res => console.log(res)),
      onError: res => console.log(res),
      onLogin: err => console.error(err),
      isLogin: (res, status) => status === 401
    }
  )

  // method 3 with chain callbacks
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

  // method 4 with rest api
  request(
    {
      baseUrl: `https://api.com/getMessage`,
      method: 'get',
      isSuccess: (res, status) => status === 200
    }
  )
  .success(res => console.log('success', res))
  .rest(res => console.log('rest', res))

  // dynamic setting
  setting({
    debug: false
  })

  // AxiosStatic
  const myInterceptor = axios.interceptors.request.use(function () {/*...*/});
```




