import axios, { AxiosStatic, AxiosRequestConfig } from 'axios';
import { Logger } from 'peeler-js';

import type { AxiosError, RawAxiosResponseHeaders, AxiosResponseHeaders, RawAxiosRequestHeaders, AxiosRequestHeaders, AxiosResponse } from 'axios';
import type { TlogLevelStr } from 'peeler-js/es/logger';

export type ParsedError<T extends string = string> = {
  name: T;
  message: string;
  stack: string;
};

export type CheckNever<T> = T extends never ? true : false;

export type CheckAny<T> = CheckNever<T> extends false ? false : true;

export type WithFailureData<T = undefined> = T extends null ? null | undefined : T | null | undefined;

export interface ChainName {
  // eslint-disable-next-line max-len
  all: ChainName['success'] | ChainName['failure'] | ChainName['error'] | ChainName['login'] | ChainName['timeout'];
  // one
  success: 'success';
  failure: 'failure';
  error: 'error';
  login: 'login';
  timeout: 'timeout';
  // n - 1
  withoutS: Exclude<ChainName['all'], 'success'>;
  withoutF: Exclude<ChainName['all'], 'failure'>;
  withoutE: Exclude<ChainName['all'], 'error'>;
  withoutL: Exclude<ChainName['all'], 'login'>;
  withoutT: Exclude<ChainName['all'], 'timeout'>;
  // n - 2
  withoutSF: Exclude<ChainName['all'], 'success' | 'failure'>;
  withoutSE: Exclude<ChainName['all'], 'success' | 'error'>;
  withoutSL: Exclude<ChainName['all'], 'success' | 'login'>;
  withoutST: Exclude<ChainName['all'], 'success' | 'timeout'>;
  withoutFE: Exclude<ChainName['all'], 'failure' | 'error'>;
  withoutFL: Exclude<ChainName['all'], 'failure' | 'login'>;
  withoutFT: Exclude<ChainName['all'], 'failure' | 'timeout'>;
  withoutEL: Exclude<ChainName['all'], 'error' | 'login'>;
  withoutET: Exclude<ChainName['all'], 'error' | 'timeout'>;
  withoutLT: Exclude<ChainName['all'], 'login' | 'timeout'>;
  // two
  withSF: ChainName['success'] | ChainName['failure'];
  withSE: ChainName['success'] | ChainName['error'];
  withSL: ChainName['success'] | ChainName['login'];
  withST: ChainName['success'] | ChainName['timeout'];
  withFE: ChainName['failure'] | ChainName['error'];
  withFL: ChainName['failure'] | ChainName['login'];
  withFT: ChainName['failure'] | ChainName['timeout'];
  withEL: ChainName['error'] | ChainName['login'];
  withET: ChainName['error'] | ChainName['timeout'];
  withLT: ChainName['login'] | ChainName['timeout'];
}

export interface ChainReturn<T> {
  success: T;
  failure: WithFailureData | ParsedError;
  error: ParsedError;
  login: WithFailureData | ParsedError;
  timeout: ParsedError<'timeout'>;
  successOrFailure: WithFailureData<T>;
  all: WithFailureData<T> | ParsedError | ParsedError<'timeout'>;
}

export type AxiosReqHeaders = RawAxiosRequestHeaders | AxiosRequestHeaders;
export type AxiosResHeaders = RawAxiosResponseHeaders | AxiosResponseHeaders;

export interface InitConfig<T = any> {
  onSuccess?: (res: ChainReturn<T>['success'], headers: AxiosResHeaders) => any;
  onFailure?: (res: ChainReturn<T>['failure'], headers: AxiosResHeaders) => any;
  onLogin?: (res: ChainReturn<T>['login'], headers: AxiosResHeaders) => any;
  onError?: (res: ChainReturn<T>['error'], headers: AxiosReqHeaders | AxiosResHeaders) => any;
  onTimeout?: (e: ChainReturn<T>['timeout'], headers: AxiosReqHeaders) => any;
  isSuccess?: (res: T, status: number, headers: AxiosResHeaders) => boolean;
  isLogin?: (res: T, status: number, headers: AxiosResHeaders) => boolean;
  timeout?: number;
  debug?: boolean;
  logLevel?: TlogLevelStr;
}

