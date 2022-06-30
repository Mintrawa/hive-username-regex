export type RESULT_BLOKCHAIN = {
  last_username: string

  nb_tested: number
  nb_passed: number
  nb_error:  number

  list_not_passed: string[]
}

export type RESULT_FILE = {
  last_username: string

  nb_tested: number
  nb_passed: number
  nb_error:  number

  list_not_passed: string[]
  list_passed: string[]
}