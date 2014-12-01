github:
	liquidluck build -v
	ghp-import deploy
	git push origin master -f

run:
	liquidluck build -v
	liquidluck server

.PHONY: github run