export interface Options<T> extends Omit<InitConfig<T>, 'debug' | 'logLevel'>, AxiosRequestConfig { }

export type FactoryType = 'success' | 'failure' | 'error' | 'login';

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

export type RestScopeName = ChainName['all'];

export type RestScope = Readonly<[RestScopeName, RestScopeName?, RestScopeName?, RestScopeName?, RestScopeName?]>;

type Tuple2Record<T extends readonly any[]> = {
  [Value in T[number]]: Value
};

export interface PromiseWrapper<
  T,
  TSuc = ChainReturn<T>['success'],
  TFail = ChainReturn<T>['failure'],
  TErr = ChainReturn<T>['error'],
  TLogin = ChainReturn<T>['login'],
  TTime = ChainReturn<T>['timeout'],
  HadCall extends string = ''
> {
  success<TRes = TSuc, Delete extends string = HadCall | 'success'>(
    onSuccess?: (res: ChainReturn<T>['success'], headers: AxiosResHeaders) => TRes,
  ): Omit<
    PromiseWrapper<T, TRes, TFail, TErr, TLogin, TTime, Delete>,
    ChainName['withoutS'] extends HadCall ? Delete | 'rest' : Delete
  > &
    Promise<TRes | TFail | TErr | TLogin | TTime>;
  failure<TRes = TFail, Delete extends string = HadCall | 'failure'>(
    onFailure?: (res: ChainReturn<T>['failure'], headers: AxiosResHeaders) => TRes,
  ): Omit<
    PromiseWrapper<T, TSuc, TRes, TErr, TLogin, TTime, Delete>,
    ChainName['withoutF'] extends HadCall ? Delete | 'rest' : Delete
  > &
    Promise<TSuc | TRes | TErr | TLogin | TTime>;
  error<TRes = TErr, Delete extends string = HadCall | 'error'>(
    onError?: (err: ChainReturn<T>['error'], headers: AxiosReqHeaders | AxiosResHeaders) => TRes,
  ): Omit<
    PromiseWrapper<T, TSuc, TFail, TRes, TLogin, TTime, Delete>,
    ChainName['withoutE'] extends HadCall ? Delete | 'rest' : Delete
  > &
    Promise<TSuc | TFail | TRes | TLogin | TTime>;
  login<TRes = TLogin, Delete extends string = HadCall | 'login'>(
    onLogin?: (res: ChainReturn<T>['login'], headers: AxiosResHeaders) => TRes,
  ): Omit<
    PromiseWrapper<T, TSuc, TFail, TErr, TRes, TTime, Delete>,
    ChainName['withoutL'] extends HadCall ? Delete | 'rest' : Delete
  > &
    Promise<TSuc | TFail | TErr | TRes | TTime>;
  timeout<TRes = TTime, Delete extends string = HadCall | 'timeout'>(
    onTimeout?: (err: ChainReturn<T>['timeout'], headers: AxiosReqHeaders) => TRes,
  ): Omit<
    PromiseWrapper<T, TSuc, TFail, TErr, TLogin, TRes, Delete>,
    ChainName['withoutT'] extends HadCall ? Delete | 'rest' : Delete
  > &
    Promise<TSuc | TFail | TErr | TLogin | TRes>;
  rest<
    TRes = TSuc | TFail | TErr | TLogin | TTime,
    TRestScope extends RestScope = ['success', 'failure', 'login', 'error', 'timeout'],
    TRestScopeName extends RestScopeName = Exclude<keyof Tuple2Record<TRestScope>, undefined>,
    THadCallWithNotInScope extends string = HadCall | Exclude<RestScopeName, TRestScopeName>,
    Delete extends string = HadCall | TRestScopeName | 'rest'
  >(
    onRest?: (
      val: ChainName['all'] extends THadCallWithNotInScope
        ? unknown
        : ChainName['withoutS'] extends THadCallWithNotInScope
        ? ChainReturn<T>['success']
        : ChainName['withoutF'] extends THadCallWithNotInScope
        ? ChainReturn<T>['failure']
        : ChainName['withoutE'] extends THadCallWithNotInScope
        ? ChainReturn<T>['error']
        : ChainName['withoutL'] extends THadCallWithNotInScope
        ? ChainReturn<T>['login']
        : ChainName['withoutT'] extends THadCallWithNotInScope
        ? ChainReturn<T>['timeout']
        : ChainName['withoutSF'] extends THadCallWithNotInScope
        ? ChainReturn<T>['successOrFailure']
        : ChainName['withoutSE'] extends THadCallWithNotInScope
        ? ChainReturn<T>['success' | 'error']
        : ChainName['withoutSL'] extends THadCallWithNotInScope
        ? ChainReturn<T>['success' | 'login']
        : ChainName['withoutST'] extends THadCallWithNotInScope
        ? ChainReturn<T>['success' | 'timeout']
        : ChainName['withoutFE'] extends THadCallWithNotInScope
        ? ChainReturn<T>['failure' | 'error']
        : ChainName['withoutFL'] extends THadCallWithNotInScope
        ? ChainReturn<T>['failure' | 'login']
        : ChainName['withoutFT'] extends THadCallWithNotInScope
        ? ChainReturn<T>['failure' | 'timeout']
        : ChainName['withoutEL'] extends THadCallWithNotInScope
        ? ChainReturn<T>['error' | 'login']
        : ChainName['withoutET'] extends THadCallWithNotInScope
        ? ChainReturn<T>['error' | 'timeout']
        : ChainName['withoutLT'] extends THadCallWithNotInScope
        ? ChainReturn<T>['login' | 'timeout']
        : ChainName['withSF'] extends THadCallWithNotInScope
        ? ChainReturn<T>['error' | 'login' | 'timeout']
        : ChainName['withSE'] extends THadCallWithNotInScope
        ? ChainReturn<T>['failure' | 'login' | 'timeout']
        : ChainName['withSL'] extends THadCallWithNotInScope
        ? ChainReturn<T>['failure' | 'error' | 'timeout']
        : ChainName['withST'] extends THadCallWithNotInScope
        ? ChainReturn<T>['failure' | 'error' | 'login']
        : ChainName['withFE'] extends THadCallWithNotInScope
        ? ChainReturn<T>['success' | 'login' | 'timeout']
        : ChainName['withFL'] extends THadCallWithNotInScope
        ? ChainReturn<T>['success' | 'error' | 'timeout']
        : ChainName['withFT'] extends THadCallWithNotInScope
        ? ChainReturn<T>['success' | 'error' | 'login']
        : ChainName['withEL'] extends THadCallWithNotInScope
        ? ChainReturn<T>['successOrFailure' | 'timeout']
        : ChainName['withET'] extends THadCallWithNotInScope
        ? ChainReturn<T>['successOrFailure' | 'login']
        : ChainName['withLT'] extends THadCallWithNotInScope
        ? ChainReturn<T>['successOrFailure' | 'error']
        : ChainName['success'] extends THadCallWithNotInScope
        ? ChainReturn<T>['failure' | 'error' | 'login' | 'timeout']
        : ChainName['failure'] extends THadCallWithNotInScope
        ? ChainReturn<T>['success' | 'error' | 'login' | 'timeout']
        : ChainName['error'] extends THadCallWithNotInScope
        ? ChainReturn<T>['successOrFailure' | 'login' | 'timeout']
        : ChainName['login'] extends THadCallWithNotInScope
        ? ChainReturn<T>['successOrFailure' | 'error' | 'timeout']
        : ChainName['timeout'] extends THadCallWithNotInScope
        ? ChainReturn<T>['successOrFailure' | 'error' | 'login']
        : ChainReturn<T>['all'],
      headers: AxiosReqHeaders | AxiosResHeaders
    ) => TRes,
    scope?: TRestScope,
  ): Omit<PromiseWrapper<T, TSuc, TFail, TErr, TLogin, TTime, Delete>, Delete> &
    Promise<
      ChainName['all'] extends THadCallWithNotInScope
      ? TSuc | TFail | TErr | TLogin | TTime
      : ChainName['withoutS'] extends THadCallWithNotInScope
      ? TRes | TFail | TErr | TLogin | TTime
      : ChainName['withoutF'] extends THadCallWithNotInScope
      ? TSuc | TRes | TErr | TLogin | TTime
      : ChainName['withoutE'] extends THadCallWithNotInScope
      ? TSuc | TFail | TRes | TLogin | TTime
      : ChainName['withoutL'] extends THadCallWithNotInScope
      ? TSuc | TFail | TErr | TRes | TTime
      : ChainName['withoutT'] extends THadCallWithNotInScope
      ? TSuc | TFail | TErr | TLogin | TRes
      : ChainName['withoutSF'] extends THadCallWithNotInScope
      ? TRes | TErr | TLogin | TTime
      : ChainName['withoutSE'] extends THadCallWithNotInScope
      ? TRes | TFail | TLogin | TTime
      : ChainName['withoutSL'] extends THadCallWithNotInScope
      ? TRes | TFail | TErr | TTime
      : ChainName['withoutST'] extends THadCallWithNotInScope
      ? TRes | TFail | TErr | TLogin
      : ChainName['withoutFE'] extends THadCallWithNotInScope
      ? TSuc | TRes | TLogin | TTime
      : ChainName['withoutFL'] extends THadCallWithNotInScope
      ? TSuc | TRes | TErr | TTime
      : ChainName['withoutFT'] extends THadCallWithNotInScope
      ? TSuc | TRes | TErr | TLogin
      : ChainName['withoutEL'] extends THadCallWithNotInScope
      ? TSuc | TFail | TRes | TTime
      : ChainName['withoutET'] extends THadCallWithNotInScope
      ? TSuc | TFail | TRes | TLogin
      : ChainName['withoutLT'] extends THadCallWithNotInScope
      ? TSuc | TFail | TErr | TRes
      : ChainName['withSF'] extends THadCallWithNotInScope
      ? TSuc | TFail | TRes
      : ChainName['withSE'] extends THadCallWithNotInScope
      ? TSuc | TErr | TRes
      : ChainName['withSL'] extends THadCallWithNotInScope
      ? TSuc | TLogin | TRes
      : ChainName['withST'] extends THadCallWithNotInScope
      ? TSuc | TTime | TRes
      : ChainName['withFE'] extends THadCallWithNotInScope
      ? TFail | TErr | TRes
      : ChainName['withFL'] extends THadCallWithNotInScope
      ? TFail | TLogin | TRes
      : ChainName['withFT'] extends THadCallWithNotInScope
      ? TFail | TTime | TRes
      : ChainName['withEL'] extends THadCallWithNotInScope
      ? TErr | TLogin | TRes
      : ChainName['withET'] extends THadCallWithNotInScope
      ? TErr | TTime | TRes
      : ChainName['withLT'] extends THadCallWithNotInScope
      ? TLogin | TTime | TRes
      : ChainName['success'] extends THadCallWithNotInScope
      ? TSuc | TRes
      : ChainName['failure'] extends THadCallWithNotInScope
      ? TFail | TRes
      : ChainName['error'] extends THadCallWithNotInScope
      ? TErr | TRes
      : ChainName['login'] extends THadCallWithNotInScope
      ? TLogin | TRes
      : ChainName['timeout'] extends THadCallWithNotInScope
      ? TTime | TRes
      : TRes
    >;
}

