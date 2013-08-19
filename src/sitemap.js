var	path = require('path'),
	async = require('async'),
	sm = require('sitemap'),
	url = require('url'),
	categories = require('./categories'),
	topics = require('./topics'),
	sitemap = {
		getStaticUrls: function(callback) {
			callback(null, [
				{ url: '', changefreq: 'weekly', priority: '0.6' },
				{ url: 'recent', changefreq: 'daily', priority: '0.4' },
				{ url: 'users', changefreq: 'daily', priority: '0.4' }
			]);
		},
		getDynamicUrls: function(callback) {
			var	returnUrls = [];

			async.parallel([
				function(next) {
					var categoryUrls = [];
					categories.getAllCategories(function(data) {
						data.categories.forEach(function(category) {
							categoryUrls.push({
								url: path.join('category', category.slug),
								changefreq: 'weekly',
								priority: '0.4'
							});
						});

						next(null, categoryUrls);
					}, 0);
				},
				function(next) {
					var	topicUrls = [];
					topics.getAllTopics(null, null, function(topics) {
						topics.forEach(function(topic) {
							topicUrls.push({
								url: path.join('topic', topic.slug),
								changefreq: 'daily',
								priority: '0.6'
							});
						});

						next(null, topicUrls);
					});
				}
			], function(err, data) {
				if (!err) {
					returnUrls = returnUrls.concat(data[0]).concat(data[1]);
				}

				callback(null, returnUrls);
			});
		},
		render: function(callback) {
			async.parallel([sitemap.getStaticUrls, sitemap.getDynamicUrls], function(err, urls) {
				var urls = urls[0].concat(urls[1]),
					map = sm.createSitemap({
						hostname: nconf.get('url'),
						cacheTime: 600000,
						urls: urls
					}),
					xml = map.toXML(function(xml) {
						callback(xml);
					});
			});
		}
	}

module.exports = sitemap;