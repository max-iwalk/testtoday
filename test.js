var axios =require( 'axios');
const params = {'sid':563}

function baseRequest(params,method) {
 const [_params, _data] = method.toUpperCase() === 'GET' ? [params, ''] : ['', params]


  return new Promise((resolve, reject) => {
    axios({
      url: 'http://127.0.0.1:6600/test',
      method: "post",
      params: _params,
      data: _data,
      headers: {},
    
    
     
    }).then(res => {
      const data = res.data
      console.log(data)
 
      resolve(data)
    }).catch(err => {
      console.error('接口异常，' + err)
      reject(err)
    })
  })
}

baseRequest(params,'post')