/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {renderWithProviders} from '../../utils/test-utils'
import user from '@testing-library/user-event'
import {screen, waitFor} from '@testing-library/react'
import SearchInput from './index'
import Suggestions from './partials/suggestions'
import {noop} from '../../utils/utils'
import useSearchSuggestions from '../../commerce-api/hooks/useSearchSuggestions'
import mockSearchResults from '../../commerce-api/mocks/searchResults'

jest.mock('../../commerce-api/utils', () => {
    const originalModule = jest.requireActual('../../commerce-api/utils')
    return {
        ...originalModule,
        isTokenValid: jest.fn().mockReturnValue(true)
    }
})

jest.mock('../../commerce-api/hooks/useSearchSuggestions')
jest.mock('lodash.debounce', () => jest.fn((fn) => fn))

beforeEach(() => {
    useSearchSuggestions.mockReset()
})

// test('renders SearchInput', () => {
//     renderWithProviders(<SearchInput />)
//     const searchInput = document.querySelector('input[type="search"]')
//     expect(searchInput).toBeInTheDocument()
// })

test('getSearchSuggestions is called when input changes', async () => {
    const searchTerm = 'Dresses'
    const mock = jest.fn()
    useSearchSuggestions.mockImplementation(() => ({
        results: {},
        getSearchSuggestions: mock,
        clearSuggestedSearch: jest.fn()
    }))
    renderWithProviders(<SearchInput />)
    const searchInput = document.querySelector('input[type="search"]')
    await user.type(searchInput, searchTerm)
    expect(mock).toHaveBeenCalledWith(searchTerm)
})

test('renders Popover if recent searches populated', async () => {
    const searchTerm = 'Dresses'
    // This is NOT working, we need to find a way to
    // mock useRef!
    // const useRefSpy = jest
    //     .spyOn(React, 'useRef')
    //     .mockReturnValueOnce({current: {value: searchTerm}})

    useSearchSuggestions.mockImplementation(() => ({
        results: mockSearchResults,
        getSearchSuggestions: jest.fn(),
        clearSuggestedSearch: jest.fn()
    }))
    renderWithProviders(<SearchInput />)
    const searchInput = document.querySelector('input[type="search"]')
    await user.type(searchInput, searchTerm)
    // expect(await screen.findByTestId('sf-suggestion')).toBeInTheDocument()
    const countOfSuggestions = await screen.findAllByText(searchTerm)
    expect(countOfSuggestions.length).toEqual(2)
})

// test('getSearchSuggestions is called when input changes', async () => {
//     expect(useSearchSuggestions.getSearchSuggestions).toBeCalled()
// })

// test('changes url when enter is pressed', async () => {
//     renderWithProviders(<SearchInput />)
//     const searchInput = document.querySelector('input[type="search"]')
//     await user.type(searchInput, 'Dresses{enter}')
//     await waitFor(() => expect(window.location.pathname).toEqual('/en-GB/search'))
//     await waitFor(() => expect(window.location.search).toEqual('?q=Dresses'))
// })

// test('shows previously searched items when focused', async () => {
//     renderWithProviders(<SearchInput />)
//     const searchInput = document.querySelector('input[type="search"]')
//     user.clear(searchInput)
//     await searchInput.focus()
//     const countOfSuggestions = await screen.findAllByText('Recent Searches')
//     expect(countOfSuggestions.length).toEqual(2)
// })

// test('suggestions render when there are some', async () => {
//     renderWithProviders(<SearchInput />)
//     const searchInput = document.querySelector('input[type="search"]')
//     await user.type(searchInput, 'Dress')
//     const countOfSuggestions = await screen.findAllByText('Dress')
//     expect(countOfSuggestions.length).toEqual(2)
// })

// test('clicking clear searches clears searches', async () => {
//     renderWithProviders(<SearchInput />)
//     const searchInput = document.querySelector('input[type="search"]')
//     await searchInput.focus()
//     const clearSearch = document.getElementById('clear-search')
//     await user.click(clearSearch)
//     expect(await screen.findByTestId('sf-suggestion-popover')).toBeInTheDocument()
// })

// test('passing undefined to Suggestions returns undefined', async () => {
//     const suggestions = renderWithProviders(
//         <Suggestions suggestions={undefined} closeAndNavigate={noop} />
//     )
//     expect(suggestions.innerHTML).not.toBeDefined()
// })
