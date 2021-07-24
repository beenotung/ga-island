process.on('message', message => {
  console.log('from parent:', message);
  if (message === 'stop') {
    // console.log('child closing')
    // process.send('closed')
    // process.exit()
    setTimeout(() => {
      console.log('child is still active 2');
      setTimeout(() => {
        console.log('child is still active 1');
        setTimeout(() => {
          console.log('child is closing now');
          process.exit(0);
        }, 1000);
      }, 1000);
    }, 1000);
    return;
  }
  process.send!({ result: 2 });
});
