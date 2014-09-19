# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

NODE_LOCAL_BIN = ./node_modules/.bin

TMPDIR ?= /tmp

.PHONY: test
test: eslint cover-mocha spaceleft

install:
	@npm install

clean:
	rm -rf node_modules coverage lib-cov html-report

.PHONY: cover-mocha
cover-mocha:
	@NODE_ENV=test $(NODE_LOCAL_BIN)/istanbul cover \
		$(NODE_LOCAL_BIN)/_mocha -- --reporter spec test/* -t 5000
	@echo aim your browser at coverage/lcov-report/index.html for details

.PHONY: eslint
eslint:
	@npm run lint

.PHONY: mocha
mocha:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha test/* --reporter spec -t 5000

.PHONY: runserver
runserver:
	node demo/index.js
