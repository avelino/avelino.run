+++
title = "How to reuse workflow in GitHub Action pipeline"
date = "2023-04-27"
tags = ["github","github actions","ci/cd"]
url = "/how-to-reuse-workflow-in-github-action-pipeline"
images = ["/blog/how-to-reuse-workflow-in-github-action-pipeline.jpg"]
+++

![How to reuse workflow in GitHub Action pipeline](/blog/how-to-reuse-workflow-in-github-action-pipeline.jpg)

Before I tell you how to do it, I will describe the problem I needed to solve and why I believed that reuse would be the best option to reduce duplicate code.

I maintain an Open Source project called [moclojer](https://github.com/moclojer/moclojer) written in **Clojure** and we use [GraalVM Native Imagem](https://www.graalvm.org/22.0/reference-manual/native-image/) to distribute the software in binary format (with everything self-contained).
The configuration of native-image receives several parameters, some refer to libraries used in the project code and it depends on a `.jar` file, so there are some steps before "running" the command that generates the binary.

Steps to generate the [moclojer] binary (<https://github.com/moclojer/moclojer>):

1. generate the `.jar` file
2. generate the configuration file `reflect.config.json` from the `.jar`.
3. generate the binary using `.jar` and `reflect.config.json`
4. test if the binary is working correctly - run the software
5. upload artifact (file) to generate software release on GitHub

In [moclojer](https://github.com/moclojer/moclojer) I needed to run the pipeline that creates the `.jar` in every push and pull request, we had the same duplicate code in this pipeline and in the pipeline to generate the binary (Graalvm Native Image).

When opening *"pull request "* I don't need to generate the binary every time just once when everything is right with the contribution, but every *"push "* I want to generate the `.jar` to validate that everything is working.

\## How to reuse the workflow in GitHub Action pipeline?

*Now that we are clear on the need, let's get to the point of how to do it.*

In a **job** you have the parameter `jobs.<job-name>.uses` which accepts `.yml` file (another workflow), when it reaches this step it will call the external workflow and wait for the output, example:

```yaml
jobs:
  call-build:
    uses: moclojer/moclojer/.github/workflows/build-native-image.yml@main
```

In the example above I pass the path of the workflow `build-native-image.yml` which is in the GitHub organization `moclojer` (first parameter), in the repository `moclojer` (second parameter) and in the branch `main` (comes after the name of the file `.yml` starting with `@`).

`<github-org-OR-profile>/<repo-name>/.github/workflows/<workflow-file-name>@<branch-or-tag>`

If the workflow being invoked depends on any permissions, the main workflow needs to have the same permissions.

See the [workflow](https://github.com/moclojer/moclojer/blob/b9b27a12285742c6dd225204abcdc741abca00fa/.github/workflows/release.yml) we used for **release** from moclojer.

> Learn more about [workflow reuse](https://docs.github.com/en/actions/using-workflows/reusing-workflows) in the official GitHub documentation.
