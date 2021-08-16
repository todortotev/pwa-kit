import {nanoid} from 'nanoid'
import {encode as base64encode} from 'base64-arraybuffer'

// Server Side
const crypto = require('crypto')
const base64url = require('base64url')
const randomstring = require('randomstring')

// Creates Code Verifier
export const createCodeVerifier = () => nanoid(128)

// Creates Code Challenge based on Code Verifier
export const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    const base64Digest = base64encode(digest)
    // you can extract this replacing code to a function
    return base64Digest
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}

export const createCodeVerifierServer = () => randomstring.generate(128)

export const generateCodeChallengeServer = async (codeVerifier) => {
    const base64Digest = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64')

    return base64url.fromBase64(base64Digest)
}
