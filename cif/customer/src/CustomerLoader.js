/*******************************************************************************
 *
 *    Copyright 2019 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const DataLoader = require('dataloader');
const rp = require('request-promise');

class CustomerLoader {
  constructor(actionParameters) {
    let loadingFunction = keys => {
      return Promise.resolve(
        keys.map(key => {
          console.debug(`--> Fetching customer with id ${key}`);
          return this.getCustomer(actionParameters).catch(error => {
            console.error(
              `Failed loading customer ${key}, got error ${JSON.stringify(
                error,
                null,
                0
              )}`
            );
            return null;
          });
        })
      );
    };

    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  load(keys) {
    return this.loader.load(keys);
  }

  getCustomer(actionParameters) {
    // eslint-disable-line no-unused-vars

    const {
      customerId,
      bearer,
      HB_API_BASE_PATH,
      HB_API_HOST,
      HB_PROTOCOL,
      HB_BASESITEID,
    } = actionParameters.context.settings;

    return rp({
      uri: `${HB_PROTOCOL}://${HB_API_HOST}${HB_API_BASE_PATH}${HB_BASESITEID}/users/${customerId}?fields=DEFAULT&access_token=${bearer}`,
      json: true,
    })
      .then(response => response)
      .catch(error => error);
  }
}

module.exports = CustomerLoader;
