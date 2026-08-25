// This is taken from stack overflow
const withTimeout = (promise, millis) => {
  let timeoutPid;
  const timeout = new Promise(
    (resolve, reject) =>
      (timeoutPid = setTimeout(() => reject(`Timed out after ${millis} ms.`), millis))
  );
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutPid) {
      clearTimeout(timeoutPid);
    }
  });
};


export default withTimeout;
