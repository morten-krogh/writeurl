'use strict';

// classList
if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {
	(function (view) {
		var classListProp, protoProp, elemCtrProto, objCtr, strTrim, arrIndexOf, DOMEx, checkTokenAndGetIndex, ClassList, classListProto, classListGetter, classListPropDesc;

		classListProp = "classList";
		protoProp = "prototype";
		elemCtrProto = (view.HTMLElement || view.Element)[protoProp];
		objCtr = Object;
		strTrim = String[protoProp].trim || function () {
			return this.replace(/^\s+|\s+$/g, "");
		};
		arrIndexOf = Array[protoProp].indexOf || function (item) {
			var i, len;

			len = this.length;

			for (i = 0; i < len; i++) {
				if (i in this && this[i] === item) {
					return i;
				}
			}
			return -1;
		};
		// Vendors: please allow content code to instantiate DOMExceptions
		DOMEx = function (type, message) {
			this.name = type;
			this.code = DOMException[type];
			this.message = message;
		};
		checkTokenAndGetIndex = function (classList, token) {
			if (token === "") {
				throw new DOMEx(
					"SYNTAX_ERR",
					"An invalid or illegal string was specified"
				);
			}
			if (/\s/.test(token)) {
				throw new DOMEx(
					"INVALID_CHARACTER_ERR",
					"String contains an invalid character"
				);
			}
			return arrIndexOf.call(classList, token);
		};
		ClassList = function (elem) {
			var trimmedClasses, classes, i, len;

			trimmedClasses = strTrim.call(elem.className);
			classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [];
			len = classes.length;

			for (i = 0; i < len; i++) {
				this.push(classes[i]);
			}
			this._updateClassName = function () {
				elem.className = this.toString();
			};
		};
		classListProto = ClassList[protoProp] = [];
		classListGetter = function () {
			return new ClassList(this);
		};

		// Most DOMException implementations don't allow calling DOMException's toString()
		// on non-DOMExceptions. Error's toString() is sufficient here.
		DOMEx[protoProp] = Error[protoProp];
		classListProto.item = function (i) {
			return this[i] || null;
		};
		classListProto.contains = function (token) {
			token += "";
			return checkTokenAndGetIndex(this, token) !== -1;
		};
		classListProto.add = function (token) {
			token += "";
			if (checkTokenAndGetIndex(this, token) === -1) {
				this.push(token);
				this._updateClassName();
			}
		};
		classListProto.remove = function (token) {
			var index;

			token += "";
			index = checkTokenAndGetIndex(this, token);
			if (index !== -1) {
				this.splice(index, 1);
				this._updateClassName();
			}
		};
		classListProto.toggle = function (token) {
			token += "";
			if (checkTokenAndGetIndex(this, token) === -1) {
				this.add(token);
			} else {
				this.remove(token);
			}
		};
		classListProto.toString = function () {
			return this.join(" ");
		};

		if (objCtr.defineProperty) {
			classListPropDesc = {
				get: classListGetter,
				enumerable: true,
				configurable: true
			};
			try {
				objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
			} catch (ex) { // IE 8 doesn't support enumerable:true
				if (ex.number === -0x7FF5EC54) {
					classListPropDesc.enumerable = false;
					objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
				}
			}
		} else if (objCtr[protoProp].__defineGetter__) {
			elemCtrProto.__defineGetter__(classListProp, classListGetter);
		}
	}(window.self));
}

// addEventListener
if (window.Element && !window.addEventListener) {
	var attach, remove;

	attach = function (type, listener, _useCapture) {
		this.attachEvent('on' + type, function () {
			var event;

			event = window.event;
			event.target = event.srcElement;

			listener(event);
		});
	};

	remove = function (type, listener, _useCapture) {
		this.detachEvent('on' + type, listener);
	};

	window.Element.prototype.addEventListener = attach;
	window.Element.prototype.removeEventListener = remove;
	Window.prototype.addEventListener = attach;
	Window.prototype.removeEventListener = remove;
	document.addEventListener = attach;
	document.removeEventListener = remove;
}

