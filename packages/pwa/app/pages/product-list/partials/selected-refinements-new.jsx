/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'

// Components
import {Box, Button, Link, Wrap, WrapItem} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'

// Hooks
import useNavigation from '../../../hooks/use-navigation'
import {useSearchParams, stringify as stringifySearchParams} from '../../../hooks/use-search-params'

// Project Components
import {CloseIcon} from '../../../components/icons'

/**
 *
 * @param {*} param0
 * @returns
 */
const SelectedRefinements = ({refinements = [], selectedRefinements = {}, categoryId}) => {
    const navigate = useNavigation()
    const [searchParams] = useSearchParams()
    const resetFilters = () => {
        navigate(window.location.pathname)
    }

    const selectedRefinementValues = Object.keys(selectedRefinements).reduce((acc, curr) => {
        const attributeId = curr
        const value = selectedRefinements[attributeId]
        const values = Array.isArray(value) ? value : [value]

        const refinment = refinements.find((refinement) => refinement.attributeId === attributeId)
        const refinementValues = refinment.values
            .filter(({value}) => {
                return values.includes(value)
            })
            .map((refinementValue) => ({...refinementValue, attributeId}))
        return [...acc, ...refinementValues]
    }, [])

    return (
        <Wrap
            direction="row"
            align="center"
            display="flex"
            flexWrap="wrap"
            data-testid="sf-selected-refinements"
        >
            {selectedRefinementValues.map(({attributeId, label, value}, idx) => {
                return (
                    <WrapItem key={idx}>
                        <Box marginLeft={0} marginRight={1}>
                            <Link
                                as={RouteLink}
                                to={stringifySearchParams(searchParams, {
                                    includePath: true,
                                    toggleRefinement: [attributeId, value]
                                })}
                            >
                                <Button
                                    marginTop={1}
                                    padding={5}
                                    color="black"
                                    colorScheme="gray"
                                    size="sm"
                                    iconSpacing={1}
                                    rightIcon={
                                        <CloseIcon color="black" boxSize={4} mr="-7px" mb="-6px" />
                                    }
                                >
                                    {label}
                                </Button>
                            </Link>
                        </Box>
                    </WrapItem>
                )
            })}

            {selectedRefinementValues.length > 0 && (
                <WrapItem>
                    <Box>
                        <Button
                            padding={{sm: 0, base: 2}}
                            variant="link"
                            size="sm"
                            onClick={resetFilters}
                        >
                            <FormattedMessage defaultMessage="Clear All" />
                        </Button>
                    </Box>
                </WrapItem>
            )}
        </Wrap>
    )
}

SelectedRefinements.propTypes = {
    refinements: PropTypes.array,
    selectedRefinements: PropTypes.object,
    categoryId: PropTypes.string
}

export default SelectedRefinements
