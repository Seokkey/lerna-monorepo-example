#!/usr/bin/env node

const { program } = require('commander'); //commander 추가
const LogCore = require('log-core'); //log-core 추가

// action
program.action(cmd => LogCore()); // cmd에서 입력받으면 logcore 수행

program.parse(process.argv);