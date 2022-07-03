import axios, { AxiosStatic, AxiosRequestConfig } from 'axios';
import { Logger } from 'peeler-js';

import type { TlogLevelStr } from 'peeler-js/es/logger';

export interface ParseError {
  name: string;
  message: string;
  stack: string;
}

export interface InitConfig<T = any> {
  onSuccess?: (res: T) => any;
  onFail?: (res: T) => any;
  onLogin?: (res: T) => any;
  onError?: (res: ParseError) => any;
  isSuccess?: (res: T, status: number) => boolean;
  isLogin?: (res: T, status: number) => boolean;
  debug?: boolean;
  logLevel?: TlogLevelStr;
}

export interface Options<T> extends Omit<InitConfig<T>, 'debug' | 'logLevel'>, AxiosRequestConfig {}

export type FactoryType = 'success' | 'fail' | 'error' | 'login';

export type ErrorParams = {
  status: number;
  netWorkError: boolean;
  data: Record<string, any>;
};

export interface ErrorData extends Record<string, any> {
  status: number;
}

export type ErrorRes = {
  message: string;
  data: ErrorData;
};

export interface PromiseWrapper<T, TSuc = T, TFail = T, TLogin = T, TErr = ParseError, D extends string = ''> {
  success: <TResult, Delete extends string = (D | 'success')>(cb: (res: T) => TResult) => Omit<PromiseWrapper<T, TResult, TFail, TLogin, TErr, Delete>, 'fail' | 'error' | 'login' extends D ? Delete | 'rest' : Delete> & Promise<TResult | TFail | TLogin | TErr>;
  fail: <TResult, Delete extends string = (D | 'fail')>(cb: (res: T) => TResult) => Omit<PromiseWrapper<T, TSuc, TResult, TLogin, TErr, Delete>, 'success' | 'error' | 'login' extends D ? Delete | 'rest' : Delete> & Promise<TSuc | TResult | TLogin | TErr>;
  login: <TResult, Delete extends string = (D | 'login')>(cb: (res: T) => TResult) => Omit<PromiseWrapper<T, TSuc, TFail, TResult, TErr, Delete>, 'success' | 'fail' | 'error' extends D ? Delete | 'rest' : Delete> & Promise<TSuc | TFail | TResult | TErr>;
  error: <TResult, Delete extends string = (D | 'error')>(cb: (res: ParseError) => TResult) => Omit<PromiseWrapper<T, TSuc, TFail, TLogin, TResult, Delete>, 'success' | 'fail' | 'login' extends D ? Delete | 'rest' : Delete> & Promise<TSuc | TFail | TLogin | TResult>;
  rest: <TResult>(cb: (res: 'error' extends D ? T : T | ParseError ) => TResult) => Promise<
  'success' | 'fail' | 'error' | 'login' extends D
    ? TSuc | TFail | TErr | TLogin | TResult
    : 'fail' | 'error' | 'login' extends D
    ? TFail | TErr | TLogin | TResult
    : 'success' | 'error' | 'login' extends D
    ? TSuc | TErr | TLogin | TResult
    : 'success' | 'fail' | 'login' extends D
    ? TSuc | TFail | TLogin | TResult
    : 'success' | 'fail' | 'error' extends D
    ? TSuc | TFail | TErr | TResult
    : 'success' | 'fail' extends D
    ? TSuc | TFail | TResult
    : 'success' | 'error' extends D
    ? TSuc | TErr | TResult
    : 'success' | 'login' extends D
    ? TSuc | TLogin | TResult
    : 'fail' | 'error' extends D
    ? TFail | TErr | TResult
    : 'fail' | 'login' extends D
    ? TFail | TLogin | TResult
    : 'error' | 'login' extends D
    ? TErr | TLogin | TResult
    : 'success' extends D
    ? TSuc | TResult
    : 'fail' extends D
    ? TFail | TResult
    : 'error' extends D
    ? TErr | TResult
    : 'login' extends D
    ? TLogin | TResult
    : TResult
  >;
}


export class Request {
  private _logger: Logger;
  private _config: InitConfig;

  public axios: AxiosStatic;

  constructor (config?: InitConfig) {
    const { debug = false, logLevel = 'warn' } = config || {};
    this._logger = new Logger({
      logPrefix: 'AJAX-MAKER',
      debug,
      logLevel
    });
    this._config = config || {};

    this.axios = axios;
    this.setting = this.setting.bind(this);
    this.request = this.request.bind(this);
  }

  private parseError(err: any) {
    if (typeof err === 'string') err = new Error(err);
    const name: string = err?.name ?? '';
    const message: string =
      err?.message ?? err?.toString?.() ?? err ?? '';
    const stack: string = err?.stack ?? '';
    return {
      name,
      message,
      stack
    };
  }

