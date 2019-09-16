import axios, { AxiosStatic, AxiosRequestConfig } from 'axios';
import { Logger } from 'peeler-js';
import genhandleRes, { Res, Config, Params } from './handleRes';

const logger = new Logger({
  logPrefix: 'Ajax-Maker',
  debug: true,
  logLevel: 'info'
});

type AnyObj = {
  [propName: string]: any;
};

export interface Options extends AxiosRequestConfig {
  success?: (res: Res) => any;
  fail?: (res: Res) => any;
  login?: (res: Res) => any;
  error?: (res: ErrorRes) => any;
}

type FactoryType = 'success' | 'fail' | 'error' | 'login';

type ErrorParams = {
  status: number;
  netWorkError: boolean;
  data: AnyObj;
};

interface ErrorData extends AnyObj {
  status: number;
}

type ErrorRes = {
  message: string;
  data: ErrorData;
};

export interface PromiseWrapper {
  success: (cb: (res: Res) => any) => PromiseWrapper;
  login: (cb: (res: Res) => any) => PromiseWrapper;
  fail: (cb: (res: Res) => any) => PromiseWrapper;
  error: (cb: (res: ErrorRes) => any) => PromiseWrapper;
  then: Promise<Res>;
  catch: Promise<ErrorRes>;
  finally: Promise<any>;
}

export class Request {
  private _handleRes: (params: Params) => any;
  public axios: AxiosStatic;

  constructor (config?: Config) {
    this._handleRes = genhandleRes(config);
    this.setting = this.setting.bind(this);
    this.request = this.request.bind(this);
    this.axios = axios;
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

    const factory = (type: FactoryType) => {
      if (type === 'error') {
        // error reload function defination
        promiseWrapper[type] = function (cb: (res: ErrorRes) => any) {
          this[`${type}_cb`] = cb;
          return promiseWrapper;
        };
      } else {
        promiseWrapper[type] = function (cb: (res: Res) => any) {
          this[`${type}_cb`] = cb;
          return promiseWrapper;
        };
      }

      promiseWrapper[type] = promiseWrapper[type].bind(promiseWrapper);

      return (res: Res | ErrorRes) => {
        if (type === 'error' && !promiseWrapper[`${type}_cb`]) return promiseRej(res);

        return promiseRes(promiseWrapper[`${type}_cb`] ? promiseWrapper[`${type}_cb`](res) : res)
      };
    };

    const callbacks = {
      success: factory('success'),
      fail: factory('fail'),
      error: factory('error'),
      login: factory('login')
    };

    return {
      promiseWrapper,
      callbacks
    };
  }

  public setting (config: Config) {
    if (!config) return logger.logWarn('setting method required correct parameters!');
    this._handleRes = genhandleRes(config);
  }

  public request (options: Options): PromiseWrapper {
    options.withCredentials = typeof options.withCredentials === 'boolean' ? options.withCredentials : true;
    options.headers = options.headers || {};
    options.headers['Accept'] = '*/*';
    const { success, fail, login, error } = options;

    const {
      promiseWrapper,
      callbacks: cb
    } = this._constructPromise();

    axios(options).then(response => {
      const { status, data, request } = response;
      const url = request.responseURL;

      if (+status === 200) {
        return this._handleRes({
          res: data,
          success: res => {
            logger.logInfo(`Success - ${url}`);
            return success ? success(res) : cb.success(res);
          },
          fail: res => {
            logger.logWarn(`Failed - ${url}`);
            return fail ? fail(res) : cb.fail(res);
          },
          error: err => {
            const errRes = this._handleError({
              status,
              netWorkError: false,
              data: {
                options,
                res: err
              }
            });
            return error ? error(errRes) : cb.error(errRes);
          },
          login: res => login ? login(res) : cb.login(res)
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
      logger.logErr(`Error - ${err}`);

      const errRes = this._handleError({
        status: err && +err.status === 200 ? 200 : 500,
        netWorkError: err.status >= 400 && err.status < 500,
        data: {
          options,
          err
        }
      });

      return error ? error(errRes) : cb.error(errRes);
    });

    return promiseWrapper;
  }
}

export default Request;
