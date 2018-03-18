var ssbClient = require('ssb-client')
var About = require('../index');

ssbClient(function (err, sbot) {

  var about = About(sbot, {});

  about.async.getLatestMsgIds("@RJ09Kfs3neEZPrbpbWVDxkN92x9moe3aPusOMOc4S2I=.ed25519", (err, result) => {
    if (err) {
      console.log("error was: " + err);
    } else {
      console.log("result was: " + result);
    }

  })

})
