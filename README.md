# The HIVE username Regex checker

An interactive command-line user interface ([inquirer](https://github.com/SBoudrias/Inquirer.js)) allowing you to enter your own Regex with the possibility to test all existing HIVE usernames or an auto-generated file containing a list of usernames (Array of strings).

## Getting Started

### Installation

clone the repository

```bash
$  git clone https://github.com/Mintrawa/hive-username-regex
```

install the librairie

```bash
$  cd hive-username-regex && npm install
```

### Configuration

Copy the `./config/default.config.json` file to `./config/config.json` and add/modify the values in the copied file.

- HIVE_NODES_LIST: list of HIVE blockchain rpc node you want to use (failover)
- HIVE_NODE_TIMEOUT: timeout for HIVE blockchain rpc node (ms)
- NUMBER_USERNAME_TO_GENERATE: number of username to generate (file tester)

### Start the tester

use the command `npm start` and answer the question

```
? Run in debug mode? (y/N)
```
if you want more information through the console (default `false`)

```
? What username regex would you like to test?
```
Put one or use the default (cf: https://ecency.com/hive-139531/@mintrawa/hive-username-regex-checker)

```
? Reinit last HIVE blockchain results? (y/N)
```
if you want to reset the results of the previous test against all the usernames of the HIVE blockchain (default `false`)

```
? Test all usernames in the HIVE blockchain? (Y/n)
```
if you want to test your regex against all the usernames of the HIVE blockchain (default `true`)

```
? Reinit last File results? (y/N)
```
if you want to reset the results of the previous test against all the usernames of the auto-generated file (default `false`)

```
? Generate a username file? (y/N)
```
if you want to generate a `usernames.json` file (random username) in `./config/` directory (default `false`)

```
? Test the file generated? (y/N)
```
if you want to test your regex against all the usernames of the auto-generated username file, the number depending on the value of `NUMBER_USERNAME_TO_GENERATE` in `config.json` file (default `false`)

### Results

The results are located in `results` folder. For the regex against all the usernames of the HIVE blockchain, the file is `blockchain.json` and for the regex against all the usernames of the auto-generated username the file is `file.json`

ex of results:
```
{
  "last_username": "zzzzzzzzzzzzzzzz",
  "nb_tested": 33044,
  "nb_passed": 33044,
  "nb_error": 0,
  "list_not_passed": []
}
```

### The auto generated username file

Usage of [chanceJS](https://github.com/chancejs/chancejs) to create random username

```
let username = this.chance.character({ pool: 'abcdefghijklmnopqrstuvwxyz0123456789.-' })
for (let index = 0; index < this.chance.integer({ min: 3, max: 16 }); index++) {
  username += this.chance.character({ pool: 'abcdefghijklmnopqrstuvwxyz0123456789.-' })
}
```

## Contributing

Pull requests for new features, bug fixes, and suggestions are welcome!

## License

Copyright (C) 2022  @mintrawa (https://hive.blog/@mintrawa)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.