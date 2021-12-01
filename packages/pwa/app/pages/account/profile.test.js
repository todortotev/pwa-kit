/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {screen, within} from '@testing-library/react'
import user from '@testing-library/user-event'
import {renderWithProviders} from '../../utils/test-utils'
import AccountDetail from './profile'

jest.mock('../../commerce-api/utils', () => {
    const originalModule = jest.requireActual('../../commerce-api/utils')
    return {
        ...originalModule,
        isTokenValid: jest.fn().mockReturnValue(true)
    }
})

jest.mock('../../commerce-api/hooks/useCustomer', () => {
    const mockCustomer = {
        authType: 'registered',
        customerId: 'registeredCustomerId',
        customerNo: 'testno',
        firstName: 'Tester',
        lastName: 'Testing',
        email: 'test@test.com',
        login: 'test@test.com',
        phoneHome: '1234567890'
    }

    return () => ({
        ...mockCustomer,
        isRegistered: true,
        updatePassword: (data) => {
            mockCustomer.password = data.password
        }
    })
})

// Set up and clean up
beforeEach(() => {
    jest.resetModules()
})

// test('Allows customer to edit profile details', async () => {
//     renderWithProviders(<AccountDetail />)
//     expect(await screen.findByTestId('account-detail-page')).toBeInTheDocument()
//     // expect(await screen.findByTestId('sf-toggle-card-my-profile')).toBeInTheDocument()

//     // const el = within(screen.getByTestId('sf-toggle-card-my-profile'))
//     // user.click(el.getByText(/edit/i))
//     // user.type(el.getByLabelText(/first name/i), 'Geordi')
//     // user.type(el.getByLabelText(/Phone Number/i), '5671235585')
//     // user.click(el.getByText(/save/i))
//     // expect(await screen.findByText('Geordi Tester')).toBeInTheDocument()
//     // expect(await screen.findByText('(567) 123-5585')).toBeInTheDocument()
// })

test('Allows customer to update password', async () => {
    renderWithProviders(<AccountDetail />)
    expect(await screen.findByTestId('account-detail-page')).toBeInTheDocument()

    const el = within(screen.getByTestId('sf-toggle-card-password'))
    user.click(el.getByText(/edit/i))
    user.type(el.getByLabelText(/current password/i), 'Password!12345')
    user.type(el.getByLabelText(/new password/i), 'Password!98765')
    user.click(el.getByText(/Forgot password/i))

    expect(await screen.findByTestId('account-detail-page')).toBeInTheDocument()

    user.click(el.getByText(/save/i))
    expect(await screen.findByText('••••••••')).toBeInTheDocument()
})
