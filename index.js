var Promise = require('bluebird');
var pull = require('pull-stream');
var unique = require("array-unique").immutable;

module.exports = function AboutOOO(getAboutStream) {

  // A non-live stream of all 'about 'messages in descending order
  if (getAboutStream == null) {
    throw new Error ("getAboutStream parameter required")
  }

  return {
    async: {
      getLatestMsgIds: (id, cb) => getLatestMsgIds(id, cb),
      getLatestNameMsgId: (id, cb) => getLatestNameMsgId(id, cb),
      getLatestDescriptionMsgId: (id, cb) => getLatestIds(id, cb),
      getLatestPictureMsgsId: (id, cb) => getLatestIds(id, cb)
    }
  }

  function getLatestMsgIds(id, cb) {
    var latestName = Promise.promisify(getLatestNameMsgId);
    var latestDescription = Promise.promisify(getLatestDescriptionMsgId);
    var latestPicture = Promise.promisify(getLatestPictureMsgsId);

    var idsPromise = Promise.all(
      [
        latestName(id),
        latestDescription(id),
        latestPicture(id)
      ]
    );

    return idsPromise.then(ids => unique(ids).filter(id => id != null)).asCallback(cb);
  }

  function getLatestNameMsgId(id, cb) {
    var aboutStream = getAboutStream(id);

    pull(aboutStream, findKeyInStream(msg => msg.value.content.name, cb));
  }

  function getLatestDescriptionMsgId(id, cb) {
    var aboutStream = getAboutStream(id);

    pull(aboutStream, findKeyInStream(msg => msg.value.content.description, cb));
  }

  function getLatestPictureMsgsId(id, cb) {
    var aboutStream = getAboutStream(id);

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
}