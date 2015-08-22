export default class extends Relay.Route {
  static path = '/';
  static queries = {
    repo: (Component) => Relay.QL`
      query {
        repo {
          ${Component.getFragment('repo')},
        },
      }
    `,
  };
  static routeName = 'AppHomeRoute';
}
