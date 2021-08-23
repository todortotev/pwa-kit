/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {useLocation} from 'react-router-dom'
import queryString from 'query-string'

// Others
import rfdc from 'rfdc'

// Constants
import {DEFAULT_SEARCH_PARAMS} from '../constants'

const clone = rfdc()

const PARSE_OPTIONS = {
    parseBooleans: true
}

/*
 * This hook will return all the location search params pertinant
 * to the product list page.
 */
export const useSearchParams = (searchParams = DEFAULT_SEARCH_PARAMS) => {
    const {search} = useLocation()

    // Encode the search query, including preset values.
    const searchParamsObject = {
        ...searchParams,
        ...parse(search.substring(1))
    }

    return [searchParamsObject, {stringify, parse}]
}

/**
 * Encode's the provided search parameters object, paying special attention to ensure
 * that the child `refine` object is alway encoded correctly.
 *
 * @param {Object} searchParams
 * @param {Object} opts
 * @param {Boolean} opts.includePath
 * @param {Array} opts.toggleRefinement - Refinment value to add to the stringified params
 * @returns
 */
export const stringify = (searchParams, opts = {}) => {
    const {includePath = false, toggleRefinement = {}} = opts
    const {pathname} = useLocation()

    let searchParamsStr
    let searchParamsCopy

    // Get a copy of the current searchParams toggling the provided refinement/value tupal
    searchParamsCopy = getModifiedSearchParams(searchParams, toggleRefinement)

    // "stringify" the nested refinements
    searchParamsCopy.refine = Object.keys(searchParamsCopy.refine).map((key) =>
        queryString.stringify(
            {[key]: searchParamsCopy.refine[key]},
            {
                arrayFormat: 'separator',
                arrayFormatSeparator: '|',
                encode: false
            }
        )
    )

    // "stringify" the entire object
    searchParamsStr = `${includePath ? pathname : ''}?${queryString.stringify(searchParamsCopy)}`

    return searchParamsStr
}

/**
 * Decode's the provided query string representation of a search parameter object, paying
 * special attention to also decode the 'refine' object.
 *
 * @param {Object} searchParamsStr
 * @param {Boolean} parseRefine - opt out of parsing the inner refine object.
 * @returns
 */
export const parse = (searchParamsStr, parseRefine = true) => {
    const params = queryString.parse(searchParamsStr, PARSE_OPTIONS)

    // Ensure the refinments is an array (make it easier to manipulate).
    params.refine = Array.isArray(params.refine) ? params.refine : [params.refine]

    // Parse the nested refinement entries.
    if (parseRefine) {
        params.refine = params.refine.reduce((acc, curr) => {
            return {
                ...acc,
                ...queryString.parse(curr, {
                    ...PARSE_OPTIONS,
                    arrayFormat: 'separator',
                    arrayFormatSeparator: '|'
                })
            }
        }, {})
    }

    return params
}

const getModifiedSearchParams = (searchParams, refinementValue) => {
    console.log('refinementValue: ', searchParams, refinementValue)

    let newSearchParams = clone(searchParams)

    const [attibuteId, value] = refinementValue

    // Add the new attribute value
    let attributeValue = newSearchParams.refine[`${attibuteId}`]

    //  We already have a selection.
    if (value) {
        if (Array.isArray(attributeValue)) {
            // If it's an array determine if we are adding or removing.

            if (attributeValue.includes(value)) {
                newSearchParams.refine[`${attibuteId}`] = newSearchParams.refine[
                    `${attibuteId}`
                ].filter((v) => v !== value)
            } else {
                newSearchParams.refine[`${attibuteId}`].push(value)
            }
        } else {
            // We have a value, we need to know if we are clearing it
            // or adding to it by creating an array.
            if (attributeValue === value) {
                delete newSearchParams.refine[`${attibuteId}`]
            } else {
                newSearchParams.refine = {
                    ...newSearchParams.refine,
                    [`${attibuteId}`]: [attributeValue, value]
                }
            }
        }
    } else {
        // This is a new value, simply add it to the refinements.
        newSearchParams.refine = {
            ...newSearchParams.refine,
            [`${attibuteId}`]: value
        }
    }

    return newSearchParams
}
