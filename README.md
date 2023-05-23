## Mutex

[![NPM version][npm-image]][npm-url]
[![build status][gitflow-image]][gitflow-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/js-mutex.svg?style=flat-square
[npm-url]: https://npmjs.org/package/js-mutex
[gitflow-image]: https://github.com/x-cold/mutex/actions/workflows/test.yml/badge.svg?branch=master
[gitflow-url]: https://github.com/x-cold/mutex/actions/workflows/test.yml
[codecov-image]: https://codecov.io/gh/x-cold/mutex/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/x-cold/mutex
[download-image]: https://badgen.net/npm/dt/js-mutex
[download-url]: https://npmjs.org/package/js-mutex

A modern lightweight lib to control the promise mutex

### Usage

> The version of your node.js should be greater than v12

```bash
npm i -S js-mutex
```

### Importing library

```javascript
import Mutex from 'js-mutex';

async function singleExecute() {
  const mutex = new Mutex();
  let cur = 0;
  await mutex.lock();
  cur = 1;
  await mutex.unlock();
}

async function singleExecuteConcurrency() {
  const mutex = new Mutex();
  const result: number[] = [];

  async function fn(i: number) {
    await mutex.acquire(async () => {
      await sleep(100);
      result.push(i);
    });
  }

  const promises = [];
  for (let i = 0; i < 10; i += 1) {
    promises.push(fn(i));
  }

  await Promise.all(promises);
}

```
