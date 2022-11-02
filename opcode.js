Opcode = {
    'db': 0xFFFF,
    'dw': 0xFFFF,
    'dd': 0xFFFF,
    'dq': 0xFFFF,
    'add': 0,
    'or': 0x08,
    'and': 0x20,
    'inc': 0x40,
    'dec': 0x48,
    'push': 0x50,
    'pop': 0x58,
    'mov': 0x88,
    'xor': 0x31,
    'in': 0xE4,
    'out': 0xE6,
    'xlat': 0xD7,
    'pushf': 0x9C,
    'popf': 0x9D,
    'sahf': 0x9E,
    'lahf': 0x9F,
    'adc': 0x10,
    'ret': 0xC3,
    'int': 0xCD,
    'into': 0xCE,
    'iret': 0xCF,
    'clc': 0xF8,
    'cmc': 0xF5,
    'stc': 0xF9,
    'cld': 0xFC,
    'std': 0xFD,
    'cli': 0xFA,
    'sti': 0xFB,
    'movsb': 0xA4,
    'movsw': 0xA5,
    'cmpsb': 0xA6,
    'cmpsw': 0xA7,
    'cmp': 0x38,
    'scasb': 0xAE,
    'scasw': 0xAF,
    'lodsb': 0xAC,
    'lodsw': 0xAD,
    'stdsb': 0xAA,
    'stdsw': 0xAB,
    'jmp': 0xE9,
    'jmp(word)': 0xEA,
    'call(word)': 0x9A,
    'not': 0xF6,
    'neg': 0xF6,
    'sbb': 0x18,
    'aaa': 0x37,
    'daa': 0x27,
    'lds': 0xC5,
    'les': 0xC4,
    'push(seg)': 0x06,
    'pop(seg)': 0x07,
    'add_al': 0x4,
    'add_ax': 0x4,
    'adc_al': 0x14,
    'adc_ax': 0x14,
    'movi': 0xC6,
    'hlt': 0xF4,
    'or_al': 0x0C,
    'or_ax': 0x0D,
    'xor_al': 0x34,
    'xor_ax': 0x35,
    'test_al': 0xA8,
    'test_ax': 0xA8,
    'jz': 0x74,
    'je': 0x74,
    'jl': 0x7C,
    'jle': 0x7E,
    'jb': 0x72,
    'jbe': 0x76,
    'jp': 0x7A,
    'jo': 0x70,
    'js': 0x78,
    'jne': 0x75,
    'jnl': 0x7D,
    'jnle': 0x7F,
    'jnb': 0x72,
    'jnbe': 0x77,
    'jnp': 0x7B,
    'jno': 0x71,
    'jns': 0x79
    
    
    
}

BaseOpcodeLength = {
    'inc': 1,
    'add': 2,
    'or': 2,
    'and': 2,
    'adc': 2,
    'push': 1,
    'pop': 1,
    'xor': 2,
    'in': 2,
    'out': 2,
    'xlat': 1,
    'pushf': 1,
    'popf': 1,
    'int': 2,
    'not': 2,
    'neg': 2,
    'sbb': 2,
    'lds': 2,
    'les': 2,
    'mov': 2

}

AssemblerDirectives = ['db', 'dw', 'dd', 'dq']

Opcode2x2 = [
    'add', 'adc', 'mov', 'xor', 'and', 'or', 'not', 'neg', 'sbb', 'lds', 'les', 'cmp'
]

Opcode1x0 = [
    'sti', 'xlat', 'pushf', 'popf', 'sahf', 'lahf', 'ret', 'into', 'iret', 'clc', 'cmc', 'stc',
    'cld', 'std', 'cli', 'sti', 'aaa', 'daa', 'hlt'
]

OpcodeAccumulatorOperation = [
    'add_al',
    'add_ax',
    'adc_al',
    'adc_ax',
    'mov_al',
    'mov_ax',
    'or_ax',
    'or_al',
    'xor_al',
    'xor_ax',
    'test_ax',
    'test_al'
]

OpcodeImmediateOperation = [
    'movi'
]

Opcode1x1 = [
    'push', 'pop', 'inc', 'dec',
]

OpcodeConstArgument8Bit = ['int', 'in', 'out']
OpcodeFlowControl = ['jmp']
OpcodeFlowControl8BitJump = ['jz', 'je', 'jl', 'jle', 'jb', 'jbe', 'jp', 'jo', 'js', 'jne', 'jnl', 'jnle', 'jnb', 'jnbe', 'jnp', 'jno', 'jns']
OpcodeFlowControlFar = ['jmp(word)', 'call(word)']

OpcodeStringManipulation = [
    'movsb', 'movsw', 'cmpsb', 'cmpsw', 'scasb', 'scasw', 'lodsb', 'lodsw', 'stdsb', 'stdsw'
]

OpcodeSegmentStackOperation = [
    'pop(seg)', 'push(seg)'
]

x86Sizes = {

    'b': 1,
    'w': 2,
    'd': 4,
    'q': 8
    
}

module.exports = {
    Opcode,
    BaseOpcodeLength
}
