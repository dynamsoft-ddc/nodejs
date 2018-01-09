let restfulApiResponseParser = {};

restfulApiResponseParser.Parse = function (httpWebResponse, callback) {
	if(!httpWebResponse){callback("HttpWebResponse is null.", null);}
	if(200 != httpWebResponse.status){callback("Request failed, status code is: " + httpWebResponse.status, null);}

	if(-1 != httpWebResponse.headers.get('content-type').toLowerCase().indexOf("application/json")){
		httpWebResponse.json().then((obj)=>{callback(null, obj)});
	}else{
		httpWebResponse.buffer().then((buffer)=>{
			callback(null, {
				error_code: 0,
				error_msg: "success",
				buffer: buffer
			});
		});
	}
}

module.exports = restfulApiResponseParser;