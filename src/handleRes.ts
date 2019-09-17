import { isType, Logger } from 'peeler-js';
import { TlogLevelStr } from 'peeler-js/es/logger';

export interface ResObj {
  [propName: string]: any;
}

export type Res = ResObj | string;
export type Callback = (res: Res) => any;

export interface Params {
  res: Res;
  success?: Callback;
  fail?: Callback;
  error?: Callback;
  login?: Callback;
}

export type CodeMap = {
  suc_code?: string | number | boolean;
  err_code?: string | number;
  login_code?: string | number;
};

export interface Config {
  codeMap?: CodeMap;
  codeField?: string;
  debug?: boolean;
  logLevel?: TlogLevelStr;
}

function handleRes (config?: Config) {
  const { codeMap, codeField = 'code', debug = false, logLevel = 'warn' } = config || {};
  const { suc_code = 0, err_code = -1, login_code = 50 } = codeMap || {};
  const logger = new Logger({
    logPrefix: 'Ajax-Maker-handleRes',
    debug,
    logLevel
  });

  /**
   * handle api response
   * @param {object} params reference Params interface
   * @return {any}
   */
  return function (params: Params): any {
    let {
      res,
      success,
      fail,
      error,
      login = (): false | void => typeof window !== 'undefined' && window.location.reload(true)
    } = params;
  
    if (typeof res !== 'object') {
      try {
        res = JSON.parse(res);
      } catch (err) {
        logger.logInfo(err);
        return success ? success(res) : res;
      }
    }

    const ret = iterationObj(res as ResObj, codeField);
    if (ret === null) return error ? error((<ResObj>res)) : res;

    switch (ret) {
    case suc_code:
      return success ? success(res) : res;
    case login_code:
      return login ? login(res) : res;
    case err_code:
      return error ? error(res) : res;
    default:
      return fail ? fail(res) : res;
    }
  };
}

function iterationObj (obj: ResObj, key: string) {
  for (const k in obj) {
    if (obj.hasOwnProperty(k) && k === key) {
      return obj[k];
    } else if (isType('object')(obj[k])) {
      iterationObj(obj[k], key);
    }
  }

  return null; 
}

export default handleRes;
