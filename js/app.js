import {Router, Route} from 'react-router';
import BrowserHistory from 'react-router/lib/BrowserHistory';

import App from './components/App';

function createRelayContainer(Component, props) {
  if (Relay.isContainer(Component)) {
    const { name, queries } = props.route;
    const { params } = props;

    return (
      <Relay.RootContainer
        Component={Component}
        route={{name, params, queries}}
      />
    );
  } else {
    return <Component {...props}/>;
  }
}

const HomeQueries = {
  repo: (Component) => Relay.QL`
    query {
      repo {
        ${Component.getFragment('repo')},
      },
    }
  `,
};

React.render(
  <Router history={new BrowserHistory()} createElement={createRelayContainer}>
    <Route>
      <Route
        name='home'
        path='/'
        component={App}
        queries={HomeQueries}
      />
    </Route>
  </Router>,
  document.getElementById('root')
);
