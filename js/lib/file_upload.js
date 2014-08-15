'use strict';

nbe.lib.file_upload = function (file, callback) {
	var find_ending, ending, reader;

	find_ending = function (file) {
		var match;

		match = file.name.match(/\.([a-zA-Z]+)/);
		ending = match ? match[1] : null;

		return ending;
	};

	ending = find_ending(file);

	if (ending === null) {
		callback(null);
	} else {
		reader = new FileReader();

		reader.onload = function (event) {
			nbe.lib.xhr('POST', nbe.config.file_upload_url, {'X-File-Ending' : ending}, reader.result, 0, function (responseText) {
				callback(JSON.parse(responseText));
			}, function () {
				callback(null);
			}, function () {
				callback(null);
			});
		};

		reader.readAsArrayBuffer(file);
	}
};
