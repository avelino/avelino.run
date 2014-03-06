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
