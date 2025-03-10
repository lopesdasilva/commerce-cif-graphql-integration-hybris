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

const { graphql } = require('graphql');
const SchemaBuilder = require('../../common/SchemaBuilder.js');
const Customer = require('./Customer.js');
const SetPaymentMethodOnCart = require('./SetPaymentMethodOnCart.js');
const CreateCustomer = require('./CreateCustomer.js');
const GenerateCustomerToken = require('./GenerateCustomerToken.js');
const RevokeCustomerToken = require('./RevokeCustomerToken.js');
const CustomerCart = require('./CustomerCart.js');
const ChangeCustomerPassword = require('./ChangeCustomerPassword.js');

let cachedSchema = null;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function resolve(args) {
  if (cachedSchema == null) {
    const schemaBuilder = new SchemaBuilder()
      .filterMutationFields(
        new Set([
          'createCustomerV2',
          'generateCustomerToken',
          'revokeCustomerToken',
          'setPaymentMethodOnCart',
          'changeCustomerPassword',
        ])
      )
      .filterQueryFields(new Set(['customer', 'customerCart']));

    cachedSchema = schemaBuilder.build();
  }

  const resolvers = {
    customer: (params, context) => {
      return new Customer({
        graphqlContext: context,
        actionParameters: args,
      });
    },

    customerCart: (params, context) => {
      return new CustomerCart({
        graphqlContext: context,
        actionParameters: args,
      });
    },

    /**
     * method used to create customer in hybris
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    createCustomerV2: (params, context) => {
      const { input } = params;
      return new CreateCustomer({
        input,
        graphqlContext: context,
        actionParameters: args,
      });
    },
    /**
     * method used to generateCustomerToken in hybris
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    generateCustomerToken: context => {
      return new GenerateCustomerToken({
        graphqlContext: context,
        actionParameters: args,
      });
    },

    /**
     * method used to revokeCustomerToken in hybris
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    revokeCustomerToken: (params, context) => {
      return new RevokeCustomerToken({
        graphqlContext: context,
        actionParameters: args,
      });
    },

    /**
     * method used to change customer password in hybris
     * @param params
     * @param context
     * @returns {ChangeCustomerPassword}
     */
    changeCustomerPassword: (params, context) => {
      return new ChangeCustomerPassword({
        params: params,
        graphqlContext: context,
        actionParameters: args,
      });
    },

    /**
     * method used to setPaymentMethodOnCart in hybris
     * @param {Object} params parameter contains input,graphqlContext and actionParameters
     * @param {cachedSchema} context parameter contains the context of the GraphQL Schema
     */
    setPaymentMethodOnCart: (params, context) => {
      const { input } = params;
      return new SetPaymentMethodOnCart({
        input,
        graphqlContext: context,
        actionParameters: args,
      });
    },
  };

  /**
   * The resolver for this action
   * @param {cachedSchema} cachedSchema parameter contains the catched schema of GraphQL
   * @param {Object} query parameter contains the query of GraphQL
   * @param {cachedSchema} resolvers parameter resolvers of the particular action
   * @param {Object} context parameter contains the context of GraphQL
   * @param {cachedSchema} variables parameter contains the variables of GraphQL
   * @param {Object} operationName parameter contains the operationName of GraphQL context.
   * @returns {Promise} a promise resolves and return the response.
   */
  return graphql(
    cachedSchema,
    args.query,
    resolvers,
    args.context,
    args.variables,
    args.operationName
  )
    .then(response => {
      return response;
    })
    .catch(error => {
      console.error(error);
    });
}

module.exports.main = resolve;
