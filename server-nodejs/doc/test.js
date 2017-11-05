'use strict';

var mod_state = require('./mod_state');

var mod_store = require('./mod_store');

var id = 'nk2sx5rgebqpf7yykpb9';

var state = mod_state.init();
var operations = mod_store.get_operations(id, 0);

mod_state.test(state, operations);
