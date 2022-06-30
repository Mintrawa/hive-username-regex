import assert from 'assert'

/** Files manipulation */
import fs from 'fs-extra'
const { readJson, writeJson } = fs
import path from 'path'

/** jsonRpc */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

/** Generic Helpers */
import { CONFIG } from '../helpers/CONFIG'
import { RESULT_BLOKCHAIN } from '../helpers/RESULT'
import { HIVE_JSONRPC } from '../helpers/HIVE_JSONRPC'

export class BlockchainTester {
  trying = 0

  config!: CONFIG
  usernameRegex!: string
  username: string|null = null

  node?: { url: string, num: number }

  result?: RESULT_BLOKCHAIN

  constructor(config: CONFIG, usernameRegex: string) {
    this.config = config
    this.usernameRegex = usernameRegex

    /** Read the last result file */
    readJson(path.join(path.resolve(path.dirname('')), './results/blockchain.json'), async (err, result) => {
      if(err) {
        console.log('\x1b[31m%s\x1b[0m', `Error: ${err.message}`)
        if (process.env.APP_DEBUG) console.log('\x1b[33m%s\x1b[0m', 'Stack:', err.stack ? err.stack : 'No info')
        process.exit(1)
      } else {
        this.result = result
        this.start({ url: this.config.HIVE_NODES_LIST[0], num: 0 }, result.last_username ? result.last_username : null)
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

  start(node?: { url: string, num: number }, username?: string|null): void {
    this.node = node ? node : { url: this.config.HIVE_NODES_LIST[0], num: 0 }
    if (process.env.APP_DEBUG) console.log(this.node)

    if(username) this.username = username

    /** Start the executor */
    this.executor().catch(e => {
      console.log('\x1b[31m%s\x1b[0m', `Error: ${e.message}`)
      if (process.env.APP_DEBUG) console.log('\x1b[33m%s\x1b[0m', 'Stack:', e.stack ? e.stack : 'No info')

      this.trying++
      if(this.trying === 10) process.exit(1)

      /** Change of HIVE node */
      if (this.node && this.node.num + 1 === this.config.HIVE_NODES_LIST.length) {
        this.node = { url: this.config.HIVE_NODES_LIST[0], num: 0 }
      } else {
        this.node = { url: this.config.HIVE_NODES_LIST[this.node ? this.node.num + 1 : 0], num: this.node ? this.node.num + 1 : 0 }
      }

      if (process.env.APP_DEBUG) console.log(`\x1b[1;BlockchainTester => ${e.message} => Change of node:\x1b[0m ${this.node.url} (${this.node.num})`)
      this.start(this.node, this.username ? this.username : null)
    })
  }

  executor(): Promise<void> {
    return new Promise( async (resolve, reject) => {
      try {
        let fin = false
        while (!fin) {
          try {
            /** Define start hrtime */
            const hrtime = process.hrtime()

            const accounts = await this.getAccounts(this.username ? this.username : 'a')
            if(accounts.length === 1) {
              fin = true
            } else {
              for await (const a of accounts) {
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
            }
          } catch (e) {
            fin = true
            reject(e)
          }
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  getAccounts(username: string): Promise<Array<string>> {
    return new Promise( async (resolve, reject) => {
      try {
        /** Retrieve the account */
        const get_AccountsOptions: AxiosRequestConfig = {
          method: 'post',
          url: this.node?.url,
          headers: {
            'request-startTime': Date.now().toString(),
          },
          data: {
            jsonrpc: "2.0",
            method:  "condenser_api.lookup_accounts",
            params: [username, 1000],
            id: 1
          },
          timeout: this.config.HIVE_NODE_TIMEOUT
        }
        const get_accounts:AxiosResponse<HIVE_JSONRPC> = await axios(get_AccountsOptions)
        assert(get_accounts.data.result, `Error get account ${ get_accounts.data.error ? get_accounts.data.error.message:'' }`)
        resolve(get_accounts.data.result)
      } catch (e) {
        reject(e)
      }
    })
  }
}