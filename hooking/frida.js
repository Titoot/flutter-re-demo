//frida -U -f <package> -l frida.js --no-pause

function hookFunc() {

    var dumpOffset = '0x26d544' // code offset

    var argBufferSize = 350

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
            
            /*    Null Encrypted_get:base64() => return args[0]
                  Null AES_decrypt() => arg[1], return args[0]
            */
            //AES_encrypt_plaintext_dump(args[0])
            //AES_encrypt_Key_dump(args[19])
            //AES_encrypt_Algo_dump(args[1])
            for (var argStep = 0; argStep < 50; argStep++) {
                try {
                    dumpArgs(argStep, args[argStep], argBufferSize);
                } catch (e) {

                    break;
                }

            }

        },
        onLeave: function(retval) {
            console.log('RETURN : ' + retval)

            //AES_decrypt_plaintext_dump(retval)
            //console.log(Memory.readByteArray(retval, 80))
            dumpArgs(0, retval, 850);
        }
    });

}
function hookEncrypt() {

    var dumpOffset = '0x5D5124' // code offset

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
            
            AES_encrypt_plaintext_dump(args[0])
           

        }
    });

}
function hookDecrypt() {

    var dumpOffset = '0x5FD9A0' // code offset

    var address = Module.findBaseAddress('libapp.so')
    console.log('\n\nbaseAddress: ' + address.toString())

    var codeOffset = address.add(dumpOffset)
    console.log('codeOffset: ' + codeOffset.toString())
    console.log('')
    console.log('Wait..... ')

    Interceptor.attach(codeOffset, {

        onLeave: function(retval) {
            AES_decrypt_plaintext_dump(retval)
          
        }
    });

}
function Encrypted_base64_dump(arg)
{ 
    var address = ptr(arg).add(11);

    var arg0String = Memory.readCString(ptr(address));

    console.log('AES_encrypt_Key_dump value:', arg0String);
}
function AES_encrypt_Key_dump(arg)
{ 
    var address = ptr(arg).add(11);

    var arg0String = Memory.readCString(ptr(address));

    console.log('AES_encrypt_Key_dump value:', arg0String);
}
function AES_encrypt_Algo_dump(arg)
{
    var argSize = 0;
    var address = ptr(arg).add(80);

    var byte1 = Memory.readU8(address);
    var byte2 = Memory.readU8(address.add(1));
    var byte3 = Memory.readU8(address.add(2));

    while (!(byte1 == 0 && byte2 == 0 && byte3 == 0)) {
        argSize++
        address = address.add(1)
        if(argSize > 100)
        {
            break;
        }
    }

    console.log('argSize: '+ argSize)

    //var arg0String = Memory.readUtf8String(ptr(address));
    var arg0String = Memory.readByteArray(ptr(address), argSize);

    console.log('AES_encrypt_plaintext_dump value:', arg0String);
}
function AES_encrypt_plaintext_dump(arg)
{
    var address = ptr(arg).add(11);

    var arg0String = Memory.readUtf8String(ptr(address));

    var patchStamp = patchStamps(arg0String)
    console.log('edited stamps: ' + patchStamp)
    Memory.writeUtf8String(ptr(address), patchStamp)
    arg0String = Memory.readUtf8String(ptr(address));
    console.log('')
    console.log('--------------------------------------------|')
    console.log('AES_encrypt_plaintext_dump value:', arg0String);
    console.log('')
    console.log('--------------------------------------------|')
}
function patchStamps(Data)
{
    var stamps = ["stamp1", "stamp2", "stamp1part2", "stamp2part2"]
    var JsonObject = JSON.parse(Data);
    for(let i of stamps) {
        if(JsonObject.hasOwnProperty(i))
        {
            JsonObject[i] = null;
        }
        
    }
    return JSON.stringify(JsonObject)
}
function AES_decrypt_plaintext_dump(retval)
{
    var address = ptr(retval).add(11);

    var arg0String = Memory.readUtf8String(ptr(address));
    console.log(arg0String.substring(0, 15))
    var newString = ""
    if(arg0String.substring(0, 15) == '{"stamp1part2":')
    {
        newString = arg0String.replaceAll("enabled", "disabled")
        newString = patchStamps(newString)
        //newString = '{"stamp1part2":"#kfxePWs9eKihVDYEpGYwSdJxmNSiHUFpc6SdsYRkumYpW1FWXw1MlGuxLQI4iJBBs98IPvtTI3","sslPinning":"enabled","jailBreakDetection":"disabled","emulatorDetection":"enabled","developerOptsDetection":"enabled","debugModeDetection":"enabled","bluetoothDetection":"enabled","harmfulAppsDetection":"enabled","emulatorAppsDetection":"enabled","emulatorPathDetection":"enabled","appVersionChecking":"enabled","appSignatureVerification":"enabled","allowedApkSignatures":["apple","rutVtbP7J+sBeGq7VmTw9mVLlO4=","4bcdmbcrRARJ\/WpWer3ULMHJCQM="],"showTrustIssue":"enabled","enableExitApp":"enabled","userPathVerification":"enabled","forceSafetyNetChecking":"enabled","userPathVerificationType":"All","userPathVerifiedList":{"temp":["\/data\/user\/0\/com.plebits.saboratv\/cache","\/data\/data\/com.plebits.saboratv\/cache"],"support":["\/data\/user\/0\/com.plebits.saboratv\/files","\/data\/data\/com.plebits.saboratv\/files"],"docs":["\/data\/user\/0\/com.plebits.saboratv\/app_flutter","\/data\/data\/com.plebits.saboratv\/app_flutter"]},"showDeleteAccountButton":"disabled","apkCheckSumVerification":"enabled","forceEmulatorPathCheck":"enabled","supportLinkType":"nonBrowser","allowedApkFileCheckSums":["sesHTOf7GsLDQF9kFkjj0g==","1Sc6oLQxcGwlbOn5Wviq4A==","8L\/nfcO6Nu\/TWWfHTrXrfg==","hEq5yqh6LKoyjMoq+OXWkA==","s6lh7vVG3Rx6gPQ8W3jhDg==","pEgb9xnqgfF2uj4MHCSsYg=="],"forceSpecificPlayer":"none","stamp2part2":"#3YoBnOU29eRs7YDgRoO1c2Kg46zO"}'
        Memory.writeUtf8String(ptr(address), newString)
        console.log('AES_decrypt_plaintext_dump new value in IF:', newString);
    }
    console.log('')
    console.log('--------------------------------------------|')
    console.log('AES_decrypt_plaintext_dump value:', arg0String);
    var arg0String = Memory.readCString(ptr(address));
    console.log('AES_decrypt_plaintext_dump new value:', arg0String);
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
//setTimeout(hookEncrypt, 1000)
//setTimeout(hookDecrypt, 1000)
