/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'

// Chakra Components
import {
    Box,
    Checkbox,
    Text,
    Stack,
    Divider,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Link,
    Radio,
    RadioGroup
} from '@chakra-ui/react'

// Project Components
import SwatchGroup from '../../../components/swatch-group'
import Swatch from '../../../components/swatch-group/swatch'

// Hooks
import {useHistory} from 'react-router-dom'
import {useSearchParams, stringify as stringifySearchParams} from '../../../hooks/use-search-params'

// Others
import rfdc from 'rfdc'

// TODO: This is only temporary.
const SUPPORTED_REFINEMENTS = ['cgid', 'c_isNew', 'c_refinementColor', 'c_size', 'price']

const SWATCH_VARIENT_MAP = {
    c_isNew: {
        type: 'checkbox'
    },
    c_refinementColor: {
        showLabel: false,
        useBackgroundColor: true,
        type: 'swatch',
        variant: 'circle'
    },
    c_size: {
        showLabel: false,
        useBackgroundColor: false,
        type: 'swatch',
        varient: 'square'
    },
    cgid: {
        type: 'link'
    },
    price: {
        type: 'radio'
    }
}

const clone = rfdc()

// By default we are expanding all the refinements. Feel free to rewrite this
// function in another way to suit your needs.
const getExpandedRefinements = (refinements = []) => {
    const indexes = refinements
        .filter(({attributeId}) => {
            return SUPPORTED_REFINEMENTS.includes(attributeId)
        })
        .map((_, index) => index)

    return indexes
}

// TODO: Do some serious cleanup on this function
const buildUrl = (searchParams, attibuteId, value) => {
    let newSearchParams = clone(searchParams)

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

    return stringifySearchParams(newSearchParams, true)
}
const Refinements = ({refinements = []}) => {
    const history = useHistory()
    const [searchParams] = useSearchParams()

    return (
        <Stack spacing={8}>
            <Accordion
                allowMultiple={true}
                allowToggle={true}
                reduceMotion={true}
                defaultIndex={getExpandedRefinements(refinements)}
            >
                {refinements.map((refinement, idx) => {
                    const {attributeId, label, values} = refinement
                    if (!SUPPORTED_REFINEMENTS.includes(attributeId)) {
                        return
                    }

                    const swatchConfig = SWATCH_VARIENT_MAP[attributeId]

                    return (
                        <Stack key={attributeId} divider={<Divider />}>
                            <AccordionItem
                                paddingTop={idx !== 0 ? 6 : 0}
                                borderBottom="none"
                                borderTop={idx === 0 && 'none'}
                            >
                                <AccordionButton paddingTop={0}>
                                    <Text flex="1" textAlign="left" fontSize="sm" fontWeight="bold">
                                        {label}
                                    </Text>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel paddingLeft={0} paddingBottom={6}>
                                    {/* Attributes rendered with swatches. */}
                                    {swatchConfig.type === 'swatch' && (
                                        <SwatchGroup
                                            key={attributeId}
                                            onChange={(_, href) => {
                                                if (!href) return
                                                history.replace(href)
                                            }}
                                            variant={swatchConfig.variant}
                                            value={searchParams.refine[attributeId]}
                                        >
                                            {values
                                                .filter(({hitCount}) => !!hitCount)
                                                .map(({hitCount, label, value}) => (
                                                    <Swatch
                                                        key={value}
                                                        href={buildUrl(
                                                            searchParams,
                                                            attributeId,
                                                            value
                                                        )}
                                                        disabled={!hitCount}
                                                        value={value}
                                                        name={label}
                                                    >
                                                        {swatchConfig.useBackgroundColor ? (
                                                            <Box
                                                                height="100%"
                                                                width="100%"
                                                                minWidth="32px"
                                                                backgroundRepeat="no-repeat"
                                                                backgroundSize="cover"
                                                                backgroundColor={value.toLowerCase()}
                                                            />
                                                        ) : (
                                                            label
                                                        )}
                                                    </Swatch>
                                                ))}
                                        </SwatchGroup>
                                    )}

                                    {/* Attributes rendered as links. */}
                                    {/* TODO: user category url builder. */}
                                    {swatchConfig.type === 'link' && (
                                        <Stack spacing={1}>
                                            {values.map((value) => {
                                                return (
                                                    <Link
                                                        display="flex"
                                                        alignItems="center"
                                                        lineHeight={{base: '44px', lg: '24px'}}
                                                        key={value.value}
                                                        href={`/category/${value.value}`}
                                                        useNavLink
                                                    >
                                                        {value.label}
                                                    </Link>
                                                )
                                            })}
                                        </Stack>
                                    )}

                                    {/* Attributes rendered as a radio group. */}
                                    {swatchConfig.type === 'radio' && (
                                        <RadioGroup
                                            onChange={(href) => {
                                                history.replace(href)
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                {values
                                                    .filter(({hitCount}) => hitCount > 0)
                                                    .map(({label, value}) => {
                                                        return (
                                                            <Box key={value}>
                                                                <Radio
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    height={{
                                                                        base: '44px',
                                                                        lg: '24px'
                                                                    }}
                                                                    fontSize="sm"
                                                                    value={buildUrl(
                                                                        searchParams,
                                                                        attributeId,
                                                                        value
                                                                    )}
                                                                >
                                                                    <Text
                                                                        marginLeft={-1}
                                                                        fontSize="sm"
                                                                    >
                                                                        {label}
                                                                    </Text>
                                                                </Radio>
                                                            </Box>
                                                        )
                                                    })}
                                            </Stack>
                                        </RadioGroup>
                                    )}

                                    {/* Attributes renders as checkboxes */}
                                    {/* The falsey value should not show in the url. */}
                                    {swatchConfig.type === 'checkbox' && (
                                        <Stack spacing={1}>
                                            <Box>
                                                <Checkbox
                                                    name={attributeId}
                                                    isChecked={!!searchParams.refine[attributeId]}
                                                    value={buildUrl(
                                                        searchParams,
                                                        attributeId,
                                                        !searchParams.refine[attributeId]
                                                    )}
                                                    onChange={(e) => {
                                                        const href = e.target.value

                                                        history.replace(href)
                                                    }}
                                                >
                                                    {label}
                                                </Checkbox>
                                            </Box>
                                        </Stack>
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                        </Stack>
                    )
                })}
            </Accordion>
        </Stack>
    )
}

Refinements.propTypes = {
    refinements: PropTypes.array,
    toggleFilter: PropTypes.func,
    selectedRefinements: PropTypes.object,
    isLoading: PropTypes.bool
}

export default Refinements
