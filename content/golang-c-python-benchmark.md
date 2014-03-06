# Golang, C and Python the benchmark time

- date: 2014-03-06 01:00
- author: avelino
- category: Go
- tags: golang, c, python, benchmark
- slug: golang-c-and-python-the-benchmark-time

-------

I was wondering how performant Golang is, so I decided to put together a little benchmarking example for myself.

The benchmark will be done in my personal computer:


```
Processor  3 GHz Intel Core i7
Memory  8 GB 1600 MHz DDR3
Software  OS X 10.9.2 (13C64)
```


So I started with Python, which is what I know best and created the following simple script;


```python
#!/usr/bin/env python

def fac(n):
    if n == 0:
        return 1
    return n * fac(n - 1)

if __name__ == "__main__":
    t = 0
    for j in range(100000):
        for i in range(8):
            t += fac(i)
    print("total: {0}".format(t))
```

The reason for the **total** output, was to have a check to ensure that I was getting the same results in each of the scripts. To make sure that they are doing the same amount of work.

Running the script gives us the following execution time;


```
$ time python factorial.py

total: 591400000

0.68s user
0.01s system
99% cpu
0.688 total
```


So I am getting about 1s in total execution time. Not bad.

Now the same code sample in C, to see what the time execution would be;


```c
#include <stdio.h>

int fac(int);

int fac(int n) {
  if (n == 0) {
    return 1;
  }
  return n * fac(n - 1);
}

main() {
  int i, j;
  int t = 0;

  for (j = 0; j < 100000; j++) {
    for (i = 0; i <= 7; i++) {
      t += fac(i);
    }
  }

  printf("total: %d\n", t);
}
```

Compile and execute the above snippet of code;


```
$ gcc factorial.c -o factorial
$ time ./factorial

total: 591400000

0.01s user
0.00s system
91% cpu
0.016 total
```


Ok, that's quite an improvement. This is C, so we do expect there to be a great improvement.

Finally we create our code sample in Go;


```go
package main

import "fmt"

func fact(n int) int {
    if n == 0 {
        return 1
    }
    return n * fact(n-1)
}

func main() {
    t := 0
    for j := 0; j < 100000; j++ {
        for i := range []int{1, 2, 3, 4, 5, 6, 7, 8} {
            t += fact(i)
        }
    }
    fmt.Println("total: ", t)
}
```


Then build and run the code sample and we get the following;


```
$ go build factorial.go
$ time ./factorial

total:  591400000

0.01s user
0.00s system
93% cpu
0.018 total
```


So, that's pretty much the same as C, which is excellent. The best part of it all, is that it is actually fun to code in Go compared to C. Python was always an attraction for me as the language is a breeze to work with and enjoyable programming with it. Go is also a nice language to work with and it's really fast to boot. So I'm very excited about the language.