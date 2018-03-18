var Promise = require('bluebird');
var pull = require('pull-stream');
var unique = require("array-unique").immutable;

module.exports = function AboutOOO(server, opts) {
  return {
    async: {
      getLatestMsgIds: (id, cb) => getLatestMsgIds(server, id, cb),
      getLatestNameMsgIds: (id, cb) => getLatestNameMsgIds(server, id, cb),
      getLatestDescriptionMsgIds: (id, cb) => getLatestIds(server, id, cb),
      getLatestPictureMsgsIds: (id, cb) => getLatestIds(server, id, cb)
    }
  }
}

function getLatestMsgIds(server, id, cb) {
  var latestName = Promise.promisify(getLatestNameMsgIds);
  var latestDescription = Promise.promisify(getLatestDescriptionMsgIds);
  var latestPicture = Promise.promisify(getLatestPictureMsgsIds);

  var idsPromise = Promise.all(
    [
      latestName(server, id),
      latestDescription(server, id),
      latestPicture(server, id)
    ]
  );

  return idsPromise.then(ids => unique(ids).filter(id => id != null)).asCallback(cb);
}

function getLatestNameMsgIds(server, id, cb) {
  var aboutStream = getAboutStream(server, id);

  pull(aboutStream, findKeyInStream(msg => msg.value.content.name, cb));
}

function getLatestDescriptionMsgIds(server, id, cb) {
  var aboutStream = getAboutStream(server, id);

  pull(aboutStream, findKeyInStream(msg => msg.value.content.description, cb));
}

function getLatestPictureMsgsIds(server, id, cb) {
  var aboutStream = getAboutStream(server, id);

  pull(aboutStream, findKeyInStream(msg => msg.value.content.image, cb));
}

function findKeyInStream(findFn, cb) {
  return pull.find(findFn, (err, result) => {
    if (err) {
      cb(err);
    } else {
      cb(err, result.key);
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
