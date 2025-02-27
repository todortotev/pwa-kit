#!/usr/bin/env node
/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable strict */
/* eslint-env node */
'use strict'

const Promise = require('bluebird')
const fs = require('fs')
const mkdir = Promise.promisify(fs.mkdir)
const exec = require('child_process').exec
const rimraf = Promise.promisify(require('rimraf'))

/**
 * Error catcher that will log an error and exit the process
 * @private
 */
const catcher = (message) => (error) => {
    console.log(`${message}: ${error}`)
    process.exit(1)
}

const cleanDist = () => {
    console.log('Cleaning dist/')
    return rimraf('dist/')
        .then(() => mkdir('dist/'))
        .catch(catcher(`Error while cleaning dist/`))
}

const transpileSrc = () => {
    console.log(`Transpiling files in src/ to dist/`)

    const child = exec(
        `npx --no-install babel --root-mode upward src -x ".js",".jsx" --ignore "**/test_fixtures/*","*.test.js","test.js" --out-dir dist --copy-files`
    )

    child.stderr.on('data', (data) => {
        console.log(data)
    })

    child.stdout.on('data', (data) => {
        console.log(data)
    })

    return new Promise((resolve, reject) => {
        child.addListener('error', reject)
        child.addListener('exit', resolve)
    }).catch(catcher('exec error'))
}

cleanDist()
    // Transpile & copy everything under 'src' into 'dist'
    .then(transpileSrc)
    .then(() => console.log('Successfully built!'))
    .catch(catcher('Error in build'))
