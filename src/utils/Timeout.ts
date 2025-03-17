export const createTimeout = (ms: number): Promise<Error> => {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Operation timed out after ${ms}ms`)),
      ms
    );
  });
};

export const executePromiseWithTimeout = async <T>(
  ms: number,
  promise: Promise<T>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    Promise.race([promise, createTimeout(ms)])
      .then((res) => {
        if (res instanceof Error) {
          reject(`Operation timed out after ${ms}ms`);
        } else {
          resolve(res);
        }
      })
      .catch(reject);
  });
};
