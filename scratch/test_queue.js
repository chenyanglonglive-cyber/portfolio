let queueChain = Promise.resolve();

function enqueue(task) {
  return new Promise((resolve, reject) => {
    queueChain = queueChain.then(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log('Starting queue tests...');
  
  const results = [];
  
  const t1 = enqueue(async () => {
    console.log('Task 1 starting...');
    await delay(100);
    console.log('Task 1 done.');
    return 'T1_OK';
  });

  const t2 = enqueue(async () => {
    console.log('Task 2 starting...');
    await delay(50);
    console.log('Task 2 error!');
    throw new Error('T2_FAIL');
  });

  const t3 = enqueue(async () => {
    console.log('Task 3 starting...');
    await delay(80);
    console.log('Task 3 done.');
    return 'T3_OK';
  });

  try {
    const res1 = await t1;
    console.log('T1 resolved:', res1);
    results.push(res1);
  } catch (e) {
    console.log('T1 rejected:', e.message);
  }

  try {
    const res2 = await t2;
    console.log('T2 resolved:', res2);
    results.push(res2);
  } catch (e) {
    console.log('T2 rejected:', e.message);
  }

  try {
    const res3 = await t3;
    console.log('T3 resolved:', res3);
    results.push(res3);
  } catch (e) {
    console.log('T3 rejected:', e.message);
  }

  console.log('All done. Results:', results);
}

runTest();
