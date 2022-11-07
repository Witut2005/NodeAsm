const fs = require('fs')
const { exit } = require('process')
const { Opcode } = require('./opcode.js')
const { RegisterName, RegisterNameMode2 } = require('./registers.js')
const { exec } = require('child_process')
const { ifError } = require('assert')

global.CurrentOpcode = undefined
global.CurrentDest = undefined
global.CurrentSrc = undefined
global.DataFieldPresent = false
global.IsDestMemoryOperator = false
global.IsSrcMemoryOperator = false
global.ImmediateOperator = { false: 0 }
global.Displacement = false
global.DisplacementBase = undefined
global.CurrentLineNumber = 0
global.ConstantValue = 0
global.MemoryOperation16BitBoundary = false
global.SegmentOverridePrefix = false

RemoveOutputFile = () =>
    exec('rm output', (error, stdout, stderr) => {
        if (error)
            console.error(error)
        else if (stdout)
            console.log(stdout)
        else if (stderr)
            console.log(stderr)
    })

shrinkArray = (array, newSize) => {
    while (array.length > newSize)
        array.pop()
    return array
}
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

    assemble_instruction(opcode, dest, src, opcode_len = undefined) {


        if (global.IsDestMemoryOperator && global.IsSrcMemoryOperator) {
            console.error('ERROR: two memory operands (x86 supports only one in given opcode)')
            exit(3)
        }

        this.OpcodeMode = IsDestMemoryOperator | IsSrcMemoryOperator
        if (!this.OpcodeMode)
            this.OpcodeMode = 3
        else if (Displacement.true != undefined && isNaN(Displacement.true.value) == false) {
            this.OpcodeMode = 2
        } else
            this.OpcodeMode = 0

        console.log('opcode mode %d', this.OpcodeMode)
        this.RegisterIndexDest = Object.keys(RegisterName).indexOf(dest)
        this.RegisterIndexSrc = Object.keys(RegisterName).indexOf(src)

        if (this.OpcodeMode == 2) {
            let Tmp = Object.keys(RegisterNameMode2).indexOf(global.DisplacementBase)
            if (Tmp == undefined) {
                console.error('Tmp value %d', Tmp)
                console.error('Displacment Base Error: Invalid operand (Line: %d)', Number(global.CurrentLineNumber))
                RemoveOutputFile()
                exit(3)
            }
        }



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
        } else
            this.OpcodeDestinationBit = 2

        this.FinalCpuInstruction = []
        if (Opcode2x2.indexOf(opcode) != -1) {

            this.DataFieldPresent = false

            if (RegisterName[dest] != undefined) {
                this.data = Number(dest)
                this.DataFieldPresent = true
            }

            if (RegisterName[src] != undefined) {
                this.data = Number(src)
                this.DataFieldPresent = true
            }

            this.FinalCpuInstruction.length = 2 + ((global.ImmediateOperator == undefined ? 0 : 1) * 2)

            if (this.OpcodeMode == 3) {
                this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                this.FinalCpuInstruction[1] = this.OpcodeMode << 6 | RegisterName[dest] << 3 | RegisterName[src]
                this.FinalCpuInstruction = shrinkArray(this.FinalCpuInstruction, 2)
            } else if (this.OpcodeMode == 0 && global.ImmediateOperator.true == undefined) {
                this.FinalCpuInstruction.length = 2 + global.SegmentOverridePrefix != false ? 1 : 0;
                if (!this.OpcodeDestinationBit)
                    [src, dest] = [dest, src]
                let CurrentByte = 0

                if (global.SegmentOverridePrefix != false)
                    this.FinalCpuInstruction[CurrentByte++] = global.SegmentOverridePrefix

                this.FinalCpuInstruction[CurrentByte++] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                this.FinalCpuInstruction[CurrentByte++] = this.OpcodeMode << 6 | RegisterName[dest] << 3 | RegisterName[src]
            } else if (global.ImmediateOperator.true != undefined) {
                console.log('HALLO', global.ImmediateOperator.true)
                this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                this.FinalCpuInstruction[1] = this.OpcodeMode << 6
                if (global.IsDestMemoryOperator)
                    this.FinalCpuInstruction[1] |= RegisterName[src] << 3 | 6
                else
                    this.FinalCpuInstruction[1] |= RegisterName[dest] << 3 | 6

                this.FinalCpuInstruction[2] = global.ImmediateOperator.true & 0xFF
                this.FinalCpuInstruction[3] = (global.ImmediateOperator.true >> 8) & 0xFF
            } else if (this.OpcodeMode == 2) {
                this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                this.FinalCpuInstruction[1] = this.OpcodeMode << 6
                if (Displacement.true.IsDestinationOperand)
                    this.FinalCpuInstruction[1] |= RegisterNameMode2[global.DisplacementBase] | RegisterName[src] << 3
                else
                    this.FinalCpuInstruction[1] |= RegisterNameMode2[global.DisplacementBase] | RegisterName[dest] << 3

                this.FinalCpuInstruction[2] = global.Displacement.true.value & 0xFF
                this.FinalCpuInstruction[3] = (global.Displacement.true.value >> 8) & 0xFF
            }



            if (opcode == 'test') {
                this.FinalCpuInstruction.length += 2
                if (global.ImmediateOperator.true == undefined)
                    this.FinalCpuInstruction[1] = (this.FinalCpuInstruction[1] & 0xC0) | ((this.FinalCpuInstruction[1] & (0x7 << 3)) >> 3) | AdditionalOpcodesFieldValues[opcode] << 3
                else
                    this.FinalCpuInstruction[1] |= AdditionalOpcodesFieldValues[opcode] << 3
                this.FinalCpuInstruction[0] |= global.MemoryOperation16BitBoundary

                if (global.MemoryOperation16BitBoundary) {
                    this.FinalCpuInstruction[this.FinalCpuInstruction.length - 2] = global.ConstantValue & 0xFF
                    this.FinalCpuInstruction[this.FinalCpuInstruction.length - 1] = (global.ConstantValue >> 8) & 0xFF
                } else
                    this.FinalCpuInstruction[this.FinalCpuInstruction.length - 1] = global.ConstantValue & 0xFF
            } else if (AdditionalOpcodes.indexOf(opcode) != -1) {
                if (global.ImmediateOperator.true == undefined)
                    this.FinalCpuInstruction[1] = (this.FinalCpuInstruction[1] & 0xC0) | ((this.FinalCpuInstruction[1] & (0x7 << 3)) >> 3) | AdditionalOpcodesFieldValues[opcode] << 3
                else
                    this.FinalCpuInstruction[1] |= AdditionalOpcodesFieldValues[opcode] << 3
                this.FinalCpuInstruction[0] |= global.MemoryOperation16BitBoundary
            }


            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)
        } else if (Opcode1x0.indexOf(opcode) != -1) {

            this.FinalCpuInstruction.length = 1
            this.FinalCpuInstruction[0] = Opcode[opcode]
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, 1)

        } else
        if (Opcode1x1.indexOf(opcode) != -1) {

            this.FinalCpuInstruction.length = 1
            this.FinalCpuInstruction[0] = Opcode[opcode] | RegisterName[dest]
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, 1)

        } else if (OpcodeConstArgument8Bit.indexOf(opcode) != -1) {

            this.FinalCpuInstruction.length = 2
            this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit
            this.FinalCpuInstruction[1] = global.ConstantValue
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)

        } else if (OpcodeStringManipulation.indexOf(opcode) != -1) {
            this.FinalCpuInstruction.length = 1
            if (opcode.charAt(-1) == 'w')
                this.Opcode16Bit = true
            this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)

        } else if (OpcodeFlowControl8BitJump.indexOf(opcode) != -1) {
            this.FinalCpuInstruction.length = 2

            if (global.CurrentDest == '$')
                global.ConstantValue = -this.FinalCpuInstruction.length

            this.FinalCpuInstruction[0] = Opcode[opcode]
            this.FinalCpuInstruction[1] = global.ConstantValue & 0xFF
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)

        } else if (OpcodeFlowControl.indexOf(opcode) != -1) {

            this.FinalCpuInstruction.length = 3

            if (global.CurrentDest == '$')
                global.ConstantValue = -this.FinalCpuInstruction.length

            this.FinalCpuInstruction[0] = Opcode[opcode]
            this.FinalCpuInstruction[1] = global.ConstantValue & 0xFF
            this.FinalCpuInstruction[2] = (global.ConstantValue >> 8)
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)

        } else if (OpcodeFlowControlFar.indexOf(opcode) != -1) {
            this.FinalCpuInstruction.length = 5
            this.FinalCpuInstruction[0] = Opcode[opcode]
            this.FinalCpuInstruction[1] = Number(CurrentDest.slice(CurrentDest.indexOf(':') + 1, CurrentDest.length)) & 0xFF
            this.FinalCpuInstruction[2] = (Number(CurrentDest.slice(CurrentDest.indexOf(':') + 1, CurrentDest.length)) >> 8) & 0xFF
            this.FinalCpuInstruction[3] = Number(CurrentDest.slice(0, CurrentDest.indexOf(':'))) & 0xFF
            this.FinalCpuInstruction[4] = (Number(CurrentDest.slice(0, CurrentDest.indexOf(':'))) >> 8) & 0xFF
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)
        } else if (OpcodeSegmentStackOperation.indexOf(opcode) != -1) {
            this.FinalCpuInstruction.length = 1
            this.FinalCpuInstruction[0] = Opcode[opcode] | ((SegmentRegisterName[CurrentDest] & 0b11) << 3)
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)
        } else if (OpcodeAccumulatorOperation.indexOf(opcode) != -1) {

            if (opcode.charAt(opcode.length - 1) == 'x')
                this.Opcode16Bit = 1
            else
                this.Opcode16Bit = 0

            this.FinalCpuInstruction.length = 2 + this.Opcode16Bit

            this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit
            this.FinalCpuInstruction[1] = global.ConstantValue & 0xFF
            if (this.Opcode16Bit == 1)
                this.FinalCpuInstruction[2] = (global.ConstantValue >> 8) & 0xFF
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)
        } else if (OpcodeImmediateOperation.indexOf(opcode) != -1) {

            try {

                if (global.CurrentDest.at(-1) == 'l' || global.CurrentDest.at(-1) == 'h')
                    this.Opcode16Bit = 0
                else
                    this.Opcode16Bit = 1
            } catch (error) {
                console.log('CurrentDest=undefined')
            }

            this.FinalCpuInstruction.length = (2) + (1 + this.Opcode16Bit)
            if (global.Displacement.true != undefined)
                this.FinalCpuInstruction.length += 2

            if (this.OpcodeMode == 3) {
                this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                this.FinalCpuInstruction[1] = this.OpcodeMode << 6 | RegisterName[dest]
                this.FinalCpuInstruction[2] = global.ConstantValue & 0xFF

                if (this.Opcode16Bit)
                    this.FinalCpuInstruction[3] = (global.ConstantValue >> 8) & 0xFF
            } else if (global.ImmediateOperator.true && this.OpcodeMode == 0) {

                if (global.MemoryOperation16BitBoundary)
                    this.Opcode16Bit = 1
                else
                    this.Opcode16Bit = 0

                this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                this.FinalCpuInstruction[1] = this.OpcodeMode << 6 | 6
                this.FinalCpuInstruction[2] = global.ImmediateOperator.true & 0xFF
                this.FinalCpuInstruction[3] = (global.ImmediateOperator.true >> 8) & 0xFF
                this.FinalCpuInstruction[4] = global.ConstantValue & 0xFF
                if (this.Opcode16Bit)
                    this.FinalCpuInstruction[5] = (global.ConstantValue >> 8) & 0xFF
            } else if (this.OpcodeMode == 0) {

                if (global.MemoryOperation16BitBoundary)
                    this.Opcode16Bit = 1
                else
                    this.Opcode16Bit = 0

                this.FinalCpuInstruction.length = 3 + this.Opcode16Bit
                this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                this.FinalCpuInstruction[1] = this.OpcodeMode << 6 | RegisterName[dest]
                this.FinalCpuInstruction[2] = global.ConstantValue & 0xFF
                if (this.Opcode16Bit)
                    this.FinalCpuInstruction[3] = (global.ConstantValue >> 8) & 0xFF
            } else if (this.OpcodeMode == 2) {
                this.FinalCpuInstruction[0] = Opcode[opcode] | this.Opcode16Bit | this.OpcodeDestinationBit
                this.FinalCpuInstruction[1] = this.OpcodeMode << 6
                if (Displacement.true.IsDestinationOperand)
                    this.FinalCpuInstruction[1] |= RegisterNameMode2[global.DisplacementBase]
                else
                    this.FinalCpuInstruction[1] |= RegisterNameMode2[global.DisplacementBase]

                this.FinalCpuInstruction[2] = global.Displacement.true.value & 0xFF
                this.FinalCpuInstruction[3] = (global.Displacement.true.value >> 8) & 0xFF
                this.FinalCpuInstruction[4] = global.ConstantValue & 0xFF
                if (this.Opcode16Bit)
                    this.FinalCpuInstruction[5] = (global.ConstantValue >> 8) & 0xFF
            }
            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)
        } else if (AssemblerDirectives.indexOf(opcode) != -1) {

            if (opcode.charAt(opcode.length - 1) == 'b' && global.CurrentDest.charCodeAt(0) == 0x22 && global.CurrentDest.charCodeAt(global.CurrentDest.length - 1) == 0x22) {
                this.FinalCpuInstruction.length = global.CurrentDest.length - 2
                for (let i = 1; i < global.CurrentDest.length - 1; i++) {
                    this.FinalCpuInstruction[i - 1] = global.CurrentDest.charCodeAt(i)
                    console.log(global.CurrentDest[i])
                }
            } else {
                this.FinalCpuInstruction.length = x86Sizes[opcode.charAt(opcode.length - 1)]

                for (let i = 0; i < this.FinalCpuInstruction.length; i++) {
                    this.FinalCpuInstruction[i] = global.ConstantValue & 0xFF
                    global.ConstantValue = global.ConstantValue >> 8

                }
            }

            fs.writeSync(this.OutputFile, new Int8Array(this.FinalCpuInstruction), 0, this.FinalCpuInstruction.length)

        } else {
            console.error('ERROR')
            exit(3)
        }


    }
}
global.CodeAssembler = new Assembler()

