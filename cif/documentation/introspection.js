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

const magentoSchema = require('../resources/magento-schema-2.4.2.pruned.min.json');
const { buildClientSchema, graphql } = require('graphql');

function resolve(args) {
  const schema = buildClientSchema(magentoSchema.data);

  return graphql(
    schema,
    args.query,
    {},
    {},
    args.variables,
    args.operationName
  ).then(response => {
    return {
      body: response,
    };
  });
}

module.exports.main = resolve;
