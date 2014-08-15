'use strict';

nbe.inputs.input = function (type, trigger) {
	var triggers, add_trigger, remove_trigger;

	triggers = trigger ? [trigger] : [];

	add_trigger = function (trigger) {
		var i, add;

		add = true;

		for (i = 0; i < triggers.length; i++) {
			if (triggers[i] === trigger) {
				add = false;
			}
		}

		if (add) {
			triggers.push(trigger);
		}
	};

	remove_trigger = function (trigger) {
		var i;

		for (i = 0; i < triggers.length; i++) {
			if (triggers[i] === trigger) {
				triggers.splice(i, 1);
			}
		}
	};

	return {editors : triggers, add_trigger : add_trigger, remove_trigger : remove_trigger, trigger : function (value) {
		var i;

		for (i = 0; i < triggers.length; i++) {
			triggers[i](type, value);
		}
	}, get_triggers : function () {
		return triggers;
	}};

};
