/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */
import {
  Component,
  PropTypes,
} from 'react';

import ApolloClient from 'apollo-client';

import invariant = require('invariant');

export interface ProvideClientOptions {
  client: ApolloClient;
  store?: Object;
  as?: string;
  immutable?: boolean;
}

export default function provideClient (options: ProvideClientOptions) {
  invariant(
    options.client,
    'provideClient was not passed a client instance. Make ' +
    'sure you pass in your client via the "client" option.'
  );

  const {
    client,
    store = null,
    as = 'default',
    immutable = false,
  } = options;

  const clientKey = `${as}__client`;
  const storeKey = `${as}__store`;

  return function(WrappedComponent) {
    return class Provider extends Component<any, any> {
      static childContextTypes = {
        [clientKey]: PropTypes.object.isRequired,
        [storeKey]: PropTypes.object.isRequired,
      };

      constructor(props, context) {
        super(props, context);

        // support an immutable store alongside apollo store
        // intialize the built in store if none is passed in
        if (store === null || immutable) {
          client.initStore();
        }

      }

      getChildContext() {
        return {
          [storeKey]: store,
          [clientKey]: client,
        };
      }

      render() {
        return <WrappedComponent {...this.props} />;
      }
    };
  };

}
