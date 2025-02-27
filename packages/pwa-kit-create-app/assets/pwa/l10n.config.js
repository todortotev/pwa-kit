/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const pkgLocalizationConfig = {
    l10n: {
        supportedCurrencies: ['USD'],
        defaultCurrency: 'USD',
        supportedLocales: [
            {
                id: 'en-US',
                preferredCurrency: 'USD'
            }
        ],
        defaultLocale: 'en-US'
    }
}

module.exports = {
    pkgLocalizationConfig
}
