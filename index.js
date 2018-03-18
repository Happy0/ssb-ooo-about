var Promise = require('bluebird');
var pull = require('pull-stream');
var unique = require("array-unique").immutable;

module.exports = function AboutOOO(server, opts) {
  if (!server.links) throw new Error('ssb-ooo-about requires you to have the ssb-links plugin installed')

  return {
    async: {
      getLatestMsgIds: (id, cb) => getLatestMsgIds(server, id, cb),
      getLatestNameMsgId: (id, cb) => getLatestNameMsgId(server, id, cb),
      getLatestDescriptionMsgId: (id, cb) => getLatestIds(server, id, cb),
      getLatestPictureMsgsId: (id, cb) => getLatestIds(server, id, cb)
    }
  }
}

function getLatestMsgIds(server, id, cb) {
  var latestName = Promise.promisify(getLatestNameMsgId);
  var latestDescription = Promise.promisify(getLatestDescriptionMsgId);
  var latestPicture = Promise.promisify(getLatestPictureMsgsId);

  var idsPromise = Promise.all(
    [
      latestName(server, id),
      latestDescription(server, id),
      latestPicture(server, id)
    ]
  );

  return idsPromise.then(ids => unique(ids).filter(id => id != null)).asCallback(cb);
}

function getLatestNameMsgId(server, id, cb) {
  var aboutStream = getAboutStream(server, id);

  pull(aboutStream, findKeyInStream(msg => msg.value.content.name, cb));
}

function getLatestDescriptionMsgId(server, id, cb) {
  var aboutStream = getAboutStream(server, id);

  pull(aboutStream, findKeyInStream(msg => msg.value.content.description, cb));
}

function getLatestPictureMsgsId(server, id, cb) {
  var aboutStream = getAboutStream(server, id);

  pull(aboutStream, findKeyInStream(msg => msg.value.content.image, cb));
}

function findKeyInStream(findFn, cb) {
  return pull.find(findFn, (err, result) => {
    if (err) {
      cb(err);
    } else {
      cb(err, result ? result.key : null);
    }
  })
}

function getAboutStream(server, id) {
  return server.links({
    dest: id,
    rel: "about",
    reverse: true,
    values: true,
    source: id
  });
}
