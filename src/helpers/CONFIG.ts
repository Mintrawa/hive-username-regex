import joi from 'joi'

export type CONFIG = {
  HIVE_NODES_LIST:             string[]
  HIVE_NODE_TIMEOUT:           number
  NUMBER_USERNAME_TO_GENERATE: number
}

const schemaConfig = joi.object({
  HIVE_NODES_LIST:             joi.array().items(joi.string()).required(),
  HIVE_NODE_TIMEOUT:           joi.number().integer().min(1).required(),
  NUMBER_USERNAME_TO_GENERATE: joi.number().integer().min(1).required(),
})

export const isConfigValid = (source: CONFIG): Promise<CONFIG> => {
  return new Promise(async (resolve, reject) => {
    try {
      const check: CONFIG = await schemaConfig.validateAsync(source)
      resolve(check)
    } catch (e) {
      reject(e)
    }
  })
}