  private _constructPromise<T> () {
    let promiseRes: any;
    let promiseRej: any;
    const promiseWrapper: PromiseWrapper<T> & Promise<T> = new Promise<T>((resolve, reject) => {
      promiseRes = resolve;
      promiseRej = reject;
    }) as any;

    const callbacks = {
      success: void 0 as any,
      fail: void 0 as any,
      error: void 0 as any,
      login: void 0 as any,
      rest: void 0 as any
    } as {
      success?: Parameters<PromiseWrapper<T>['success']>[0];
      fail?: Parameters<PromiseWrapper<T>['fail']>[0];
      login?: Parameters<PromiseWrapper<T>['login']>[0];
      error?: Parameters<PromiseWrapper<T>['error']>[0];
      rest?: Parameters<PromiseWrapper<T>['rest']>[0];
    };

    promiseWrapper.success = onSuccess => {
      callbacks.success = onSuccess;
      const wrapper = promiseWrapper as any;
      delete wrapper.success;
      if (!wrapper.fail && !wrapper.error && !wrapper.login) {
        delete wrapper.rest;
      }
      return wrapper;
    };

    promiseWrapper.fail = onFail => {
      callbacks.fail = onFail;
      const wrapper = promiseWrapper as any;
      delete wrapper.fail;
      if (!wrapper.success && !wrapper.error && !wrapper.login) {
        delete wrapper.rest;
      }
      return wrapper;
    };

    promiseWrapper.error = onError => {
      callbacks.error = onError;
      const wrapper = promiseWrapper as any;
      delete wrapper.error;
      if (!wrapper.success && !wrapper.fail && !wrapper.login) {
        delete wrapper.rest;
      }
      return wrapper;
    };

    promiseWrapper.login = onLogin => {
      callbacks.login = onLogin;
      const wrapper = promiseWrapper as any;
      delete wrapper.login;
      if (!wrapper.success && !wrapper.fail && !wrapper.error) {
        delete wrapper.rest;
      }
      return wrapper;
    };

    promiseWrapper.rest = onRest => {
      callbacks.rest = onRest;
      const wrapper = promiseWrapper as any;
      delete wrapper.rest;
      if (wrapper.success) delete wrapper.success;
      if (wrapper.fail) delete wrapper.fail;
      if (wrapper.error) delete wrapper.error;
      if (wrapper.login) delete wrapper.login;
      return wrapper;
    };

    return {
      promiseWrapper,
      promiseRes,
      promiseRej,
      callbacks
    };
  }

  public setting (config: InitConfig) {
    if (!config) return this._logger.logWarn('setting method required correct parameters!');
    this._config = { ...this._config, ...config };
  }

  public request <T>(options: Options<T>): PromiseWrapper<T> & Promise<T | ParseError> {
    options.withCredentials = typeof options.withCredentials === 'boolean' ? options.withCredentials : true;
    options.headers = options.headers || {};
    options.headers['Accept'] = options.headers['Accept'] || '*/*';
    const {
      onSuccess: initSuccess,
      onFail: initFail,
      onLogin: initLogin,
      onError: initError,
      isSuccess: initIsSuccess,
      isLogin: initIsLogin,
    } = this._config;
    const { onSuccess, onFail, onLogin, onError, isSuccess, isLogin } = options;

    const {
      promiseWrapper,
      promiseRes,
      promiseRej,
      callbacks: cb
    } = this._constructPromise<T>();

    this.axios(options).then(async response => {
      try {
        const { status, data } = response;

        const callbacks = {
          success: cb.success ?? cb.rest ?? onSuccess ?? initSuccess ?? ((v: T) => v),
          fail: cb.fail ?? cb.rest ?? onFail ?? initFail ?? ((v: T) => v),
          login: cb.login ?? cb.rest ?? onLogin ?? initLogin ?? ((v: T) => v),
        };

        const rules = {
          success: isSuccess ?? initIsSuccess,
          login: isLogin ?? initIsLogin,
        };
  
        const doSuccess = rules.success?.(data, status);
        const doLogin = rules.login?.(data, status);
  
        let res = data;
        if (doLogin) {
          res = await Promise.resolve(callbacks.login(res));
        } else if (doSuccess) {
          res = await Promise.resolve(callbacks.success(res));
        } else {
          res = await Promise.resolve(callbacks.fail(res));
        }
        
        promiseRes(res);
      } catch (e) {
        promiseRej(this.parseError(e));
      }
    }).catch(async err => {
      this._logger.logErr(`Error - ${err}`);
      try {
        const handleErr = cb.error ?? cb.rest ?? onError ?? initError ?? ((e: ParseError) => e);
        err = await Promise.resolve(handleErr(this.parseError(err)));
        const hasHandler = !!(cb.error || cb.rest || onError || initError);
        hasHandler ? promiseRes(err) : promiseRej(err);
      } catch (e) {
        promiseRej(this.parseError(e));
      }
    });

    return promiseWrapper;
  }
}

export default Request;
