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

class RevokeCustomerTokenLoader {
  /**
   * @param {Object} [actionParameters] Some optional parameters of the I/O Runtime action, like for example customerId, bearer token, query and url info.
   */
  constructor(actionParameters) {
    // The loading function: "input" is an Array of parameters
    let loadingFunction = inputs => {
      return Promise.resolve(
        inputs.map(() => {
          // This loader loads each inputs one by one, but if the 3rd party backend allows it,
          // it could also fetch all inputs in one single request. In this case, the method
          // must still return an Array of inputs with the same order as the input.
          return this._generateCustomerToken(actionParameters).catch(error => {
            throw new Error(error.message);
          });
        })
      );
    };
    this.loader = new DataLoader(keys => loadingFunction(keys));
  }

  /**
   * method used to call the loadingFunction using dataloader
   * @returns {Promise} a promise return refresh token after resolved successfully other wise return the error.
   */
  load() {
    return this.loader.load(1);
  }

  /**
   * @param {Object} actionParameters Some parameters of the I/O action itself (e.g. backend server URL, authentication info, etc)
   * @returns {Promise} return refresh token if promise resolves successfully otherwise return error
   */
  _generateCustomerToken(actionParameters) {
    const {
      bearer,
      HB_OAUTH_PATH,
      HB_CLIENTID,
      HB_CLIENTSECRET,
      HB_API_HOST,
      HB_PROTOCOL,
    } = actionParameters.context.settings;

    let body = {
      grant_type: 'refresh_token',
      client_secret: HB_CLIENTSECRET,
      client_id: HB_CLIENTID,
      refresh_token: bearer,
    };

    const bodyParams = Object.keys(body)
      .map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(body[key]);
      })
      .join('&');

    return rp({
      method: 'POST',
      uri: `${HB_PROTOCOL}://${HB_API_HOST}${HB_OAUTH_PATH}?operationType=oAuth`,
      json: true,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams,
    })
      .then(response => response)
      .catch(err => {
        throw new Error(err.message);
      });
  }
}

module.exports = RevokeCustomerTokenLoader;
