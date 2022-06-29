export type HIVE_JSONRPC = {
  jsonrpc: string
  id:      number|string
  result?: Array<string>
  error?: {
    code:    number
    message: string
    data?:   unknown
  } 
}