class ResponsePromise<T = any> {
  public _success: Parameters<PromiseWrapper<T>['success']>[0];

  public _failure: Parameters<PromiseWrapper<T>['failure']>[0];

  public _error: Parameters<PromiseWrapper<T>['error']>[0];

  public _login: Parameters<PromiseWrapper<T>['login']>[0];

  public _timeout: Parameters<PromiseWrapper<T>['timeout']>[0];

  public _rest?: Parameters<PromiseWrapper<T>['rest']>[0];

  public _resolve?: ((value: any) => void);

  public _reject?: ((reason?: any) => void);

  public promiseWrapper: PromiseWrapper<T> & Promise<T>;

  public _restScope: RestScope;

  constructor(logger: InstanceType<typeof Logger>) {
    this.promiseWrapper = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    }) as any;

    this._restScope = ['success', 'failure', 'error', 'login', 'timeout'];

    for (let i = 0; i < this._restScope.length; i++) {
      const method = this._restScope[i];
      if (!method) continue;
      this.promiseWrapper[method] = _callback => {
        // @ts-ignore
        if (typeof _callback === 'function') this[`_${method}`] = _callback;
        const wrapper = this.promiseWrapper as any;
        delete wrapper[method];
        const methods = this._restScope.slice();
        methods.splice(methods.indexOf(method), 1);
        if (methods.every(_m => !!_m && !wrapper[_m])) delete wrapper.rest;
        return wrapper;
      };
    }

    this.promiseWrapper.rest = (onRest, scope) => {
      // @ts-ignore
      if (typeof onRest === 'function') this._rest = onRest;
      const wrapper = this.promiseWrapper as any;
      delete wrapper.rest;
      this._restScope = scope || this._restScope;
      // @ts-ignore
      if (this._restScope.length === 0) {
        logger.warn('The ".rest(cb, scope)" scope is empty and will never be triggered!');
      } else {
        let deletedCounter = 0;
        this._restScope.forEach(method => {
          if (!method) return;
          if (wrapper[method]) {
            delete wrapper[method];
          } else {
            deletedCounter++;
          }
        });
        if (deletedCounter === this._restScope.length) {
          logger.warn(
            `The "${this._restScope.join(
              ', ',
            )}" had been called and the "rest" will never be triggered!`,
          );
        }
      }
      return wrapper;
    };
  }
}

