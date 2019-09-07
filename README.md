# Ajax Maker

## API
```typescript
  import Request from 'request-maker';

  type CodeMap = {
    suc_code?: string | number | boolean;
    err_code?: string | number;
    login_code?: string | number;
  };

  interface Config {
    codeMap?: CodeMap;
    codeField?: string;
  }

  const config: Config = {
    codeMap: {
      suc_code: 200;
      err_code: -1;
      login_code: '40100';
    },
    codeField: 'code'
  }

  // initialize instance
  const { request, setting } = new Request(config)

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
```



