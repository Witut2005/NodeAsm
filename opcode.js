Opcode = {
    'add': 0,
    'inc': 0x40,
    'dec': 0x48,
    'push': 0x50,
    'pop': 0x58,
    'mov': 0x88,
    'sti': 0x21,
    'xor': 0x31,
    'in': 0xE4,
    'out': 0xE6,
    'xlat': 0xD7,
    'pushf': 0x9C,
    'popf': 0x9D,
    'sahf': 0x9E,
    'lahf': 0x9F,
    'adc': 0x10,
    'ret': 0xC3
}

BaseOpcodeLength = {
    'inc': 1,
    'add': 2,
    'adc': 2,
    'push': 1,
    'pop': 1,
    'xor': 2,
    'in': 2,
    'out': 2,
    'xlat': 1,
    'pushf': 1,
    'popf': 1

}

Opcode2x2 = [
    'add', 'adc', 'mov', 'xor'
]

Opcode1x0 = [
    'sti', 'xlat', 'pushf', 'popf', 'sahf', 'lahf', 'ret'
]

Opcode1x1 = [
    'push', 'pop', 'inc', 'dec'
]

OpcodeIO = [
    'in', 'out'
]

Opcode

module.exports = {
    Opcode,
    BaseOpcodeLength
}