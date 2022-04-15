import axios, { AxiosStatic, AxiosRequestConfig } from 'axios';
import { Logger } from 'peeler-js';
import genhandleRes, { ResObj, Config, Params } from './handleRes';

export type AnyObj = {
  [propName: string]: any;
};

export interface Options extends AxiosRequestConfig {
  success?: (res: ResObj) => any;
  fail?: (res: ResObj) => any;
  login?: (res: ResObj) => any;
  error?: (res: ErrorRes) => any;
}

export type FactoryType = 'success' | 'fail' | 'error' | 'login';

export type ErrorParams = {
  status: number;
  netWorkError: boolean;
  data: AnyObj;
};

export interface ErrorData extends AnyObj {
  status: number;
}

export type ErrorRes = {
  message: string;
  data: ErrorData;
};

export interface PromiseWrapper<T, TSuc = T, TFail = T, TLogin = T, TErr = T, D extends string = ''> {
  success: <TResult = T, Delete extends string = (D | 'success')>(cb: ((res: T) => TResult | PromiseLike<TResult>)) => Omit<PromiseWrapper<T, TResult, TFail, TLogin, TErr, Delete>, Delete> & Promise<TResult | TFail | TLogin | TErr>;
  fail: <TResult = T, Delete extends string = (D | 'fail')>(cb: ((res: T) => TResult | PromiseLike<TResult>)) => Omit<PromiseWrapper<T, TSuc, TResult, TLogin, TErr, Delete>, Delete> & Promise<TSuc | TResult | TLogin | TErr>;
  login: <TResult = T, Delete extends string = (D | 'login')>(cb: ((res: T) => TResult | PromiseLike<TResult>)) => Omit<PromiseWrapper<T, TSuc, TFail, TResult, TErr, Delete>, Delete> & Promise<TSuc | TFail | TResult | TErr>;
  error: <TResult = T, Delete extends string = (D | 'error')>(cb: ((err: T) => TResult | PromiseLike<TResult>)) => Omit<PromiseWrapper<T, TSuc, TFail, TLogin, TResult, Delete>, Delete> & Promise<TSuc | TFail | TLogin | TResult>;
}


export class Request {
  private _handleRes: (params: Params) => any;
  private _logger: Logger;
  private _config: Config;
  public axios: AxiosStatic;

  constructor (config?: Config) {
    const { debug = false, logLevel = 'warn' } = config || {};
    this._logger = new Logger({
      logPrefix: 'AJAX-MAKER',
      debug,
      logLevel
    });
    this._config = config || {};
    this._handleRes = genhandleRes(this._config);

    this.axios = axios;
    this.setting = this.setting.bind(this);
    this.request = this.request.bind(this);
  }

  private _handleError (params: ErrorParams): ErrorRes {
    const { status, netWorkError, data } = params;
  
    if (netWorkError) {
      return {
        message: 'Network exception, please try again later',
        data: {
          ...data,
          status
        }
      };
    } else if (status >= 500) {
      return {
        message: 'The server is not stable. Please try again later.',
        data: {
          ...data,
          status
        }
      };
    } else if (status) {
      return {
        message: 'The network is unstable. Please try again later.',
        data: {
          ...data,
          status
        }
      };
    } else {
      return {
        message: 'Client network connection abnormal, please try again',
        data: {
          ...data,
          status: -1
        }
      };
    }
  }

  private _constructPromise () {
    let promiseRes: any;
    let promiseRej: any;
    const promiseWrapper: any = new Promise((resolve, reject) => {
      promiseRes = resolve;
      promiseRej = reject;
    });

    const factory = (type: FactoryType, presetCb?: (res: ResObj | ErrorRes) => any) => {
      promiseWrapper[type] = function (cb: (res: ResObj | ErrorRes) => any) {
        this[`${type}_cb`] = cb;
        delete promiseWrapper[type];
        return promiseWrapper;
      };

      promiseWrapper[type] = promiseWrapper[type].bind(promiseWrapper);

      return (res: ResObj | ErrorRes) => {
        if (type === 'error' && !promiseWrapper[`${type}_cb`]) return promiseRej(res);

        return promiseRes(
          promiseWrapper[`${type}_cb`]
            ? promiseWrapper[`${type}_cb`](res)
            : presetCb
              ? presetCb(res)
              : res
        );
      };
    };

    const { defaultCallbacks } = this._config || {};
    const { success: presetSuccess, fail: presetFail, error: presetError, login: presetLogin } = defaultCallbacks || {};
    const callbacks = {
      success: factory('success', presetSuccess),
      fail: factory('fail', presetFail),
      error: factory('error', presetError),
      login: factory('login', presetLogin),
      thenable: (res: ResObj) => promiseRes(res)
    };

    return {
      promiseWrapper,
      callbacks
    };
  }

  public setting (config: Config) {
    if (!config) return this._logger.logWarn('setting method required correct parameters!');
    this._config = { ...this._config, ...config };
    this._handleRes = genhandleRes(this._config);
  }

  public request <T>(options: Options): PromiseWrapper<T, ResObj, ResObj, ResObj, ErrorRes> {
    options.withCredentials = typeof options.withCredentials === 'boolean' ? options.withCredentials : true;
    options.headers = options.headers || {};
    options.headers['Accept'] = '*/*';
    const { success, fail, login, error } = options;

    const {
      promiseWrapper,
      callbacks: cb
    } = this._constructPromise();

    this.axios(options).then(response => {
      const { status, data, request } = response;
      const url = request.responseURL;

      if (+status === 200) {
        return this._handleRes({
          res: data,
          success: res => {
            this._logger.logInfo(`Success - ${url}`);
            return success ? success(res) : cb.success(res);
          },
          fail: res => {
            this._logger.logWarn(`Failed - ${url}`);
            return fail ? fail(res) : cb.fail(res);
          },
          error: err => {
            const errRes = this._handleError({
              status,
              netWorkError: false,
              data: {
                options,
                res: err,
                stack: (err && err.stack) || '',
                message: (err && err.message) || ''
              }
            });
            return error ? error(errRes) : cb.error(errRes);
          },
          login: res => login ? login(res) : cb.login(res),
          thenable: cb.thenable
        });
      } else {
        return cb.error(this._handleError({
          status,
          netWorkError: false,
          data: {
            options
          }
        }));
      }
    }).catch(err => {
      this._logger.logErr(`Error - ${err}`);
      const errRes = this._handleError({
        status: err && +err.status === 200 ? 200 : 500,
        netWorkError: err.status >= 400 && err.status < 500,
        data: {
          options,
          err,
          stack: (err && err.stack) || '',
          message: (err && err.message) || ''
        }
      });

      return error ? error(errRes) : cb.error(errRes);
    });

    return promiseWrapper;
  }
}

export default Request;
