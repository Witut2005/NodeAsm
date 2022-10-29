Opcode = {
    'add': 0,
    'inc': 0x40,
    'dec': 0x48,
    'push': 0x50,
    'pop': 0x58,
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