// console.log('worker init')
process.on('message', function (message) {
    if (message === 'stop') {
        process.exit();
        return;
    }
    var inputs = message;
    var outputs = inputs.map(function (input) { return ({ echo: input }); });
    process.send(outputs);
});
