# [avelino.run](https://avelino.run)

My personal blog


**After cloning:**

```shell
git submodule update -f --remote --init
```

## GitHub Actions

### Open Source Contributions

This repository includes a GitHub Action that automatically generates markdown files with a monthly history of my contributions to open source projects.

To configure:

1. Create a GitHub personal token with permissions to read public activities
2. Add the token as a secret in the repository with the name `GH_TOKEN`
3. Files will be automatically generated in the `content/foss/` directory as `YYYY-MM.md` on the first day of each month

Generated files can be found at [/foss](/content/foss).
