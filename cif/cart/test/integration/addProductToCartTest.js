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

const sinon = require('sinon');
const assert = require('chai').assert;

const resolve = require('.././../src/cartResolver.js').main;
const TestUtils = require('../../../utils/TestUtils.js');

describe('AddProductToCart', () => {
  before(() => {
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Integration Tests', () => {
    let args = {
      url: 'https://hybris.example.com',
      context: {
        settings: {
          bearer: '',
          customerId: 'current',
        },
      },
    };

    it('Add products to cart', () => {
      args.query =
        'mutation {addSimpleProductsToCart(input:{cart_id: "00000000", cart_items: [{data: {quantity: 1, sku: "3514521" } }]}){cart {items {id,product { name,sku },quantity} }}}';
      return TestUtils.getBearer().then(accessToken => {
        args.context.settings.bearer = accessToken;
        return resolve(args).then(result => {
          assert.isUndefined(result.errors);
        });
      });
    });
  });
});
