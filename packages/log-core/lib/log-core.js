const { red } = require('chalk')

function core () {
  console.log(red('log-core 실행'));
}

module.exports = core;