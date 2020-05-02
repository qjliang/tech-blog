// import https from 'https';
// export default ({ $axios }) => {
//   $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });

//   $axios.onRequest(config => {
//     config.startTime = Date.now();
//     console.info('发起请求 ' + config.url);
//   });

//   $axios.onError(err => {
//     console.error(err);
//   });

//   $axios.onResponse(resp => {
//     const mill = 1000;
//     const costTime = (Date.now() - resp.config.startTime) / mill;
//     console.info(`请求 ${resp.config.url} 已完成！响应耗时：${costTime}s，状态码：${resp.status}`);
//   });
// };
export default ({ $axios }) => {
  // request interceptor
  $axios.interceptors.request.use(
    config => {
      // do something before request is sent
      return config;
    },
    error => {
      // do something with request error
      return Promise.reject(error);
    }
  );
  $axios.onRequest(config => {
    console.log('Making request to ' + config.url);
  });

  // response interceptor
  $axios.interceptors.response.use(
    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
      const res = response;
      if (response.status === 200) {
        return res;
      } else {
        // redirect('/404');
        // if the custom code is not 200, it is judged as an error.
      }
      return Promise.reject(new Error(res.msg || 'Error'));
    },
    error => {
      console.log('err' + error); // for debug

      return Promise.reject(error);
    }
  );

  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status);
    if (code === 400) {
      // redirect('/404');
    } else if (code === 500) {
      // redirect('/500');
    }
  });
};
