var AWS = require('aws-sdk');
var nconf = require("./wrio_nconf.js").init();
var keyid = nconf.get("aws:aws_access_key_id"), secret = nconf.get("aws:aws_secret_access_key");
AWS.config.update({accessKeyId: keyid, secretAccessKey: secret});
var s3 = new AWS.S3({
    params: {Bucket: 'wr.io', Key: 'test'}
});

var indexTemplate = "index  loading...";
var coverTemplate = "cover loading...";
var plusTemplate = "plus loading...";
// get templates we will be working on

function download(url,callback) {
    var params = {
        Bucket: 'wrioos.com',
        Key: url
    };
    s3.getObject(params,callback);
}


download("Storage-WRIO-App/default/index.htm",function(err,res) {
    if (err) {
        console.log("Can't get index template ",err);
        return;
    }
    indexTemplate = res.Body.toString();
});

download("Plus-WRIO-App/default/index.htm",function(err,res) {
    if (err) {
        console.log("Can't get index template ",err);
        return;
    }
    plusTemplate = res.Body.toString();
    console.log("Plus template loaded");
});

download("Storage-WRIO-App/default/cover.htm",function(err,res) {
    if (err) {
        console.log("Can't get cover template ",err);
        return;
    }
    coverTemplate = res.Body.toString();
});


module.exports.createTemplates = function (userID) {

    var domain = nconf.get("db:workdomain").replace(".",'');
    var userTemplate = indexTemplate.replace('{{domain}}','http://'+domain+'/'+userID);
    //console.log("UT:",userTemplate);
    var params = {
        Body:userTemplate,
        Key:userID+"/index.htm",
        ACL:'public-read',
        ContentType:"text/html"
    };

    s3.upload(params,function (err,res) {
        if (err) {
            console.log(err);
        }
    });

    params = {
        Body:coverTemplate,
        Key:userID+"/cover.htm",
        ACL:'public-read',
        ContentType:"text/html"
    };

    s3.upload(params,function (err,res) {
        if (err) {
            console.log(err);
        }
    });

    params = {
        Body:plusTemplate,
        Key:userID+"/Plus-WRIO-App/index.htm",
        ACL:'public-read',
        ContentType:"text/html"
    };

    s3.upload(params,function (err,res) {
        if (err) {
            console.log(err);
        }
    });

};

module.exports.saveFile = function (userID,path,file,done) {

    var params = {
        Body:file,
        Key:userID+'/'+path,
        ACL:'public-read',
        ContentType:"text/html"
    };

    s3.upload(params,function (err,res) {
        if (err) {
            console.log(err);
            done("Cant write file");
            return;
        }
        console.log("File uploaded to s3",res);
        done(null,res.Location);
    });

};
