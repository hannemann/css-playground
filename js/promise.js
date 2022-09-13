const callback = function (callback, str, timeout) {
  setTimeout(() => {
    callback(str);
  }, timeout);
};

callback((result) => console.log(result), "Callback", 1000);

//------------------------------------------------------------

const timeout = function (str, timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(str);
    }, timeout);
  });
};

timeout("Promise", 2000).then((result) => {
  console.log(result);
});

const t = async () => {
  try {
    const result = await timeout("Async", 3000);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

t();

console.log("Ende");
