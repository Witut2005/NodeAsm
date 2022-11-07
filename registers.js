RegisterName = {
    //MOD 0
    '[bx+si]': 0,
    '[bx+di]': 1,
    '[bp+si]': 2,
    '[bp+di]': 3,
    '[si]': 4,
    '[di]': 5,
    '[      ]': 6,
    '[bx]': 7,


    //MOD3    
    'ax': 0,
    'cx': 1,
    'dx': 2,
    'bx': 3,
    'sp': 4,
    'bp': 5,
    'si': 6,
    'di': 7,

    'al': 0,
    'cl': 1,
    'dl': 2,
    'bl': 3,
    'ah': 4,
    'ch': 5,
    'dh': 6,
    'bh': 7,


}

SegmentRegisterName = {
    'es': 0,
    'cs': 1,
    'ss': 2,
    'ds': 3
}

RegisterNameMode2 = {
    'bx+si': 0,
    'bx+di': 1,
    'bp+si': 2,
    'bp+di': 3,
    'si': 4,
    'di': 5,
    'bp': 6,
    'bx': 7
}

SegmentOverridePrefixValues = {
    'cs': 0x2E,
    'ss': 0x36,
    'ds': 0x3E,
    'es': 0x26,
    'fs': 0x64,
    'es': 0x65
}


module.exports = {
    RegisterName,
    RegisterNameMode2
}