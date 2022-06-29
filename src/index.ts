import inquirer, { Answers } from 'inquirer';

/** Files manipulation */
import fs from 'fs-extra'
const { readJson, ensureDir, remove, writeJson } = fs
import path from 'path'

/** Helpers */
import { CONFIG, isConfigValid } from './helpers/CONFIG.js'
import { RESULT } from './helpers/RESULT.js';

/** Modules */
import { BlockchainTester } from './modules/blockchain-tester.js';
import { FileTester } from './modules/file-tester.js';

/** Start the Server */
const start = async (): Promise<void> => {
  try {
    const answers: Answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'debugMode',
        message: 'Run in debug mode?',
        default: false,
      },
      {
        type: 'input',
        name: 'usernameRegex',
        message: 'What username regex would you like to test?',
        default: '^(?=.{3,16}$)[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){2,}([\.](?=[a-z][0-9a-z\-][0-9a-z\-])[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){1,}){0,}$',
      },
      {
        type: 'confirm',
        name: 'reinitBlockchainResult',
        message: 'Reinit last HIVE blockchain results?',
        default: false,
      }, 
      {
        type: 'confirm',
        name: 'blockchainTester',
        message: 'Test all usernames in the HIVE blockchain?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'reinitFileResult',
        message: 'Reinit last File results?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'generateFile',
        message: 'Generate a username file?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'fileTester',
        message: 'Test the file generated?',
        default: false,
      },
    ])

    /** Read and validate the config file */
    const config: CONFIG = await readJson(path.join(path.resolve(path.dirname('')), './config/config.json'))
    const validConfig    = await isConfigValid(config)

    /** set Debug Mode if asked */
    if(answers.debugMode) {
      process.env.APP_DEBUG = 'ALL'
    }

    /** Prepare blockchain result file & Start the blockchain tester if asked */
    const blockchain_result: RESULT = {
      last_username: "",
      nb_tested: 0,
      nb_passed: 0,
      nb_error:  0,
      list_not_passed: []
    }
    await ensureDir(path.join(path.resolve(path.dirname('')), './results'))
    readJson(path.join(path.resolve(path.dirname('')), './results/blockchain.json'), async (err) => {
      try {
        if(err) {
          await writeJson(path.join(path.resolve(path.dirname('')), './results/blockchain.json'), blockchain_result)
        } else if(answers.reinitBlockchainResult) {
          await remove(path.join(path.resolve(path.dirname('')), './results/blockchain.json'))
          await writeJson(path.join(path.resolve(path.dirname('')), './results/blockchain.json'), blockchain_result)
        }

        /** Start the blockchain tester if asked */
        if(answers.blockchainTester) {
          new BlockchainTester(validConfig, answers.usernameRegex)
        }
      } catch (e) {
        if (e instanceof Error) {
          console.log('\x1b[31m%s\x1b[0m', `Error: ${e.message}`)
          if (process.env.APP_DEBUG) console.log('\x1b[33m%s\x1b[0m', 'Stack:', e.stack ? e.stack : 'No info')
        } else {
          if (process.env.APP_DEBUG) console.log(e)
        }
      }
    })


    /** Prepare file result file & Start the file tester if asked */
    const file_result: RESULT = {
      last_username: "",
      nb_tested: 0,
      nb_passed: 0,
      nb_error:  0,
      list_not_passed: []
    }
    readJson(path.join(path.resolve(path.dirname('')), './results/file.json'), async (err) => {
      try {
        if(err) {
          await writeJson(path.join(path.resolve(path.dirname('')), './results/file.json'), file_result)
        } else if(answers.reinitFileResult) {
          await remove(path.join(path.resolve(path.dirname('')), './results/file.json'))
          await writeJson(path.join(path.resolve(path.dirname('')), './results/file.json'), file_result)
        }

        /** Start the file tester if asked */
        if(answers.fileTester) {
          new FileTester(validConfig, answers.usernameRegex, answers.generateFile)
        }
      } catch (e) {
        if (e instanceof Error) {
          console.log('\x1b[31m%s\x1b[0m', `Error: ${e.message}`)
          if (process.env.APP_DEBUG) console.log('\x1b[33m%s\x1b[0m', 'Stack:', e.stack ? e.stack : 'No info')
        } else {
          if (process.env.APP_DEBUG) console.log(e)
        }
      }
    })
  } catch (e) {
    if (e instanceof Error) {
      console.log('\x1b[31m%s\x1b[0m', `Error: ${e.message}`)
      if (process.env.APP_DEBUG) console.log('\x1b[33m%s\x1b[0m', 'Stack:', e.stack ? e.stack : 'No info')
    } else {
      if (process.env.APP_DEBUG) console.log(e)
    }
  }
}
start()