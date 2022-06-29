import assert from 'assert'

import Chance from 'chance'

/** Files manipulation */
import fs from 'fs-extra'
const { readJson, writeJson } = fs
import path from 'path'

/** Generic Helpers */
import { CONFIG } from '../helpers/CONFIG'
import { RESULT } from '../helpers/RESULT'

export class FileTester {
  chance = new Chance()

  usernameRegex!: string
  username: string|null = null

  config!: CONFIG
  result?: RESULT

  constructor(config: CONFIG, usernameRegex: string, generateFile: boolean) {
    this.config = config
    this.usernameRegex = usernameRegex

    /** Read the last result file */
    readJson(path.join(path.resolve(path.dirname('')), './results/file.json'), async (err, result) => {
      if(err) {
        console.log('\x1b[31m%s\x1b[0m', `Error: ${err.message}`)
        if (process.env.APP_DEBUG) console.log('\x1b[33m%s\x1b[0m', 'Stack:', err.stack ? err.stack : 'No info')
        process.exit(1)
      } else {
        this.result = result
        this.start(generateFile)
      }
    })
  }

  isUsernameValid = (value: string): boolean => {
    try {
      assert(value !== undefined && value !== null && value.toString().length !== 0, `${value} can't be tested!`)
      let result = false
      const re = new RegExp(this.usernameRegex)
      result = re.test(value)
      if(result) {
        return true
      } else {
        return false
      } 
    } catch (e) {
      return false
    }
  }

  start(generateFile: boolean): void {
    readJson(path.join(path.resolve(path.dirname('')), './config/usernames.json'), async (err) => {
      try {
        if(err) {
          await this.generateFile()
        } else {
          /** Generate the file if asked */
          if(generateFile) {
            await this.generateFile()
          }
        }

        /** Process */
        console.log("start")
        this.testUsername()

      } catch (e) {
        if (e instanceof Error) {
          console.log('\x1b[31m%s\x1b[0m', `Error: ${e.message}`)
          if (process.env.APP_DEBUG) console.log('\x1b[33m%s\x1b[0m', 'Stack:', e.stack ? e.stack : 'No info')
        } else {
          if (process.env.APP_DEBUG) console.log(e)
        }
      }
    })
  }

  generateUsername(): Promise<string> {
    return new Promise( async (resolve, reject) => {
      try {
        let username = this.chance.character({ pool: 'abcdefghijklmnopqrstuvwxyz0123456789.-' })
        for (let index = 0; index < this.chance.integer({ min: 3, max: 16 }); index++) {
          username += this.chance.character({ pool: 'abcdefghijklmnopqrstuvwxyz0123456789.-' })
        }
        resolve(username)
      } catch (e) {
        reject(e)
      }
    })
  }

  generateFile(): Promise<void> {
    return new Promise( async (resolve, reject) => {
      try {
        const usernames: Array<string> = []
        let counter = 0
        while (counter <= this.config.NUMBER_USERNAME_TO_GENERATE) {
          usernames.push(await this.generateUsername())
          counter++
        }
        await writeJson(path.join(path.resolve(path.dirname('')), './config/usernames.json'), usernames)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  testUsername(): Promise<void> {
    return new Promise( async (resolve, reject) => {
      /** Define start hrtime */
      const hrtime = process.hrtime()
      readJson(path.join(path.resolve(path.dirname('')), './config/usernames.json'), async (err, result) => {
        try {
          for await (const a of result) {
            this.result!.last_username = a
            this.result!.nb_tested += 1
            this.username = a

            if(this.isUsernameValid(a)) {
              this.result!.nb_passed += 1
            } else {
              this.result!.nb_error += 1
              this.result!.list_not_passed.push(a)
              console.log(`\x1b[31m${this.username}\x1b[0m invalid username`)
            }
          }

          /** Update result file */
          await writeJson(path.join(path.resolve(path.dirname('')), './results/blockchain.json'), this.result)

          /** Delay treatment POST */
          const hrtimeEnd = process.hrtime(hrtime)
          const milli  = (hrtimeEnd[0] * 1e9 + hrtimeEnd[1]) / 1e6
          console.log(`${this.result!.nb_tested} accounts => \x1b[1;33m${ milli } ms\x1b[0m | nb_error = \x1b[31m${this.result!.nb_error}\x1b[0m | last \x1b[1;36m${this.username}\x1b[0m`)

          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })
  }

}