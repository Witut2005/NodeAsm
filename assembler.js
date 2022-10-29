const fs = require('fs')
const { exit } = require('process')
const { Opcode } = require('./opcode.js')
const { RegisterName } = require('./registers.js')
const { exec } = require('child_process')
const { ifError } = require('assert')

global.CurrentOpcode = undefined
global.CurrentDest = undefined
global.CurrentSrc = undefined
global.DataFieldPresent = false
global.IsDestMemoryOperator = false
global.IsSrcMemoryOperator = false
global.ImmediateOperator = false
global.CurrentLineNumber = 0

RemoveOutputFile = () =>
    exec('rm output', (error, stdout, stderr) => {
        if (error)
            console.error(error)
        else if (stdout)
            console.log(stdout)
        else if (stderr)
            console.log(stderr)
    })

class Assembler {


    file_name = undefined
    OutputFile = undefined

    constructor() {
        this.OutputFile = fs.openSync('output', 'w+', 777)
        exec('chmod 777 output', (error, stdout, stderr) => {
            if (error)
                console.error(error)
            else if (stdout)
                console.log(stdout)
            else if (stderr)
                console.log(stderr)
        })
    }

    assemble_instruction(opcode, dest, src, opcode_args, opcode_len = undefined) {

        console.log(opcode_len)

        if (global.IsDestMemoryOperator && global.IsSrcMemoryOperator) {
            console.error('ERROR: two memory operands (x86 supports only one in given opcode)')
            exit(3)
        }

        this.OpcodeMode = IsDestMemoryOperator | IsSrcMemoryOperator
        if (!this.OpcodeMode)
            this.OpcodeMode = 3
        else
            this.OpcodeMode = 0

        // console.log(typeof(RegisterName))

        this.RegisterIndexDest = Object.keys(RegisterName).indexOf(dest)
        this.RegisterIndexSrc = Object.keys(RegisterName).indexOf(src)

        if (!global.ImmediateOperator) {
            if ((this.RegisterIndexDest == -1 && opcode_args >= 1) || (this.RegisterIndexSrc == -1 && opcode_args == 2)) {
                console.error('Invalid operand (Line: %d)', Number(global.CurrentLineNumber))
                RemoveOutputFile()
                exit(3)
            }
        }

        if ((this.RegisterIndexDest > 7 && this.RegisterIndexDest < 15) || (this.RegisterIndexSrc > 7 && this.RegisterIndexSrc < 15))
            this.Opcode16Bit = true
        else
            this.Opcode16Bit = false

        if (this.Opcode16Bit && ((this.RegisterIndexDest > 15 && this.RegisterIndexDest < 22) || (this.RegisterIndexSrc > 15 && this.RegisterIndexSrc < 22))) {
            console.error('2Invalid operand (Line: %d)', Number(global.CurrentLineNumber))
            RemoveOutputFile()
            exit(3)
        }


        if (global.IsDestMemoryOperator == true) {
            this.OpcodeDestinationBit = 0;
            [src, dest] = [dest, src]
        } else {
            this.OpcodeDestinationBit = 2
        }


        switch (opcode) {
            case 'inc':
                {
                    this.FinalCpuInstruction = new Int8Array(1)
                    this.FinalCpuInstruction[0] = Opcode[opcode] | RegisterName[dest]
                    fs.writeSync(this.OutputFile, this.FinalCpuInstruction, 0, this.FinalCpuInstruction.length)
                    break
                }

            case 'add':
                {

                    this.DataFieldPresent = false

                    if (RegisterName[dest] != undefined) {
                        this.data = Number(dest)
                        this.DataFieldPresent = true
                    }

                    if (RegisterName[src] != undefined) {
                        this.data = Number(src)
                        this.DataFieldPresent = true
                    }

                    this.FinalCpuInstruction = new Int8Array(opcode_len + ((global.ImmediateOperator.true == undefined ? 0 : 1) * 2))

                    if (global.ImmediateOperator.true) {
                        this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                        this.FinalCpuInstruction[1] = this.OpcodeMode << 6
                        if (global.IsDestMemoryOperator)
                            this.FinalCpuInstruction[1] |= RegisterName[src] << 3 | 6
                        else
                            this.FinalCpuInstruction[1] |= RegisterName[dest] << 3 | 6

                        this.FinalCpuInstruction[2] = global.ImmediateOperator.true & 0xFF
                        this.FinalCpuInstruction[3] = (global.ImmediateOperator.true >> 8) & 0xFF
                    } else {
                        this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                        this.FinalCpuInstruction[1] = this.OpcodeMode << 6 | RegisterName[dest] << 3 | RegisterName[src]

                    }

                    // console.log(dest)

                    fs.writeSync(this.OutputFile, this.FinalCpuInstruction, 0, this.FinalCpuInstruction.length)
                    break
                }

            case 'sti':
                {
                    this.FinalCpuInstruction = new Int8Array(1)
                    this.FinalCpuInstruction[0] = Opcode['sti']
                    fs.writeSync(this.OutputFile, this.FinalCpuInstruction, 0, 1)
                    break
                }
        }
        delete this.FinalCpuInstruction
    }

}
global.CodeAssembler = new Assembler()

CheckIfImmediateOperator = (Argument) => {
    if (Argument.charAt(0) == '[' && Argument.charAt(Argument.length - 1) == ']') {
        tmp = Argument
        tmp = tmp.replace('[', '')
        tmp = tmp.replace(']', '')
        return { true: Number(tmp) }
    }
    return { false: 0 };
}


GetInstructionArguments = (Line) => {


    LineElements = Lines[Line].split(' ')

    for (Element in LineElements) {

        if (Element == 0) {
            global.CurrentOpcode = LineElements[Element]
        } else {
            if (global.CurrentDest == undefined)
                global.CurrentDest = String(LineElements[Element])
            else
                global.CurrentSrc = String(LineElements[Element])
        }
    }

    if (global.CurrentDest != undefined) {
        if (global.CurrentDest.charAt(0) == '[' && global.CurrentDest.charAt(global.CurrentDest.length - 1) == ']') {
            global.IsDestMemoryOperator = true;
            global.ImmediateOperator = CheckIfImmediateOperator(global.CurrentDest)
        }
    }

    if (global.CurrentSrc != undefined) {
        if (global.CurrentSrc.charAt(0) == '[' && global.CurrentSrc.charAt(global.CurrentSrc.length - 1) == ']') {
            global.IsSrcMemoryOperator = true
            if (global.ImmediateOperator.true == undefined)
                global.ImmediateOperator = CheckIfImmediateOperator(global.CurrentSrc)
                // console.log(global.ImmediateOperator)
        }
    }

    console.log(global.ImmediateOperator)

    global.CurrentLineNumber++;
    CodeAssembler.assemble_instruction(global.CurrentOpcode, global.CurrentDest, global.CurrentSrc, global.OpcodeArguments[global.CurrentOpcode], global.BaseOpcodeLength[global.CurrentOpcode] + global.DataFieldPresent * 2)

    global.CurrentOpcode = undefined
    global.CurrentDest = undefined
    global.CurrentSrc = undefined
    global.DataFieldPresent = false
    global.IsDestMemoryOperator = false
    global.IsSrcMemoryOperator = false
    global.ImmediateOperator = undefined


}



module.exports = {
    Assembler,
    CurrentOpcode,
    CurrentDest,
    CurrentSrc,
    DataFieldPresent

}