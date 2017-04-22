var crypto = require('crypto');
crypto.randomBytes(48,function(err,buffer) {
	if (err) console.log("uh oh");
	else console.log(buffer.toString('hex'));
});
