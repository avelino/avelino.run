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
