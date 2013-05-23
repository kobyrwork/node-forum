var	config = require('../config.js'),
	RDB = require('./redis.js'),
	async = require('async'),
	utils = require('./utils.js');

(function(Notifications) {
	Notifications.get = function(nid, callback) {
		RDB.hmget('notifications:' + nid, 'text', 'score', 'path', 'datetime', function(err, notification) {
			callback({
				nid: nid,
				text: notification[0],
				score: notification[1],
				path: notification[2],
				datetime: notification[3]
			});
		});
	}

	Notifications.create = function(text, score, path, uniqueId, callback) {
		/*
		 * Score guide:
		 * 0	Low priority messages (probably unused)
		 * 5	Normal messages
		 * 10	High priority messages
		 *
		 * uniqueId is used solely to override stale nids.
		 * 		If a new nid is pushed to a user and an existing nid in the user's
		 *		(un)read list contains the same uniqueId, it will be removed, and
		 *		the new one put in its place.
		 */
		RDB.incr('notifications:next_nid', function(err, nid) {
			RDB.hmset(
				'notifications:' + nid,
				'text', text || '',
				'score', score || 5,
				'path', path || null,
				'datetime', new Date().getTime(),
				'uniqueId', uniqueId || utils.generateUUID(),
			function(err, status) {
				if (status === 'OK') callback(nid);
			});
		});
	}

	Notifications.push = function(nid, uids, callback) {
		if (!Array.isArray(uids)) uids = [uids];

		var	numUids = uids.length,
			x;

		Notifications.get(nid, function(notif_data) {
			for(x=0;x<numUids;x++) {
				if (parseInt(uids[x]) > 0) {
					RDB.zadd('uid:' + uids[x] + ':notifications:unread', notif_data.score, nid);
					if (callback) callback(true);
				}
			}
		});
	}

	Notifications.mark_read = function(nid, uid, callback) {
		if (parseInt(uid) > 0) {
			Notifications.get(nid, function(notif_data) {
				RDB.zrem('uid:' + uid + ':notifications:unread', nid);
				RDB.zadd('uid:' + uid + ':notifications:read', notif_data.score, nid);
				if (callback) callback(true);
			});
		}
	}

	Notifications.mark_read_multiple = function(nids, uid, callback) {
		async.each(nids, function(nid, next) {
			Notifications.mark_read(nid, uid, function(success) {
				if (success) next(null);
			});
		}, function(err) {
			if (callback && !err) callback(true);
		});
	}
}(exports));