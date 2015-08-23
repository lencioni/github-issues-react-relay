import {Router, Route} from 'react-router';
import BrowserHistory from 'react-router/lib/BrowserHistory';

import Home from './components/Home';
import Issue from './components/Issue';

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

const IssueQueries = {
  issue: (Component) => Relay.QL`
    query {
      issue {
        ${Component.getFragment('issue')},
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
        component={Home}
        queries={HomeQueries}
      />
      <Route
        name='issue'
        path='/issues/:id'
        component={Issue}
        queries={IssueQueries}
      />
    </Route>
  </Router>,
  document.getElementById('root')
);
