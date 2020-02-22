'use strict';

nbe.lib.rnd_random_org = (function () {
	var sent, min, chars, fetch, get;

	sent = false;
	sent = true; // This line is used to block the requests while testing.
	min = 40;

	chars = '';

	fetch = function () {
		var url;

		if (!sent) {
			sent = true;
			url = 'http://www.random.org/strings/?num=3&len=20&digits=on&upperalpha=off&loweralpha=on&unique=off&format=plain&rnd=new';

			nbe.lib.xhr('GET', url, {}, '', 0, function (resp) {
				sent = false;
				try {
					chars = chars + resp.split('\n').join('');
				} catch (e) {
                    chars = '';
                }
			}, function () {
				sent = false;
			}, function () {
				sent = false;
			});
		}
	};

	fetch();

	get = function (n) {
		var str;

		str = '';

		if (chars.length >= n) {
			str = chars.slice(0, n);
			chars = chars.slice(n);
		}

		if (chars.length < min) {
			fetch();
		}

		return str;
	};

	return get;
}());
