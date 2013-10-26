github:
	liquidluck build -v
	ghp-import deploy
	git push origin gh-pages

.PHONY: github
