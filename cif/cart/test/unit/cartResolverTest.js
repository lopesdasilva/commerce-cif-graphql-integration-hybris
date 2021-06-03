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
const chai = require('chai');
const chaiShallowDeepEqual = require('chai-shallow-deep-equal');
const nock = require('nock');
chai.use(chaiShallowDeepEqual);
const { expect } = chai;
const bearer = 'aaa58f85-d5f5-4303-8a53-272f1868325f';
const resolve = require('../../src/cartResolver.js').main;
const hybrisCartData = require('../resources/hybrisCartQuery.json');
const hybrisCartQueryWithVoucher = require('../resources/hybrisCartQueryWithVoucher.json');
const hybrisDeliveryModes = require('../resources/hybrisDeliveryModes.json');
const hybrisEmptyDeliveryModes = require('../resources/hybrisEmptyDeliveryModes.json');
const validCartQueryData = require('../resources/validCartQueryResponse.json');
const validCartQueryWithVoucherResponse = require('../resources/validCartQueryWithVoucherResponse.json');
const cartNotFound = require('../resources/cartNotFound.json');
const TestUtils = require('../../../utils/TestUtils.js');
const ymlData = require('../../../common/options.json');
describe('Cart Resolver', function() {
  const scope = nock(`${ymlData.HB_PROTOCOL}://${ymlData.HB_API_HOST}`);

  before(() => {
    // Disable console debugging
    sinon.stub(console, 'debug');
    sinon.stub(console, 'error');
  });

  after(() => {
    console.debug.restore();
    console.error.restore();
  });

  describe('Unit Tests', () => {
    let args = {
      url: TestUtils.getHybrisInstance(),
      context: {
        settings: {
          bearer: '',
          customerId: 'current',
          HB_PROTOCOL: ymlData.HB_PROTOCOL,
          HB_API_HOST: ymlData.HB_API_HOST,
          HB_API_BASE_PATH: ymlData.HB_API_BASE_PATH,
          HB_BASESITEID: ymlData.HB_BASESITEID,
        },
      },
    };

    // todo this unit test can be broken down into several ones as cart returns lot of data and it would we nice to have the title of the tests for that data
    // todo for example : Cart query with valid voucher data -- Done
    it('Mutation: Cart query unit', () => {
      scope
        .get(
          `${ymlData.HB_API_BASE_PATH}electronics/users/current/carts/00000035`
        )
        .query({ fields: 'FULL', query: '' })
        .reply(200, hybrisCartData);
      scope
        .get(
          `${ymlData.HB_API_BASE_PATH}electronics/users/current/carts/00000035/deliverymodes`
        )
        .query({ fields: 'FULL', query: '' })
        .reply(200, hybrisDeliveryModes);
      args.context.settings.bearer = bearer;
      args.query =
        '{cart(cart_id: "00000035") {email,billing_address {city,country {code,label},firstname,lastname,postcode, region {code,label},street,telephone},shipping_addresses{firstname,lastname,street,city,region{code,label},country{code,label},available_shipping_methods{amount{currency,value},available,carrier_code,carrier_title,error_message,method_code,method_title,price_excl_tax{value,currency},price_incl_tax{value,currency}},selected_shipping_method{amount{value,currency},carrier_code,carrier_title,method_code,method_title}},items{uid,product{name,sku},quantity},available_payment_methods{code,title},selected_payment_method{code,title},applied_coupon{code},prices{grand_total{value,currency}}}}';
      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data.cart;
        expect(response).to.deep.equals(validCartQueryData.cart);
      });
    });

    it('Mutation: Cart query unit with voucher data', () => {
      scope
        .get(
          `${ymlData.HB_API_BASE_PATH}electronics/users/current/carts/00000035`
        )
        .query({ fields: 'FULL', query: '' })
        .reply(200, hybrisCartQueryWithVoucher);
      scope
        .get(
          `${ymlData.HB_API_BASE_PATH}electronics/users/current/carts/00000035/deliverymodes`
        )
        .query({ fields: 'FULL', query: '' })
        .reply(200, hybrisEmptyDeliveryModes);
      args.context.settings.bearer = bearer;
      args.query =
        '{cart(cart_id: "00000035") {email,billing_address {city,country {code,label},firstname,lastname,postcode, region {code,label},street,telephone},shipping_addresses{firstname,lastname,street,city,region{code,label},country{code,label},available_shipping_methods{amount{currency,value},available,carrier_code,carrier_title,error_message,method_code,method_title,price_excl_tax{value,currency},price_incl_tax{value,currency}},selected_shipping_method{amount{value,currency},carrier_code,carrier_title,method_code,method_title}},items{uid,product{name,sku},quantity},available_payment_methods{code,title},selected_payment_method{code,title},applied_coupon{code},prices{grand_total{value,currency}}}}';
      return resolve(args).then(result => {
        assert.isUndefined(result.errors);
        let response = result.data.cart;
        expect(response).to.deep.equals(validCartQueryWithVoucherResponse.cart);
      });
    });

    it('Mutation: Cart query invalid cart id', () => {
      scope
        .get(
          `${ymlData.HB_API_BASE_PATH}electronics/users/current/carts/INVALID-CART-ID`
        )

        .query({ fields: 'FULL', query: '' })
        .reply(400, cartNotFound);
      scope
        .get(
          `${ymlData.HB_API_BASE_PATH}electronics/users/current/carts/INVALID-CART-ID/deliverymodes`
        )
        .query({ fields: 'FULL', query: '' })
        .reply(200, hybrisDeliveryModes);
      args.context.settings.bearer = bearer;
      args.query =
        '{cart(cart_id: "INVALID-CART-ID") {email,billing_address {city,country {code,label},firstname,lastname,postcode, region {code,label},street,telephone},shipping_addresses{firstname,lastname,street,city,region{code,label},country{code,label},available_shipping_methods{amount{currency,value},available,carrier_code,carrier_title,error_message,method_code,method_title,price_excl_tax{value,currency},price_incl_tax{value,currency}},selected_shipping_method{amount{value,currency},carrier_code,carrier_title,method_code,method_title}},items{id,product{name,sku},quantity},available_payment_methods{code,title},selected_payment_method{code,title},applied_coupon{code},prices{grand_total{value,currency}}}}';
      return resolve(args).then(result => {
        const errors = result.errors[0];
        expect(errors).shallowDeepEqual({
          message: 'Request failed with status code 400',
          source: {
            name: 'GraphQL request',
          },
        });
      });
    });
  });
});
