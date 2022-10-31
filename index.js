const fs = require('fs')
const { ArgumentParser } = require('argparse')
const { exit } = require('process')
const { Assembler, CurrentOpcode, CurrentDest, CurrentSrc, DataFieldPresent } = require('./assembler.js')
const { BaseOpcodeLength } = require('./opcode.js')


MainArgumentParser = ArgumentParser()
MainArgumentParser.add_argument('-file', { required: true })

Argument = MainArgumentParser.parse_args()

var FileContent = null

FileContent = fs.readFileSync(Argument['file']).toString()

Lines = FileContent.split('\n')


for (CurrentLine in Lines) {


    console.log(Lines[CurrentLine])
    if (Lines[CurrentLine].split(' ') == '')
        continue

    // console.log(BaseOpcodeLength[CurrentOpcode])
    GetInstructionArguments(CurrentLine)

}