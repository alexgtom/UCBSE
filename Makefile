default:
	cp ucb-schedule.user.source.js ucb-schedule.user.js

min:
	head ucb-schedule.user.source.js -n 24 | col -b > ucb-schedule.user.js
	java -jar compiler.jar --js=ucb-schedule.user.source.js | sed 's/^M//g' >> ucb-schedule.user.js
