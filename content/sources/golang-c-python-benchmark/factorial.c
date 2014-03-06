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