CheckIfImmediateOperator = (Argument) => {
    if (Argument.charAt(0) == '[' && Argument.charAt(Argument.length - 1) == ']') {
        tmp = Argument
        tmp = tmp.replace('[', '')
        tmp = tmp.replace(']', '')

        if (isNaN(Number(tmp)))
            return { false: 0 }
        else
            return { true: Number(tmp) }
    }
    return { false: 0 }
}
CheckIfDisplacementPresent = (Argument, IsDest) => {
    Argument = Argument.replace(' ', '')
    console.log('fromini: ', Argument)

    DisplacementSignIndex = Argument.lastIndexOf('-') == -1 ? Argument.lastIndexOf('+') : Argument.lastIndexOf('-')

    if (DisplacementSignIndex == -1)
        return { false: 0 }
    DisplacementSign = Argument[DisplacementSignIndex]

    if (DisplacementSign == '+')
        DisplacementSign = 1
    else
        DisplacementSign = -1

    console.log("displacement sign: ", Argument[DisplacementSignIndex])
    console.log("displacement value: %s", Argument.slice(DisplacementSignIndex + 1, -1).toString(16))
    global.DisplacementBase = Argument.slice(1, DisplacementSignIndex)

    console.log("displacement base: %s", global.DisplacementBase)

    return { true: { value: DisplacementSign * Number(Argument.slice(DisplacementSignIndex + 1, -1).toString(16)), IsDestinationOperand: IsDest } }


}

