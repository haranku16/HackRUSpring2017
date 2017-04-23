var express = require('express');

var app = express();

var bodyparser = require('body-parser');

var crypto = require('crypto');

var user = {
	username:'test.user@mail.com',
	password:'test_password',
	keys:{},
    serialNumbers:{}
};
var device = {
   serialNumber:'0c812423eca0798887dc28479baa08a8818adb183a7792c4e07325a47469877f4bd4e76023e66413c3d6cd6417e05170',
   privateKey:'d93d01e5dbb470f605481898b66cc97f6d3f793cffe5d12ccb83944fd0b509b0fded28ae99e58bf6654af03b36fc497b',
   eventLog:[]
};

app.use(bodyparser.json());

app.get('/', function(req,res) {
    console.log('Hello world!');
    res.status(200).send('Hello world!');
});

app.post('/login', function(req,res) {
   var data = req.body;
    console.log(data);
   if (!data.hasOwnProperty('username')) {
      res.status(400).send('You need a username.');
   }
   else if (!data.hasOwnProperty('password')) {
      res.status(400).send('You need a password.');
   }
   else if (user.username != data.username) {
      res.status(401).send('This username is not registered.');
   }
   else if (user.password != data.password) {
      res.status(401).send('This password is incorrect.');
   }
   else {
      crypto.randomBytes(48, function(err, buffer) {
         if (err) {
            res.status(404).send('Could not generate secure key.');
         } else {
            res.status(200).send(buffer.toString('hex'));
            user.keys[buffer.toString('hex')] = true;
         }
      });
   }
});

app.post('/device-event',function(req,res) {
   var data = req.body;
   console.log(data);
   if (!data.hasOwnProperty('serialNumber')) {
      res.status(400).send('Serial number required.');
   }
   else if (!data.hasOwnProperty('privateKey')) {
      res.status(400).send('Private key required.');
   }
   else if (data.serialNumber != device.serialNumber) {
      res.status(401).send('This serial number is not registered');
   }
   else if (data.privateKey != device.privateKey) {
      res.status(401).send('This private key is incorrect');
   }
   else {
      res.status(200).send('OK');
      device.eventLog.push(new Date().getTime());
      console.log(device.eventLog)
      console.log('Logged time '+device.eventLog[0]);
   }
});

app.post('/ownership', function(req,res) {
    var data = req.body;
    console.log(data);
    if (!data.hasOwnProperty('username')) {
        res.status(400).send('Username required.');
    }
    else if (!data.hasOwnProperty('privateKey')) {
        res.status(400).send('Private key required.');
    }
    else if (!data.hasOwnProperty('serialNumber')) {
        res.status(400).send('Serial number required.');
    }
    else if (!data.hasOwnProperty('type')) {
        res.status(400).send('Type required.');
    }
    else if (data.username != user.username) {
        res.status(401).send('Username is not registered.');
    }
    else if (!user.keys.hasOwnProperty(data.privateKey)) {
        res.status(401).send('This private key is incorrect.');
    }
    else if (data.serialNumber != device.serialNumber) {
        res.status(401).send('Serial number does not match existing device.');
    }
    else {
        res.status(200).send('OK');
        user.serialNumbers[data.serialNumber] = data.type;
    }
});

app.get('/device-events', function(req,res) {
    var data = req.body;
    console.log(data);
    if (!data.hasOwnProperty('username')) {
        res.status(400).send('Username required.');
    }
    else if (!data.hasOwnProperty('privateKey')) {
        res.status(400).send('Private key required.');
    }
    else if (data.username != user.username) {
        res.status(401).send('Username is not registered.');
    }
    else if (!user.keys.hasOwnProperty(data.privateKey)) {
        res.status(401).send('This private key is incorrect.');
    }
    else {
        var response = {};
        for (var serialNumber in user.serialNumbers) {
            if (serialNumber == device.serialNumber) {
                response[serialNumber] == user.serialNumbers[serialNumber];
            }
        }
        res.status(200).send(response);
    }
});

app.listen(3000, function() {
   console.log('HackRU project running on port 3000.'); 
});
