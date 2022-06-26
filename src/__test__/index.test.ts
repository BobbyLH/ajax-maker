import 'mocha';
import { expect } from 'chai';
import Request from '../';

describe('Request\'s test module', function () {
  const ajax = new Request();

  it('type check', function () {
    expect(Request).to.be.a('function');
    expect(ajax).to.be.an('object');
    expect(ajax.request).to.be.a('function');
    expect(ajax.setting).to.be.a('function');
  });
});