CheckIfSegmentOverridePrefixPresent = (Argument) => {
    let OverridePrefix = Argument.slice(1, Argument.indexOf(':'))
    if (SegmentOverridePrefixValues[OverridePrefix] != undefined) {
        return SegmentOverridePrefixValues[OverridePrefix];
    }
    return false;

}

GetInstructionArguments = (Line) => {

    LineElements = Lines[Line].split(' ')

    for (Element in LineElements) {
        if (Element == 0) {
            global.CurrentOpcode = LineElements[Element]
        } else {
            console.log(LineElements[Element])
            if (LineElements[Element] == 'byte') {
                global.MemoryOperation16BitBoundary = false
            } else if (LineElements[Element] == 'word') {
                global.MemoryOperation16BitBoundary = true
            } else if (global.CurrentDest == undefined)
                global.CurrentDest = String(LineElements[Element])
            else
                global.CurrentSrc = String(LineElements[Element])
        }
    }


    if (global.CurrentDest != undefined) {
        if (global.CurrentDest.charAt(0) == '[' && global.CurrentDest.charAt(global.CurrentDest.length - 1) == ']') {
            global.IsDestMemoryOperator = true;
            global.Displacement = CheckIfDisplacementPresent(global.CurrentDest, true)
            if (global.Displacement.true == undefined)
                global.ImmediateOperator = CheckIfImmediateOperator(global.CurrentDest)
        }
        if (isNaN(Number(global.CurrentDest)) == false)
            global.ConstantValue = Number(global.CurrentDest)

        global.SegmentOverridePrefix = CheckIfSegmentOverridePrefixPresent(global.CurrentDest)

        if (global.SegmentOverridePrefix)
            CurrentDest = '[' + CurrentDest.slice(CurrentDest.indexOf(':') + 1, CurrentDest.length)
        console.log('AHA', CurrentDest)
    }

    if (global.CurrentSrc != undefined) {
        if (global.CurrentSrc.charAt(0) == '[' && global.CurrentSrc.charAt(global.CurrentSrc.length - 1) == ']') {
            global.IsSrcMemoryOperator = true
            if (global.Displacement != undefined)
                global.Displacement = CheckIfDisplacementPresent(global.CurrentSrc, false)
            if (global.ImmediateOperator.true == undefined && global.Displacement.true == undefined)
                global.ImmediateOperator = CheckIfImmediateOperator(global.CurrentSrc)
                // console.log(global.ImmediateOperator)
        }
        if (isNaN(Number(global.CurrentSrc)) == false)
            global.ConstantValue = Number(global.CurrentSrc)

        if (!global.SegmentOverridePrefix) {
            global.SegmentOverridePrefix = CheckIfSegmentOverridePrefixPresent(global.CurrentSrc)

            if (global.SegmentOverridePrefix)
                CurrentSrc = '[' + CurrentSrc.slice(CurrentSrc.indexOf(':') + 1, CurrentSrc.length)
            console.log('AHA', CurrentSrc)
        }
    }
    console.log(global.ImmediateOperator)

    global.CurrentLineNumber++;
    CodeAssembler.assemble_instruction(global.CurrentOpcode, global.CurrentDest, global.CurrentSrc, global.BaseOpcodeLength[global.CurrentOpcode] + global.DataFieldPresent * 2)

    global.CurrentOpcode = undefined
    global.CurrentDest = undefined
    global.CurrentSrc = undefined
    global.DataFieldPresent = false
    global.IsDestMemoryOperator = false
    global.IsSrcMemoryOperator = false
    global.ImmediateOperator = { false: 0 }
    global.Displacement = { false: 0 }
    global.ConstantValue = undefined
    global.MemoryOperation16BitBoundary = false
    global.SegmentOverridePrefix = false


}



module.exports = {
    Assembler,
    CurrentOpcode,
    CurrentDest,
    CurrentSrc,
    DataFieldPresent

}