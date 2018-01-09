const fs = require('fs');
//npm install form-data --save
const FormData = require('form-data');
//npm install node-fetch --save
const fetch = require('node-fetch');

let comm = require('./comm.js');
comm.appRootPath = __dirname;
const EnumOcrFileMethod = comm.EnumOcrFileMethod;
const restfulApiResponseParser = require('./restfulApiResponseParser.js');

let strOcrBaseUri = "https://cloud.dynamsoft.com/Rest/ocr/v1.1/file";
let dicHeader = {};
dicHeader['x-api-key'] = "YourOwnApiKey";

let main = function(){
	uploadFile("example.jpg", (strFileName)=>{
		recognizeFile(strFileName, (strFileName)=>{
			downloadFile(strFileName);
		});
	});
};
setTimeout(main, 0);

let uploadFile = function (strFileName, callback) {
	//1. upload file
	console.log("-----------------------------------------------------------------------");
	console.log("1. Upload file...");

	let formdata = new FormData();
	formdata.append("method","upload");
	comm.GetFileData(strFileName, (buffer)=>{
		if("string" != typeof buffer){
			formdata.append("file", buffer, {
				filename: "whyUploadFail.jpg",//strFileName,
				contentType: "application/octet-stream"
			});
		}else{ // base64
			formdata.append("file", buffer, {
				filename: "whyUploadFail.jpg",//strFileName,
				contentType: "text/plain"
			});
		}
		fetch(strOcrBaseUri, {
			method: 'POST',
			headers: dicHeader,
			body: formdata
		}).then((httpWebResponse)=>{
			restfulApiResponseParser.Parse(httpWebResponse, (err, restfulApiResponse)=>{
				if(err){
					console.log(err);
				}else{
					let strFileName = HandleRestfulApiResponse(restfulApiResponse, EnumOcrFileMethod.Upload);
					if(null == strFileName){return;}
					if(callback){callback(strFileName);}
				}
			});
		},(err)=>{
			console.log(err);
		});
	});
};

let recognizeFile = function (strFileName, callback) {
	//1. recognize file
	console.log("\n-----------------------------------------------------------------------");
	console.log("2. Recognize the uploaded file...");

	let formdata = new FormData();
	formdata.append("method","recognize");
	formdata.append("file_name", strFileName);
	formdata.append("language", "eng");
	formdata.append("output_format", "UFormattedTxt");
	formdata.append("page_range", "1-10");
	fetch(strOcrBaseUri, {
		method: 'Post',
		headers: dicHeader,
		body: formdata
	}).then((httpWebResponse)=>{
		restfulApiResponseParser.Parse(httpWebResponse, (err, restfulApiResponse)=>{
			if(err){
				console.log(err);
			}else{
				let strFileName = HandleRestfulApiResponse(restfulApiResponse, EnumOcrFileMethod.Recognize);
				if(null == strFileName){return;}
				if(callback){callback(strFileName);}
			}
		});
	},(err)=>{
		console.log(err);
	});
};

let downloadFile = function (strFileName, callback) {
	//1. download file
	console.log("\n-----------------------------------------------------------------------");
	console.log("3. Download the uploaded file...");

	let formdata = new FormData();
	formdata.append("method","download");
	formdata.append("file_name", strFileName);
	fetch(strOcrBaseUri, {
		method: 'Post',
		headers: dicHeader,
		body: formdata
	}).then((httpWebResponse)=>{
		restfulApiResponseParser.Parse(httpWebResponse, (err, restfulApiResponse)=>{
			if(err){
				console.log(err);
			}else{
				let strFileName = HandleRestfulApiResponse(restfulApiResponse, EnumOcrFileMethod.Download);
				if(null == strFileName){return;}
				if(callback){callback(strFileName);}
			}
		});
	},(err)=>{
		console.log(err);
	});
};

let HandleRestfulApiResponse = function(restfulApiResponse, enumOcrFileMethod){
	let strFileName;
	switch(enumOcrFileMethod){
		case EnumOcrFileMethod.Upload:{
			if(!restfulApiResponse){
				console.log("Upload Failed.");
				return null;
			}else if(0 != restfulApiResponse.error_code){
				console.log("Upload Failed: " + restfulApiResponse.error_msg);
				return null;
			}else{
				strFileName = restfulApiResponse.name;
				console.log("Upload success: " + strFileName);
				return strFileName;
			}
		}
		case EnumOcrFileMethod.Recognize:{

			if(!restfulApiResponse){
				console.log("Recognization Failed.");
				return null;
			}else if(!restfulApiResponse.outputs || !restfulApiResponse.outputs[0]){
				if(0 != restfulApiResponse.error_code){
					console.log("Recognization Failed: " + restfulApiResponse.error_msg);
					return null;
				}else{
					console.log("Recognization Failed");
					return null;
				}
			}else if(0 != restfulApiResponse.outputs[0].error_code){
				console.log("Recognization Failed: " + restfulApiResponse.outputs[0].error_msg);
				return null;
			}else{
				strFileName = restfulApiResponse.outputs[0].output;
				console.log("Recognization success: " + strFileName);
				return strFileName;
			}
		}
		case EnumOcrFileMethod.Download:{
			if(!restfulApiResponse){
				console.log("Download Failed.");
				return null;
			}else if(0 != restfulApiResponse.error_code){
				console.log("Download Failed: " + restfulApiResponse.error_msg);
				return null;
			}else{
				console.log("Result: " + restfulApiResponse.buffer.toString("utf16le"));
				return "";
			}
		}
		default:{
			console.log("Unsupported ocr method.");
			return null;
		}
	}
};
