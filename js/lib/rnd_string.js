'use strict';

nbe.lib.rnd_string = function (n) {
	var str;

	str = nbe.lib.rnd_random_org(n);

	if (str.length !== n) {
		str = nbe.lib.rnd_crypto(n);
	}

	if (str.length !== n) {
		str = nbe.lib.rnd_math_random(n);
	}

	return str;
};
