
var user = require('./../user'),
	categories = require('./../categories'),
	topics = require('./../topics'),
	posts = require('./../posts');

var	DebugRoute = function(app) {

	app.namespace('/debug', function() {

		app.get('/uid/:uid', function (req, res) {

			if (!req.params.uid)
				return res.redirect('/404');

			user.getUserData(req.params.uid, function (err, data) {
				if (data) {
					res.send(data);
				} else {
					res.json(404, {
						error: "User doesn't exist!"
					});
				}
			});
		});


		app.get('/cid/:cid', function (req, res) {
			categories.getCategoryData(req.params.cid, function (err, data) {
				if (data) {
					res.send(data);
				} else {
					res.send(404, "Category doesn't exist!");
				}
			});
		});

		app.get('/tid/:tid', function (req, res) {
			topics.getTopicData(req.params.tid, function (err, data) {
				if (data) {
					res.send(data);
				} else {
					res.send(404, "Topic doesn't exist!");
				}
			});
		});

		app.get('/pid/:pid', function (req, res) {
			posts.getPostData(req.params.pid, function (err, data) {
				if (data) {
					res.send(data);
				} else {
					res.send(404, "Post doesn't exist!");
				}
			});
		});

		app.get('/groups/prune', function(req, res) {
			var	Groups = require('../groups');

			Groups.prune(function(err) {
				res.send('pruned');
			});
		});

		app.get('/reindex', function (req, res) {
			topics.reIndexAll(function (err) {
				if (err) {
					return res.json(err);
				}

				user.reIndexAll(function (err) {
					if (err) {
						return res.json(err);
					} else {
						res.send('Topics and users reindexed');
					}
				});
			});
		});


		app.get('/mongo', function(req, res) {

			var db = require('./../database');
			var objectKey = 'testing4';

			function createUser(callback) {
				user.create('baris','123456', 'barisusakli@gmail.com', callback);
			}

			function getUser(callback) {
				user.getUserData(1, callback);
			}

			function setObject(callback) {
				db.setObject(objectKey, {name:'baris', 'lastname':'usakli', age:3}, function(err, result) {
					console.log('setObject return ', result);
					callback(err, {'setObject':result});
				});
			}

			function getObject(callback) {
				db.getObject(objectKey, function(err, data) {
					console.log('getObject return ', data);
					callback(err, {'getObject':data});
				});
			}

			function setObjectField(callback) {
				db.setObjectField(objectKey, 'reputation', 5, function(err, result) {
					console.log('setObjectField return', result);
					callback(err, {'setObjectField': result});
				});
			}

			function getObjectField(callback) {
				db.getObjectField(objectKey, 'age', function(err, age) {
					console.log('getObjectField return', age);
					callback(err, {'getObjectField' : age});
				});
			}

			function getObjectFields(callback) {
				db.getObjectFields(objectKey, ['name', 'lastname'], function(err, data) {
					console.log('getObjectFields return', data);
					callback(err, {'getObjectFields':data});
				});
			}

			function getObjectValues(callback) {
				db.getObjectValues(objectKey, function(err, data) {
					console.log('getObjectValues return', data);
					callback(err, {'getObjectValues':data});
				});
			}

			function isObjectField(callback) {
				db.isObjectField(objectKey, 'age', function(err, data) {
					console.log('isObjectField return', data);
					callback(err, {'isObjectField':data});
				});
			}

			function deleteObjectField(callback) {
				db.deleteObjectField(objectKey, 'reputation', function(err, data) {
					console.log('deleteObjectField return', data);
					callback(err, {'deleteObjectField':data});
				});
			}

			function incrObjectFieldBy(callback) {
				db.incrObjectFieldBy(objectKey, 'age', 3, function(err, data) {
					console.log('incrObjectFieldBy return', data);
					callback(err, {'incrObjectFieldBy':data});
				});
			}


			function sortedSetAdd(callback) {
				db.sortedSetAdd('sortedSet2', 1, 12, function(err, data) {
					console.log('sortedSetAdd return', data);
					callback(err, {'sortedSetAdd': data});
				});
			}

			function sortedSetRemove(callback) {
				db.sortedSetRemove('sortedSet2', 12, function(err, data) {
					console.log('sortedSetRemove return', data);
					callback(err, {'sortedSetRemove': data});
				});
			}

			function getSortedSetRange(callback) {
				db.getSortedSetRevRange('sortedSet2', 0, -1, function(err, data) {
					console.log('getSortedSetRange return', data);
					callback(err, {'getSortedSetRange': data});
				});
				/*var args = ['sortedSet2', '+inf', 100, 'LIMIT', 0, 10];
				db.getSortedSetRevRangeByScore(args, function(err, data) {
					console.log('getSortedSetRevRangeByScore return', data);
					callback(err, {'getSortedSetRevRangeByScore': data});
				});*/
			}

			function listAppend(callback) {
				db.listAppend('myList5', 5, function(err, data) {
					console.log('listAppend return', data);
					callback(err, {'listAppend': data});
				});
			}

			function listPrepend(callback) {
				db.listPrepend('myList5', 4, function(err, data) {
					console.log('listPrepend return', data);
					callback(err, {'listPrepend': data});
				});
			}

			function getListRange(callback) {
				db.getListRange('myList5', 0, 5, function(err, data) {
					console.log('getListRange return', data);
					callback(err, {'getListRange': data});
				});
			}


			var objectTasks = [
				//createUser,
				getUser,
				setObject,
				getObject,
				deleteObjectField,
				getObject,
				setObjectField,
				getObject,
				deleteObjectField,
				getObject,
				getObjectField,
				getObjectFields,
				getObjectValues,
				isObjectField,
				incrObjectFieldBy,
				getObject
			];

			var sortedSetTasks = [
				//sortedSetAdd,
				getSortedSetRange,
				sortedSetAdd,
				getSortedSetRange,
				sortedSetRemove,
				getSortedSetRange,
			];

			var listTasks = [
				listAppend,
				listPrepend,
				getListRange
			];

			require('async').series(listTasks, function(err, results) {
				if(err) {
					console.log(err);
					res.send(err.message);
				} else {
					res.json(results);
				}
			});
		});


	});
};

module.exports = DebugRoute;