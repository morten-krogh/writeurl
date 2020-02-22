
function rnd_crypto(n) {
	var chars, buf, i;

	chars = [];

	if ('crypto' in window && 'getRandomValues' in window.crypto) {
		buf = new Uint8Array(n);
		window.crypto.getRandomValues(buf);
		for (i = 0; i < n; i++) {
			chars[i] = buf[i].toString(36).slice(-1);
		}
	}

	return chars.join('');
}

function rnd_math_random(n) {
	var chars, i;

	chars = [];

	for (i = 0; i < n; i++) {
		chars[i] = Math.floor(36 * Math.random()).toString(36);
	}

	return chars.join('');
}

function rnd_string(n) {
    let str = rnd_crypto(n);

	if (str.length != n) {
		str = rnd_math_random(n);
	}

	return str;
}

export { rnd_string };
