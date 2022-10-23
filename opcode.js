Opcode = {
    'add': 0,
    'inc': 0x40,
    'mov': 0x69,
    'sti': 0x21
}

BaseOpcodeLength = {
    'inc': 1,
    'add': 2
}

OpcodeArguments = {
    'inc': 1,
    'add': 2,
    'sti': 0
}

module.exports = {
    Opcode,
    BaseOpcodeLength
}