export class Request {
  private _logger: Logger;
  private _config: InitConfig;

  public axios: AxiosStatic;

  constructor(config?: InitConfig) {
    const { debug = false, logLevel = 'warn' } = config || {};
    this._logger = new Logger({
      logPrefix: 'AJAX-MAKER',
      debug,
      logLevel
    });
    this._config = config || {};

    this.axios = axios;
    this.parseError = this.parseError.bind(this);
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

  public setting(config: InitConfig) {
    if (!config) return this._logger.logWarn('setting method required correct parameters!');
    this._config = { ...this._config, ...config };
  }

  public request<T>(options: Options<T>): PromiseWrapper<T> & Promise<T | ParsedError> {
    options.withCredentials = typeof options.withCredentials === 'boolean' ? options.withCredentials : true;
    options.headers = options.headers || {};
    options.headers['Accept'] = options.headers['Accept'] || '*/*';
    const {
      onSuccess: initOnSuccess,
      onFailure: initOnFailure,
      onLogin: initOnLogin,
      onError: initOnError,
      onTimeout: initOnTimeout,
      isSuccess: initIsSuccess,
      isLogin: initIsLogin,
      timeout: initTimeout,
    } = this._config;
    const {
      onSuccess,
      onFailure,
      onLogin,
      onError,
      onTimeout,
      isSuccess,
      isLogin,
      timeout,
    } = options;
    const rules = {
      success: isSuccess ?? initIsSuccess,
      login: isLogin ?? initIsLogin,
    };

    const ResPromise = new ResponsePromise<T>(this._logger);

    Promise.resolve().then(() => {
      const callbacks = {
        success:
          ResPromise._success ??
          (~ResPromise._restScope.indexOf('success') ? ResPromise._rest : undefined) ??
          onSuccess ??
          initOnSuccess ??
          ((r: T, h: AxiosResHeaders) => r),
        failure:
          ResPromise._failure ??
          (~ResPromise._restScope.indexOf('failure') ? ResPromise._rest : undefined) ??
          onFailure ??
          initOnFailure ??
          ((v: T, h: AxiosResHeaders) => v),
        error:
          ResPromise._error ??
          (~ResPromise._restScope.indexOf('error') ? ResPromise._rest : undefined) ??
          onError ??
          initOnError ??
          ((v: T, h: AxiosResHeaders) => v),
        login:
          ResPromise._login ??
          (~ResPromise._restScope.indexOf('login') ? ResPromise._rest : undefined) ??
          onLogin ??
          initOnLogin ??
          ((v: T, h: AxiosResHeaders) => v),
        timeout:
          ResPromise._timeout ??
          (~ResPromise._restScope.indexOf('timeout') ? ResPromise._rest : undefined) ??
          onTimeout ??
          initOnTimeout ??
          ((v: T, h: AxiosReqHeaders) => v),
      };

      const existedHandler = {
        success: !!(
          ResPromise._success ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('success')) ||
          onSuccess ||
          initOnSuccess
        ),
        failure: !!(
          ResPromise._failure ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('failure')) ||
          onFailure ||
          initOnFailure
        ),
        login: !!(
          ResPromise._login ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('login')) ||
          onLogin ||
          initOnLogin
        ),
        error: !!(
          ResPromise._error ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('error')) ||
          onError ||
          initOnError
        ),
        timeout: !!(
          ResPromise._timeout ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('timeout')) ||
          onTimeout ||
          initOnTimeout
        ),
      };

      const existedChainHandler = {
        success: !!(
          ResPromise._success ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('success'))
        ),
        failure: !!(
          ResPromise._failure ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('failure'))
        ),
        login: !!(
          ResPromise._login ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('login'))
        ),
        error: !!(
          ResPromise._error ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('error'))
        ),
        timeout: !!(
          ResPromise._timeout ||
          (ResPromise._rest && ~ResPromise._restScope.indexOf('timeout'))
        ),
      };

      const errorHandler = async (e: any, headers: AxiosReqHeaders | AxiosResHeaders) => {
        try {
          let err = this.parseError(e);
          // @ts-ignore
          const result = await Promise.resolve(callbacks.error(err, headers));
          if (existedChainHandler.error) err = result;
          existedHandler.error ? ResPromise._resolve!(err) : ResPromise._reject!(err);
        } catch (_e) {
          ResPromise._reject!(this.parseError(_e));
        }
      };

      let timer: null | NodeJS.Timeout = null;
      let isTimeout = false;
      const _timeout = timeout ?? initTimeout;
      if (_timeout) {
        timer = setTimeout(async () => {
          try {
            isTimeout = true;
            timer = null;
            let err = this.parseError('timeout') as ParsedError<'timeout'>;
            // @ts-ignore
            const res = await Promise.resolve(callbacks.timeout(err, options.headers ?? {}));
            if (existedChainHandler.timeout) err = res;
            existedHandler.timeout ? ResPromise._resolve!(err) : ResPromise._reject!(err);
          } catch (e) {
            errorHandler(e, options.headers ?? {});
          }
        }, _timeout);
      }

      this.axios<any, AxiosResponse<T, any>, any>(options).then(async response => {
        if (isTimeout) return;
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }

        const { status, data, headers } = response;
        try {
          const doSuccess = rules.success?.(data, status, headers);
          const doLogin = rules.login?.(data, status, headers);

          let res = data;
          if (doLogin) {
            const result = await Promise.resolve(callbacks.login({ ...this.parseError('need login'), ...data }, headers));
            if (existedChainHandler.login) res = result;
          } else if (doSuccess) {
            const result = await Promise.resolve(callbacks.success(data, headers));
            if (existedChainHandler.success) res = result;
          } else {
            const result = await Promise.resolve(callbacks.failure({ ...this.parseError('request failed'), ...data }, headers));
            if (existedChainHandler.failure) res = result;
          }
          ResPromise._resolve!(res);
        } catch (e) {
          errorHandler(e, headers);
        }
      }).catch(async (err: AxiosError<any>) => {
        if (isTimeout) return;
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }

        this._logger.logErr(`Error - ${err}`);

        const status = err.response?.status;
        const data = err.response?.data;
        const headers = err.response?.headers ?? {};
        const doLogin = rules.login?.(data, status ?? 500, headers);

        try {
          let res = data;
          if (doLogin) {
            res = await Promise.resolve(callbacks.login(res, headers));
            ResPromise._resolve!(res);
          } else {
            errorHandler(err, headers);
          }
        } catch (e) {
          errorHandler(err, headers);
        }
      });
    });

    return ResPromise.promiseWrapper;
  }
}

export default Request;
