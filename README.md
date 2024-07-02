# Ajax Maker

[![NPM downloads](http://img.shields.io/npm/dm/ajax-maker.svg?style=flat-square)](https://www.npmjs.com/package/ajax-maker)
[![npm version](https://badge.fury.io/js/ajax-maker.svg)](https://badge.fury.io/js/ajax-maker)
[![install size](https://packagephobia.now.sh/badge?p=ajax-maker)](https://packagephobia.now.sh/result?p=ajax-maker)
[![license](http://img.shields.io/npm/l/ajax-maker.svg)](https://github.com/BobbyLH/ajax-maker/blob/master/LICENSE)

## API
```ts
  import Request from 'ajax-maker';
  import type { RawAxiosRequestHeaders, AxiosRequestHeaders, RawAxiosResponseHeaders, AxiosResponseHeaders } from 'axios';

  type AxiosReqHeaders = RawAxiosRequestHeaders | AxiosRequestHeaders;
  type AxiosResHeaders = RawAxiosResponseHeaders | AxiosResponseHeaders;
  type ParsedError<T extends string = string> = {
    name: T;
    message: string;
    stack: string;
  };

  interface InitConfig<T = any> {
    onSuccess?: (res: T, headers: AxiosResHeaders) => any;
    onFailure?: (res: T, headers: AxiosResHeaders) => any;
    onLogin?: (res: T, headers: AxiosResHeaders) => any;
    onError?: (res: ParsedError, headers: AxiosReqHeaders | AxiosResHeaders) => any;
    onTimeout?: (e: ParsedError<'timeout'>, headers: AxiosReqHeaders) => any;
    isSuccess?: (res: T, status: number, headers: AxiosResHeaders) => boolean;
    isLogin?: (res: T, status: number, headers: AxiosResHeaders) => boolean;
    timeout?: number;
    debug?: boolean;
    logLevel?: TlogLevelStr;
  }

  const onSuccess = res => console.log('init success', res);
  const onFailure = res => console.log('init failure', res);
  const onError = res => console.log('init error', res);
  const onLogin = res => console.log('init login', res);
  const onTimeout = res => console.log('init timeout', res);

  // initialize instance
  // axios is AxiosStatic
  const { request, setting, axios } = new Request({
    isSuccess: (res, status, headers) => res.code === 0,
    isLogin: (res, status, headers) => res.code === 50,
    onSuccess,
    onFailure,
    onError,
    onLogin,
    onTimeout
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
      onFailure(res => console.log(res)),
      onError: res => console.log(res),
      onLogin: err => console.error(err),
      onTimeout: err => console.error(err),
      isLogin: (res, status, headers) => status === 401
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
  .failure(res => console.log(res))
  .error(err => console.error(err))
  .timeout(err => console.error(err))

  // method 4 with rest api
  request(
    {
      baseUrl: `https://api.com/getMessage`,
      method: 'get',
      isSuccess: (res, status) => status === 200
    }
  )
  .success(res => console.log('success', res))
  .rest(res => console.log('rest', res));

  // method 5 rest with scope
  request(
    {
      baseUrl: `https://api.com/getMessage`,
      method: 'get',
      isSuccess: (res, status) => status === 200
    }
  )
  .success(res => console.log('success', res))
  .login(res => console.log('login', res))
  .timeout(err => console.error('timeout', err))
  .rest(res => console.log('rest', res), ['failure', 'error']);

  // dynamic setting
  setting({
    debug: false
  })

  // AxiosStatic
  const myInterceptor = axios.interceptors.request.use(function () {/*...*/});
```




