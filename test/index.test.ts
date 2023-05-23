import Mutex from '../src';

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Mutex test
 */
describe('Mutex test', () => {
  it('wait for lock', async () => {
    const mutex = new Mutex();
    let cur = 0;
    await mutex.lock();
    cur = 1;
    expect(mutex.isLocked()).toBe(true);
    await mutex.unlock();
    expect(cur).toBe(1);
  });

  it('wait for lock concurrency', async () => {
    const mutex = new Mutex();
    const result: number[] = [];

    async function fn(i: number) {
      await mutex.lock();
      await sleep(100);
      result.push(i);
      await mutex.unlock();
    }

    const promises = [];
    for (let i = 0; i < 10; i += 1) {
      promises.push(fn(i));
    }

    await Promise.all(promises);
    expect(result.length).toEqual(10);
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('acquire for lock concurrency', async () => {
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
    expect(result.length).toEqual(10);
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('acquire lock with error', async () => {
    const mutex = new Mutex();
    let cur = 0;
    const promise1 = mutex.acquire(async () => {
      cur = 1;
      throw new Error();
    });
    const promise2 = mutex.acquire(async () => {
      cur = 2;
    });
    await Promise.all([promise1.catch(() => Promise.resolve()), promise2]);
    expect(cur).toBe(2);
  });

  it('Should only allow one call at a time to a given function', async () => {
    const mutex = new Mutex();

    const startTimes: Record<string, number> = {};
    const endTimes: Record<string, number> = {};

    // f is our function that we expect to only be executed one at a time.
    const fn = async (taskName: string) => {
      const result = await mutex.acquire(async () => {
        startTimes[taskName] = Date.now();
        await sleep(25);
        endTimes[taskName] = Date.now();
        return taskName;
      });
      return result;
    };

    const startTime = Date.now();
    const results = await Promise.all([fn('a'), fn('b'), fn('c')]);
    expect(results).toEqual(['a', 'b', 'c']); // Make sure each function returns the right value

    expect(endTimes.a).toBeGreaterThan(startTimes.a); // Sanity check
    expect(startTimes.b).toBeGreaterThanOrEqual(endTimes.a); // B needs to start after A has ended
    expect(startTimes.c).toBeGreaterThanOrEqual(endTimes.b); // C needs to start after B has ended

    // If we actually performed this in sequence, then the total time should be at
    //  least (time for one function) * (time per function) = 25*3
    expect(Date.now() - startTime).toBeGreaterThan(75);
  });
});
