import 'mocha';
import { expect } from 'chai';
import genhandleRes, { Res } from '../handleRes';

const handleRes1 = genhandleRes();
const handleRes2 = genhandleRes({
  codeMap: {
    suc_code: true
  },
  codeField: 'success'
});
describe('handleRes\'s test module', function () {
  const sucRes = {
    data: {},
    msg: 'Transaction success.',
    code: 0,
    success: true
  };
  const failRes = {
    data: '3318',
    msg: 'Transaction failure.',
    code: 3318,
    success: false
  };
  const errRes = {
    data: '-1',
    msg: 'System busy',
    code: -1,
    success: false
  };
  const loginRes = {
    data: '50',
    msg: 'please login',
    code: 50,
    success: false
  };
  const strRes = 'token:9238273213';
  const jsonRes = '{"code":0,"msg":"hello ts"}';

  function normalCb (res: Res): string | number {
    return typeof res === 'string' ? res : res.code;
  }
  const callbacks = {
    success: normalCb,
    fail: normalCb,
    error: normalCb,
    login: normalCb
  };

  const p_without_cb_suc = {
    res: sucRes
  };
  const p_without_cb_fail = {
    res: failRes
  };
  const p_without_cb_err = {
    res: errRes
  };
  const p_without_cb_login = {
    res: loginRes
  };
  const p_without_cb_str = {
    res: strRes
  };
  const p_without_cb_json = {
    res: jsonRes
  };

  const p_with_cb_suc = {
    res: sucRes,
    ...callbacks
  };
  const p_with_cb_fail = {
    res: failRes,
    ...callbacks
  };
  const p_with_cb_err = {
    res: errRes,
    ...callbacks
  };
  const p_with_cb_login = {
    res: loginRes,
    ...callbacks
  };
  const p_with_cb_str = {
    res: strRes,
    ...callbacks
  };
  const p_with_cb_json = {
    res: jsonRes,
    ...callbacks
  };

  it('handleRes without callbacks - suc', function () {
    expect(handleRes1(p_without_cb_suc)).to.be.an('object');
  });
  it('handleRes without callbacks - suc - appoint codeField', function () {
    expect(handleRes2(p_without_cb_suc))
      .to.be.an('object')
      .to.have.property('success').to.be.true;
  });

  it('handleRes without callbacks - fail', function () {
    expect(handleRes1(p_without_cb_fail)).to.be.an('object');
  });
  it('handleRes without callbacks - fail - appoint codeField', function () {
    expect(handleRes2(p_without_cb_fail))
      .to.be.an('object')
      .to.have.property('success').to.be.false;
  });


  it('handleRes without callbacks - err', function () {
    expect(handleRes1(p_without_cb_err)).to.be.an('object');
  });

  it('handleRes without callbacks - login', function () {
    expect(handleRes1(p_without_cb_login)).to.be.false;
  });

  it('handleRes without callbacks - str', function () {
    expect(handleRes1(p_without_cb_str)).to.be.a('string');
  });

  it('handleRes without callbacks - json', function () {
    expect(handleRes1(p_without_cb_json)).to.be.an('object');
  });


  it('handleRes with callbacks - suc', function () {
    expect(handleRes1(p_with_cb_suc)).to.be.equal(0);
  });
  it('handleRes with callbacks - fail', function () {
    expect(handleRes1(p_with_cb_fail)).to.be.equal(3318);
  });
  it('handleRes with callbacks - err', function () {
    expect(handleRes1(p_with_cb_err)).to.be.equal(-1);
  });
  it('handleRes with callbacks - login', function () {
    expect(handleRes1(p_with_cb_login)).to.be.equal(50);
  });
  it('handleRes with callbacks - str', function () {
    expect(handleRes1(p_with_cb_str)).to.be.equal('token:9238273213');
  });
  it('handleRes with callbacks - json', function () {
    expect(handleRes1(p_with_cb_json)).to.be.equal(0);
  });
});
