'use strict';

var mod_state = require('./mod_state');

var mod_store = require('./mod_store');
var mod_lib = require('./mod_lib');
var mod_client = require('./mod_client');

var id = 'nk2sx5rgebqpf7yykpb9';

var state = mod_state.init();
var operations = mod_store.get_operations(id, 0);

mod_state.test(state, operations);