/*
// Shim for DOM Events
// http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
// Use addEvent(object, event, handler) instead of object.addEventListener(event, handler)
window.addEvent = function (obj, type, fn) {
	if (obj.addEventListener) {
		obj.addEventListener(type, fn, false);
	} else if (obj.attachEvent) {
		obj["e" + type + fn] = fn;
		obj[type + fn] = function () {
			var e = window.event;
			e.currentTarget = obj;
			e.preventDefault = function () { e.returnValue = false; };
			e.stopPropagation = function () { e.cancelBubble = true; };
			e.target = e.srcElement;
			e.timeStamp = new Date();
			obj["e" + type + fn].call(this, e);
		};
		obj.attachEvent("on" + type, obj[type + fn]);
	}
};

window.removeEvent = function (obj, type, fn) {
	if (obj.removeEventListener) {
		obj.removeEventListener(type, fn, false);
	} else if (obj.detachEvent) {
		obj.detachEvent("on" + type, obj[type + fn]);
		obj[type + fn] = null;
		obj["e" + type + fn] = null;
	}
};
*/

// Object.keys
if (!Object.keys) {
	Object.keys = (function () {
		var hop, hasDontEnumBug, dontEnums, dontEnumsLength;

		hop = Object.prototype.hasOwnProperty;
		hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
		dontEnums = [
			'toString',
			'toLocaleString',
			'valueOf',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'constructor'
		];
		dontEnumsLength = dontEnums.length;

		return function (obj) {
			var result, prop, i;

			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
				throw new TypeError('Object.keys called on non-object');
			}

			result = [];

			for (prop in obj) {
				if (hop.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (i = 0; i < dontEnumsLength; i++) {
					if (hop.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
	Array.prototype.map = function (callback, thisArg) {
		var T, A, k, O, len, kValue, mappedValue;

		if (this === null) {
			throw new TypeError(" this is null or not defined");
		}

		// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
		//O = Object(this);
		O = {};

		// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		//len = O.length >>> 0;
		len = O.length > 0;

		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if ({}.toString.call(callback) !== "[object Function]") {
			throw new TypeError(callback + " is not a function");
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (thisArg) {
			T = thisArg;
		}

		// 6. Let A be a new array created as if by the expression new Array(len) where Array is
		// the standard built-in constructor with that name and len is the value of len.
		A = new Array(len);

		// 7. Let k be 0
		k = 0;

		// 8. Repeat, while k < len
		while (k < len) {
			// a. Let Pk be ToString(k).
			//	 This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
			//	 This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
				kValue = O[k];

				// ii. Let mappedValue be the result of calling the Call internal method of callback
				// with T as the this value and argument list containing kValue, k, and O.
				mappedValue = callback.call(T, kValue, k, O);

				// iii. Call the DefineOwnProperty internal method of A with arguments
				// Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
				// and false.

				// In browsers that support Object.defineProperty, use the following:
				// Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

				// For best browser support, use the following:
				A[k] = mappedValue;
			}
			// d. Increase k by 1.
			k++;
		}

		// 9. return A
		return A;
	};
}

// Date.now()
Date.now = Date.now || function () {
	return +new Date();
};

// Array indexOf()
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		var t, len, n, k;

		if (this === null) {
			throw new TypeError();
		}
		//t = Object(this);
		t = {};
		//len = t.length >>> 0;
		len = t.length > 0;
		if (len === 0) {
			return -1;
		}
		n = 0;
		if (arguments.length > 0) {
			n = Number(arguments[1]);
			if (n !== n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}

// Array filter
if (!Array.prototype.filter) {
	Array.prototype.filter = function (fun /*, thisp */) {
		"use strict";
		var t, len, res, thisp, i, val;

		if (this === null) {
			throw new TypeError();
		}

		t = {};//Object(this)
		len = t.length > 0;
		if (typeof fun !== "function") {
			throw new TypeError();
		}

		res = [];
		thisp = arguments[1];
		for (i = 0; i < len; i++) {
			if (i in t) {
				val = t[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, t)) {
					res.push(val);
				}
			}
		}

		return res;
	};
}
// Array foreach

if (!Array.prototype.forEach) {
	Array.prototype.forEach = function forEach(callback, thisArg) {
		var T, k, O, len, kValue;

		if (this === null) {
			throw new TypeError("this is null or not defined");
		}

		// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
		O = {};//Object(this);

		// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		len = O.length > 0; // Hack to convert O.length to a UInt32 >>>

		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if ({}.toString.call(callback) !== "[object Function]") {
			throw new TypeError(callback + " is not a function");
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (thisArg) {
			T = thisArg;
		}

		// 6. Let k be 0
		k = 0;

		// 7. Repeat, while k < len
		while (k < len) {

			// a. Let Pk be ToString(k).
			//	 This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
			//	 This step can be combined with c
			// c. If kPresent is true, then
			if (Object.prototype.hasOwnProperty.call(O, k)) {

				// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
				kValue = O[k];

				// ii. Call the Call internal method of callback with T as the this value and
				// argument list containing kValue, k, and O.
				callback.call(T, kValue, k, O);
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined
	};
}
