
import * as React from 'react';
import { shallow } from 'enzyme';
import { createStore, compose } from 'redux';

declare function require(name: string);
import * as TestUtils from 'react-addons-test-utils';

import ApolloClient from 'apollo-client';

import provideClient  from '../../../src/provideClient';

describe('provideClient HoC', () => {

  const MyRoot = ({ children }) => children;

  class Child extends React.Component<any, any> {
    static contextTypes: React.ValidationMap<any> = {
      default__client: React.PropTypes.object.isRequired,
      default__store: React.PropTypes.object.isRequired,
      extraClient__client: React.PropTypes.object.isRequired,
      extraClient__store: React.PropTypes.object.isRequired,
    };

    render() {
      return <div className="child" />
    }
  }

  const client = new ApolloClient();
  const extraClient = new ApolloClient();
  const store = createStore(() => ({}));
  const extraStore = createStore(() => ({}));

  const MultiStoreProvider = compose(
    provideClient({ client, store }),
    provideClient({ client: extraClient, store: extraStore, as: 'extraClient' }),
  )(MyRoot)

  it('should render wrapped component', () => {
    const wrapper = shallow(
      <MultiStoreProvider>
        <div className='unique'/>
      </MultiStoreProvider>
    );

    expect(wrapper.contains(<div className='unique'/>)).toBe(true);
  });

  it('should add the clients and stores to the child context', () => {
    const tree = TestUtils.renderIntoDocument(
      <MultiStoreProvider>
        <Child />
      </MultiStoreProvider>
    ) as React.Component<any, any>;

    const child = TestUtils.findRenderedComponentWithType(tree, Child);
    expect(child.context.default__client).toEqual(client);
    expect(child.context.default__store).toEqual(store);
    expect(child.context.extraClient__client).toEqual(extraClient);
    expect(child.context.extraClient__store).toEqual(extraStore);
  });

  it('should require a client', () => {
    const originalConsoleError = console.error;
    console.error = () => {};
    expect(() => {
      provideClient({ client: undefined })
    }).toThrowError(
      'provideClient was not passed a client instance. Make ' +
      'sure you pass in your client via the "client" option.'
    );
    console.error = originalConsoleError;
  });

  it('should not require a store', () => {
    provideClient({ client: client, store: undefined })
  });

});
