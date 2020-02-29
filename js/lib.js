function clone(val) {
	return JSON.parse(JSON.stringify(val));
}

function file_upload(file, callback) {
	const find_ending = function (file) {
		const match = file.name.match(/\.([a-zA-Z]+)/);
		const ending = match ? match[1] : null;
		return ending;
	};

	const ending = find_ending(file);

	if (ending === null) {
		callback(null);
	} else {
		const reader = new FileReader();

		reader.onload = function (_event) {
			xhr('POST', nbe.config.file_upload_url, {'X-File-Ending' : ending}, reader.result, 0, function (responseText) {
				callback(JSON.parse(responseText));
			}, function () {
				callback(null);
			}, function () {
				callback(null);
			});
		};

		reader.readAsArrayBuffer(file);
	}
}

function get_attributes(element, keys) {
	const format = {};
	for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
		const value = element.getAttribute('data-' + key);
		if (value) {
			format[key] = value;
		}
	}
	return format;
}

function set_attributes(element, keys, format) {
	for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
		if (key in format) {
			element.setAttribute('data-' + key, format[key]);
		} else {
			element.removeAttribute('data-' + key);
		}
	}
	return element;
}

function new_id() {
	const stem = rnd_string(12);
	let counter = 0;

	return function () {
		const id = stem + counter;
		counter++;
		return id;
	};
}

function partial_copy(src, dst, keys) {
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (key in src) {
			dst[key] = src[key];
		}
	}
	return dst;
}

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

function valid_email(email) {
    const pattern = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

    return typeof email === 'string' && pattern.test(email);
}

function xhr(method, url, headers, body, timeout, callback_200, callback_other, callback_error) {
	const request = new XMLHttpRequest();

	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status === 200) {
				callback_200(request.responseText);
			} else {
				callback_other();
			}
		}
	};

	request.onerror = function () {
		callback_error();
	};

	request.ontimeout = function () {
		callback_error();
	};

	request.open(method, url, true);
	request.timeout = timeout;

	for (const prop in headers) {
		if (headers.hasOwnProperty(prop)) {
			request.setRequestHeader(prop, headers[prop]);
		}
	}

	request.send(body);
}

function save_blob(filename, blob) {
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        const elem = window.document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        elem.href = url;
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
        window.url.revokObjectURL(url);
    }
}

export { 
    clone,
    file_upload,
    get_attributes,
    set_attributes,
    new_id,
    partial_copy,
    rnd_string,
    valid_email,
    xhr,
    save_blob,
};
