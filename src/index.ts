type Resolve = () => void;

class Mutex {
  private locked: boolean;

  private queue: Resolve[] = [];

  constructor() {
    this.locked = false;
    this.queue = [];
  }

  lock() {
    return new Promise<void>((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  unlock() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      if (resolve) {
        resolve();
      }
    } else {
      this.locked = false;
    }
  }

  isLocked() {
    return this.locked;
  }

  async acquire(fn: Function) {
    await this.lock();
    let result;
    try {
      result = await fn();
      return result;
    } finally {
      await this.unlock();
    }
  }
}

export default Mutex;
