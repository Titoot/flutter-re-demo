//frida -Uf com.example.bindiff_database -l frida.js

function hookFunc() {

    var dumpOffset = '0xe91b4' // code offset

    var argBufferSize = 550

    var address = Module.findBaseAddress('libapp.so') // libapp.so (Android) or App (IOS) 
    console.log('\n\nbaseAddress: ' + address.toString())

    var codeOffset = address.add(dumpOffset)
    console.log('codeOffset: ' + codeOffset.toString())
    console.log('')
    console.log('Wait..... ')

    Interceptor.attach(codeOffset, {
        onEnter: function(args) {

            console.log('')
            console.log('--------------------------------------------|')
            console.log('\n    Hook Function: ' + dumpOffset);
            console.log('')
            console.log('--------------------------------------------|')
            console.log('')

            console.log(args[0].readCString())

        },
        onLeave: function(retval) {
            console.log('RETURN : ' + retval)
            //dumpArgs(0, retval, 150);
        }
    });

}

function dumpArgs(step, address, bufSize) {

    var buf = Memory.readByteArray(address, bufSize)

    console.log('Argument ' + step + ' address ' + address.toString() + ' ' + 'buffer: ' + bufSize.toString() + '\n\n Value:\n' +hexdump(buf, {
        offset: 0,
        length: bufSize,
        header: false,
        ansi: false
    }));

    console.log('')
    console.log('----------------------------------------------------')
    console.log('')
}

setTimeout(hookFunc, 1000)
