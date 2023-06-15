// OpenAPI接入指南, 示例
var md5 =require( "md5");
var CryptoJS  =require( "crypto-js");
var Qs =require( 'qs');
var axios =require( 'axios');
//sdfjsdlfjslfjsl

const appId = 'ak_kAY9yAC2NhpJW' // 企业的AppID,申请后在ERP中获取
const appSecret = 'G5H4m54skU/335X2UdNphQ==' // 企业的AppSecret,申请后在ERP中获取

const getPath = 'sc/routing/data/local_inventory/category' // GET请求路由路径示例
const getParams =  { offset: 5 } // GET请求参数示例
const postPath = 'sc/routing/purchase/purchase/setOrders' // POST请求路由路径示例
const postParams = { order_sn: ["1234556","PO210705007","1234556"] } // POST请求参数示例
const BASE_HOST = 'https://openapi.lingxing.com'


function encrypt(content, appKey) {

  const _key = CryptoJS.enc.Utf8.parse(appKey)
  const encryptedECB = CryptoJS.AES.encrypt(content.trim(), _key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })

  return encryptedECB.toString()
}

function restQueryUrl(url, params) {
  const paramsUrl = Qs.stringify(params)
  return `${url}${paramsUrl? '?': ''}${paramsUrl}`
}

function isPlainObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]' || Array.isArray(val)
}


function generateSign(params, appKey) {
  const paramsArr = Object.keys(params).sort();
  const stringArr = paramsArr.map(key => {
    const value = isPlainObject(params[key]) ? JSON.stringify(params[key]) : String(params[key])
    return `${key}=${value}`
  })
  const paramsUrl = stringArr.join('&')

  const upperUrl = md5(paramsUrl).toString().toUpperCase()

  const encryptedString = encrypt(upperUrl, appKey)
  return encryptedString
}

async function generateAccessToken(appId, appSecret) {
  const path = '/api/auth-server/oauth/access-token';
  const params = {
    appId,
    appSecret
  };
  const postUrl = restQueryUrl(BASE_HOST + path, params)
  const { data, code } =await post(postUrl);
  if (Number(code) !== 200) {
   
    return
  }
  return data
}

function baseRequest(url, method, params, headers) {
  const [_params, _data] = method.toUpperCase() === 'GET' ? [params, ''] : ['', params]

  return new Promise((resolve, reject) => {
    axios({
      url: url,
      method: method,
      params: _params,
      data: _data,
      headers: headers || {}
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

function post(url, params, headers) {
  return baseRequest(url, 'POST', params, headers)
}

function get(url, params) {
  return baseRequest(url, 'GET', params)
}

async function httpRequest(routeName, method, appId, accessToken, params) {
  const baseParam = {
    'access_token': accessToken,
    'app_key': appId,
    'timestamp': Math.round(new Date().getTime()/1000)
  };
  const signParams = Object.assign({}, baseParam, params)
  // 使用apiId对query参数和基础字段进行签名
  const sign = generateSign(signParams, appId)
  baseParam.sign = sign
  let url = BASE_HOST + '/erp/' + routeName
  let headers = {}
  let queryParam = params
  if (method.toUpperCase() !== 'GET') {
    headers = {
      "Content-Type": "application/json"
    }
    // post、put请求需要格式化基础的参数成REST模式
    url = restQueryUrl(url, baseParam)
  } else {
    // get请求直接把参数放在params里
    queryParam = Object.assign({}, params, baseParam)

  }
  
  const { data, code } =await baseRequest(url, method, queryParam, headers)
	
  if (Number(code) !== 0) {
   
    return
  }

  return data
}





async function main() {
const data = await generateAccessToken(appId, appSecret)

httpRequest(getPath, 'get', appId, data ? data.access_token : '', getParams)

}
main()
