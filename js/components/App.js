var Issue = require('./Issue');

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Issues</h1>
        {this.props.repo.issues.edges.map(issue =>
          <Issue issue={issue.node} key={issue.node.id} />
        )}
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    repo: () => Relay.QL`
      fragment on Repo {
        id,
        issues(first: 10) {
          edges {
            node {
              ${Issue.getFragment('issue')},
            },
          },
        },
      }
    `,
  },
});
