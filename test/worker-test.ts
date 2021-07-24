// console.log('worker init')
process.on('message', message => {
  if (message === 'stop') {
    process.exit();
    return;
  }
  let inputs: any[] = message;
  let outputs = inputs.map(input => ({ echo: input }));
  process.send!(outputs);
});
